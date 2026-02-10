import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { db, listing } from "@DeshGhuri/db";
import { eq, and, desc } from "drizzle-orm";
import { requireSeller } from "@/middleware/seller-auth";
import { nanoid } from "nanoid";

const app = new Hono();

// Apply seller authentication to ALL routes
app.use("*", requireSeller);

/**
 * GET /api/seller/listings
 * Get all listings for the authenticated seller
 * Query params:
 * - status: Filter by listing status (draft, pending-review, active, paused, rejected)
 */
app.get("/", async (c) => {
  const sellerId = c.get("sellerId") as string;
  const statusFilter = c.req.query("status");

  try {
    // Build WHERE conditions
    const conditions = [eq(listing.sellerId, sellerId)];

    // Add status filter if provided
    if (statusFilter) {
      conditions.push(eq(listing.status, statusFilter));
    }

    const listings = await db.query.listing.findMany({
      where: and(...conditions),
      orderBy: [desc(listing.createdAt)],
    });

    return c.json({
      success: true,
      data: listings,
      count: listings.length,
    });
  } catch (error) {
    console.error("Error fetching seller listings:", error);
    throw new HTTPException(500, { message: "Failed to fetch listings" });
  }
});

/**
 * GET /api/seller/listings/:listingId
 * Get a specific listing (with ownership check)
 */
app.get("/:listingId", async (c) => {
  const sellerId = c.get("sellerId") as string;
  const listingId = c.req.param("listingId");

  try {
    const listingRecord = await db.query.listing.findFirst({
      where: and(
        eq(listing.id, listingId),
        eq(listing.sellerId, sellerId) // Ownership check
      ),
    });

    if (!listingRecord) {
      throw new HTTPException(404, {
        message: "Listing not found or you don't have permission to access it",
      });
    }

    return c.json({
      success: true,
      data: listingRecord,
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error fetching listing:", error);
    throw new HTTPException(500, { message: "Failed to fetch listing" });
  }
});

/**
 * POST /api/seller/listings
 * Create a new listing
 */
app.post("/", async (c) => {
  const sellerId = c.get("sellerId") as string;

  try {
    const body = await c.req.json();

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "category",
      "location",
      "basePrice",
      "priceUnit",
      "capacity",
      "maxGuests",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        throw new HTTPException(400, {
          message: `Missing required field: ${field}`,
        });
      }
    }

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Create listing with seller ownership
    const newListing = await db
      .insert(listing)
      .values({
        id: nanoid(),
        sellerId: sellerId, // Automatically assign to authenticated seller
        title: body.title,
        slug: `${slug}-${nanoid(6)}`, // Add unique suffix to avoid collisions
        description: body.description,
        category: body.category,
        location: body.location,
        basePrice: body.basePrice.toString(),
        currency: body.currency || "BDT",
        priceUnit: body.priceUnit,
        capacity: body.capacity,
        minGuests: body.minGuests || 1,
        maxGuests: body.maxGuests,
        images: body.images || [],
        amenities: body.amenities || [],
        inclusions: body.inclusions || [],
        exclusions: body.exclusions || [],
        houseRules: body.houseRules || "",
        checkInTime: body.checkInTime || null,
        checkOutTime: body.checkOutTime || null,
        cancellationPolicy: body.cancellationPolicy || "flexible",
        groupEligible: body.groupEligible || false,
        groupPricingTiers: body.groupPricingTiers || [],
        status: body.status || "draft", // Allow setting status (draft or pending-review)
        rejectionReason: null,
        viewCount: 0,
        bookingCount: 0,
        rating: null,
        reviewCount: 0,
        isFeatured: false, // Only admins can set featured
        isTrending: false, // System-managed
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: null, // Set when status becomes active
      })
      .returning();

    return c.json(
      {
        success: true,
        data: newListing[0],
        message: "Listing created successfully",
      },
      201
    );
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error creating listing:", error);
    throw new HTTPException(500, { message: "Failed to create listing" });
  }
});

/**
 * PATCH /api/seller/listings/:listingId
 * Update a listing (with ownership check)
 */
