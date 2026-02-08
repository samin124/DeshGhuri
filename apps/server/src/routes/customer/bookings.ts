import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "@packages/db";
import { booking, listing, userRole } from "@packages/db/src/schema/marketplace";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@DeshGhuri/auth";
import { nanoid } from "nanoid";

const app = new Hono();

/**
 * Middleware to ensure only customers can make bookings
 * Sellers and admins are not allowed to book
 */
async function requireCustomerOnly(c: any, next: () => Promise<void>) {
  // Get Better Auth session
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw new HTTPException(401, {
      message: "Unauthorized: Please log in to make a booking"
    });
  }

  // Get user roles
  const userRoles = await db.query.userRole.findMany({
    where: eq(userRole.userId, session.user.id),
  });

  const roles = userRoles.map((r) => r.role);

  // Prevent sellers from making bookings
  if (roles.includes("seller")) {
    throw new HTTPException(403, {
      message: "Forbidden: Sellers cannot make bookings. Please use a customer account.",
    });
  }

  // Prevent admins from making bookings
  if (roles.includes("admin") || roles.includes("super_admin")) {
    throw new HTTPException(403, {
      message: "Forbidden: Admins cannot make bookings. Please use a customer account.",
    });
  }

  // Only customers can proceed
  if (!roles.includes("customer")) {
    throw new HTTPException(403, {
      message: "Forbidden: Only customers can make bookings",
    });
  }

  // Store context
  c.set("userId", session.user.id);
  c.set("userEmail", session.user.email);

  await next();
}

// Apply customer-only middleware to all routes
app.use("*", requireCustomerOnly);

/**
 * POST /api/bookings
 * Create a new booking (customer only)
 */
app.post("/", async (c) => {
  const customerId = c.get("userId") as string;

  try {
    const body = await c.req.json();

    // Validate required fields
    const requiredFields = [
      "listingId",
      "checkInDate",
      "checkOutDate",
      "numberOfGuests",
      "totalPrice",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        throw new HTTPException(400, {
          message: `Missing required field: ${field}`,
        });
      }
    }

    // Verify listing exists and is active
    const listingRecord = await db.query.listing.findFirst({
      where: eq(listing.id, body.listingId),
    });

    if (!listingRecord) {
      throw new HTTPException(404, { message: "Listing not found" });
    }

    if (!listingRecord.isActive) {
      throw new HTTPException(400, {
        message: "This listing is no longer available for booking",
      });
    }

    // Additional validation: customer cannot book their own listing
    // (This shouldn't happen if seller auth is working, but double-check)
    if (listingRecord.sellerId === customerId) {
      throw new HTTPException(400, {
        message: "You cannot book your own listing",
      });
    }

    // Validate guest count
    if (body.numberOfGuests > listingRecord.maxGuests) {
      throw new HTTPException(400, {
        message: `Number of guests exceeds maximum capacity of ${listingRecord.maxGuests}`,
      });
    }

    if (body.numberOfGuests < (listingRecord.minGuests || 1)) {
      throw new HTTPException(400, {
        message: `Number of guests is below minimum requirement of ${listingRecord.minGuests || 1}`,
      });
    }

    // Create booking
    const newBooking = await db
      .insert(booking)
      .values({
        id: nanoid(),
        listingId: body.listingId,
        sellerId: listingRecord.sellerId,
        customerId: customerId, // From authenticated session
        checkInDate: new Date(body.checkInDate),
        checkOutDate: new Date(body.checkOutDate),
        numberOfGuests: body.numberOfGuests,
        guestDetails: body.guestDetails || {},
        totalPrice: body.totalPrice.toString(),
        currency: body.currency || "BDT",
        status: "pending", // Initial status
        paymentStatus: "pending",
        contactInfo: body.contactInfo,
        specialRequests: body.specialRequests || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return c.json(
      {
        success: true,
        data: newBooking[0],
        message: "Booking created successfully. Proceeding to payment...",
      },
      201
    );
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error creating booking:", error);
    throw new HTTPException(500, { message: "Failed to create booking" });
  }
});

/**
 * GET /api/bookings
 * Get all bookings for the authenticated customer
 */
app.get("/", async (c) => {
  const customerId = c.get("userId") as string;

  try {
    const bookings = await db.query.booking.findMany({
      where: eq(booking.customerId, customerId),
      orderBy: [desc(booking.createdAt)],
      with: {
        listing: true,
        seller: true,
      },
    });

    return c.json({
      success: true,
      data: bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    throw new HTTPException(500, { message: "Failed to fetch bookings" });
  }
});

/**
 * GET /api/bookings/:bookingId
 * Get a specific booking (with ownership check)
 */
app.get("/:bookingId", async (c) => {
  const customerId = c.get("userId") as string;
  const bookingId = c.req.param("bookingId");

  try {
    const bookingRecord = await db.query.booking.findFirst({
      where: and(
        eq(booking.id, bookingId),
        eq(booking.customerId, customerId) // Ownership check
      ),
      with: {
        listing: true,
        seller: true,
      },
    });

    if (!bookingRecord) {
      throw new HTTPException(404, {
        message: "Booking not found or you don't have permission to access it",
      });
    }

    return c.json({
      success: true,
      data: bookingRecord,
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error fetching booking:", error);
    throw new HTTPException(500, { message: "Failed to fetch booking" });
  }
});

/**
 * PATCH /api/bookings/:bookingId/cancel
 * Cancel a booking (customer only, with ownership check)
 */
app.patch("/:bookingId/cancel", async (c) => {
  const customerId = c.get("userId") as string;
  const bookingId = c.req.param("bookingId");

  try {
    // Verify ownership
    const bookingRecord = await db.query.booking.findFirst({
      where: and(
        eq(booking.id, bookingId),
        eq(booking.customerId, customerId)
      ),
    });

    if (!bookingRecord) {
      throw new HTTPException(404, {
        message: "Booking not found or you don't have permission to cancel it",
      });
    }

    // Check if booking can be cancelled
    if (["cancelled", "completed", "refunded"].includes(bookingRecord.status)) {
      throw new HTTPException(400, {
        message: `Cannot cancel booking with status: ${bookingRecord.status}`,
      });
    }

    // Update booking status
    const updatedBooking = await db
      .update(booking)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(booking.id, bookingId))
      .returning();

    return c.json({
      success: true,
      data: updatedBooking[0],
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Error cancelling booking:", error);
    throw new HTTPException(500, { message: "Failed to cancel booking" });
  }
});

export default app;