app.patch("/:listingId", async (c) => {
  const sellerId = c.get("sellerId") as string;
  const listingId = c.req.param("listingId");

  try {
    // Verify ownership first
    const existingListing = await db.query.listing.findFirst({
      where: and(
        eq(listing.id, listingId),
        eq(listing.sellerId, sellerId) // Critical ownership check
      ),
    });

    if (!existingListing) {
      throw new HTTPException(404, {
        message: "Listing not found or you don't have permission to modify it",
      });
    }

    // Get update data
    const body = await c.req.json();

    // Remove fields that sellers shouldn't be able to modify
    delete body.id;
    delete body.sellerId; // Prevent seller ID tampering
    delete body.isFeatured; // Only admins can set featured
    delete body.isTrending; // System-managed
    delete body.rating; // System-calculated
    delete body.reviewCount; // System-calculated
    delete body.viewCount; // System-calculated
    delete body.bookingCount; // System-calculated
    delete body.publishedAt; // System-managed
    delete body.createdAt; // Immutable

    // Update slug if title is changed
    if (body.title && body.title !== existingListing.title) {
      const slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      body.slug = `${slug}-${nanoid(6)}`;
    }

    // Ensure updatedAt is set
    body.updatedAt = new Date();

    // Update listing
    const updatedListing = await db
      .update(listing)
      .set(body)
      .where(eq(listing.id, listingId))
      .returning();

    return c.json({
      success: true,
      data: updatedListing[0],
      message: "Listing updated successfully",
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error updating listing:", error);
    throw new HTTPException(500, { message: "Failed to update listing" });
  }
});

/**
 * DELETE /api/seller/listings/:listingId
 * Delete a listing (with ownership check)
 */
app.delete("/:listingId", async (c) => {
  const sellerId = c.get("sellerId") as string;
  const listingId = c.req.param("listingId");

  try {
    // Verify ownership first
    const existingListing = await db.query.listing.findFirst({
      where: and(
        eq(listing.id, listingId),
        eq(listing.sellerId, sellerId) // Critical ownership check
      ),
    });

    if (!existingListing) {
      throw new HTTPException(404, {
        message: "Listing not found or you don't have permission to delete it",
      });
    }

    // Check if listing has active bookings
    const activeBookingsCount = await db.query.booking.findMany({
      where: and(
        eq(listing.id, listingId),
        // Add check for active bookings (pending, confirmed, in-progress)
      ),
    });

    if (activeBookingsCount.length > 0) {
      throw new HTTPException(400, {
        message:
          "Cannot delete listing with active bookings. Please complete or cancel all bookings first.",
      });
    }

    // Soft delete by setting isActive to false
    await db
      .update(listing)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(listing.id, listingId));

    // Alternative: Hard delete (use with caution - will cascade delete bookings, reviews, etc.)
    // await db.delete(listing).where(eq(listing.id, listingId));

    return c.json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error deleting listing:", error);
    throw new HTTPException(500, { message: "Failed to delete listing" });
  }
});

/**
 * PATCH /api/seller/listings/:listingId/toggle-active
 * Toggle listing active status (with ownership check)
 */
app.patch("/:listingId/toggle-active", async (c) => {
  const sellerId = c.get("sellerId") as string;
  const listingId = c.req.param("listingId");

  try {
    // Verify ownership
    const existingListing = await db.query.listing.findFirst({
      where: and(
        eq(listing.id, listingId),
        eq(listing.sellerId, sellerId)
      ),
    });

    if (!existingListing) {
      throw new HTTPException(404, {
        message: "Listing not found or you don't have permission to modify it",
      });
    }

    // Toggle isActive
    const updatedListing = await db
      .update(listing)
      .set({
        isActive: !existingListing.isActive,
        updatedAt: new Date(),
      })
      .where(eq(listing.id, listingId))
      .returning();

    return c.json({
      success: true,
      data: updatedListing[0],
      message: `Listing ${updatedListing[0].isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error toggling listing status:", error);
    throw new HTTPException(500, { message: "Failed to toggle listing status" });
  }
});

export default app;
