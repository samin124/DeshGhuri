import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { nanoid } from 'nanoid';
import { auth } from '@DeshGhuri/auth';
import {
  db,
  listing,
  seller,
  review,
  booking,
  user,
  LISTING_CATEGORIES,
  LISTING_STATUSES,
} from '@DeshGhuri/db';
import { eq, and, gte, lte, desc, asc, sql, or } from 'drizzle-orm';
import { getHomepageConfig } from '../lib/homepage-config';

const app = new Hono();

const createListingReviewSchema = z.object({
  overallRating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().min(5).max(1000),
  ratings: z
    .object({
      cleanliness: z.number().int().min(1).max(5).optional(),
      communication: z.number().int().min(1).max(5).optional(),
      accuracy: z.number().int().min(1).max(5).optional(),
      value: z.number().int().min(1).max(5).optional(),
      location: z.number().int().min(1).max(5).optional(),
    })
    .optional(),
});

async function getSessionUserId(c: { req: { raw: { headers: Headers } } }) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  return session?.user?.id ?? null;
}

// ============================================================================
// PUBLIC LISTING ENDPOINTS
// ============================================================================

/**
 * GET /api/listings/featured
 * Get featured listings (admin-marked)
 * Prioritizes flash deals and active promotions
 * IMPORTANT: Must be before /:id route
 */
app.get('/featured', async (c) => {
  try {
    // Get flash deals first
    const flashDeals = await db
      .select()
      .from(listing)
      .where(
        and(
          eq(listing.status, LISTING_STATUSES.ACTIVE),
          eq(listing.isFlashDeal, true),
          sql`${listing.flashDealEndsAt} > NOW()`
        )
      )
      .orderBy(desc(listing.rating))
      .limit(4);

    // Get remaining featured listings
    const remainingSlots = 12 - flashDeals.length;
    const featuredListings = await db
      .select()
      .from(listing)
      .where(and(eq(listing.status, LISTING_STATUSES.ACTIVE), eq(listing.isFeatured, true)))
      .orderBy(desc(listing.rating))
      .limit(remainingSlots);

    return c.json({
      success: true,
      data: [...flashDeals, ...featuredListings],
    });
  } catch (error) {
    console.error('Error fetching featured listings:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch featured listings',
      },
      500
    );
  }
});

/**
 * GET /api/listings/flash-deals
 * Get active flash deals only
 * IMPORTANT: Must be before /:id route
 */
app.get('/flash-deals', async (c) => {
  try {
    const flashDeals = await db
      .select()
      .from(listing)
      .where(
        and(
          eq(listing.status, LISTING_STATUSES.ACTIVE),
          eq(listing.isFlashDeal, true),
          sql`${listing.flashDealEndsAt} > NOW()`
        )
      )
      .orderBy(desc(listing.flashDealEndsAt)) // Show soonest to expire first
      .limit(12);

    return c.json({
      success: true,
      data: flashDeals,
    });
  } catch (error) {
    console.error('Error fetching flash deals:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch flash deals',
      },
      500
    );
  }
});

/**
 * GET /api/listings/trending
 * Get trending listings based on recent views and bookings
 * IMPORTANT: Must be before /:id route
 */
app.get('/trending', async (c) => {
  try {
    // For now, use a simple algorithm: high views + bookings in last 7 days
    // This will be replaced with proper trending calculation from analytics table
    const trendingListings = await db
      .select()
      .from(listing)
      .where(eq(listing.status, LISTING_STATUSES.ACTIVE))
      .orderBy(desc(sql`${listing.viewCount} * 0.7 + ${listing.bookingCount} * 0.3`))
      .limit(8);

    // Map to add isTrending flag for frontend
    const dataWithTrendingFlag = trendingListings.map((l) => ({
      ...l,
      isTrending: true,
    }));

    return c.json({
      success: true,
      data: dataWithTrendingFlag,
    });
  } catch (error) {
    console.error('Error fetching trending listings:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch trending listings',
      },
      500
    );
  }
});

/**
 * GET /api/listings/suggestions
 * Get search suggestions for autocomplete
 * IMPORTANT: Must be before /:id route
 */
app.get('/suggestions', async (c) => {
  try {
    const { q } = c.req.query();

    if (!q || q.length < 2) {
      return c.json({
        success: true,
        data: {
          listings: [],
          locations: [],
        },
      });
    }

    const query = q.toLowerCase();

    // Search listings by title
    const listingSuggestions = await db
      .select({
        id: listing.id,
        title: listing.title,
        category: listing.category,
        basePrice: listing.basePrice,
        images: listing.images,
        location: listing.location,
      })
      .from(listing)
      .where(
        and(
          eq(listing.status, LISTING_STATUSES.ACTIVE),
          sql`LOWER(${listing.title}) LIKE ${`%${query}%`}`
        )
      )
      .orderBy(desc(listing.rating))
      .limit(5);

    // Get unique locations
    const locationSuggestions = await db
      .select({
        city: sql<string>`DISTINCT ${listing.location}->>'city'`,
        district: sql<string>`${listing.location}->>'district'`,
      })
      .from(listing)
      .where(
        and(
          eq(listing.status, LISTING_STATUSES.ACTIVE),
          or(
            sql`LOWER(${listing.location}->>'city') LIKE ${`%${query}%`}`,
            sql`LOWER(${listing.location}->>'district') LIKE ${`%${query}%`}`
          )!
        )
      )
      .limit(5);

    return c.json({
      success: true,
      data: {
        listings: listingSuggestions,
        locations: locationSuggestions
          .filter((l) => l.city)
          .map((l) => ({
            city: l.city,
            district: l.district,
          })),
      },
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch suggestions',
      },
      500
    );
  }
});

/**
 * GET /api/listings
 * Browse listings with filters and pagination
 * Public endpoint - returns only active listings
 */
app.get('/', async (c) => {
  try {
    const {
      page = '1',
      limit = '20',
      category,
      location,
      minPrice,
      maxPrice,
      rating,
      groupEligible,
      verifiedOnly,
      flashDeals,
      sort = 'newest',
    } = c.req.query();

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    const conditions = [eq(listing.status, LISTING_STATUSES.ACTIVE)];

    if (category && Object.values(LISTING_CATEGORIES).includes(category as string)) {
      conditions.push(eq(listing.category, category));
    }

    if (location) {
      // Search in location JSON field (city, district, address)
      conditions.push(
        or(
          sql`${listing.location}->>'city' ILIKE ${`%${location}%`}`,
          sql`${listing.location}->>'district' ILIKE ${`%${location}%`}`,
          sql`${listing.location}->>'address' ILIKE ${`%${location}%`}`
        )!
      );
    }

    if (minPrice) {
      conditions.push(gte(listing.basePrice, minPrice));
    }

    if (maxPrice) {
      conditions.push(lte(listing.basePrice, maxPrice));
    }

    if (rating) {
      conditions.push(gte(listing.rating, rating));
    }

    if (groupEligible === 'true') {
      conditions.push(eq(listing.groupEligible, true));
    }

    if (flashDeals === 'true') {
      conditions.push(and(eq(listing.isFlashDeal, true), sql`${listing.flashDealEndsAt} > NOW()`)!);
    }

    // Build order by
    let orderBy;
    switch (sort) {
      case 'price-asc':
        orderBy = asc(listing.basePrice);
        break;
      case 'price-desc':
        orderBy = desc(listing.basePrice);
        break;
      case 'rating':
        orderBy = desc(listing.rating);
        break;
      case 'popular':
        orderBy = desc(listing.bookingCount);
        break;
      case 'newest':
      default:
        orderBy = desc(listing.createdAt);
        break;
    }

    // Fetch listings with seller info
    const listings = await db
      .select({
        listing: listing,
        seller: {
          id: seller.id,
          businessName: seller.businessName,
          verificationStatus: seller.verificationStatus,
          rating: seller.rating,
        },
      })
      .from(listing)
      .leftJoin(seller, eq(listing.sellerId, seller.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limitNum)
      .offset(offset);

    // Filter verified sellers if requested
    let filteredListings = listings;
    if (verifiedOnly === 'true') {
      filteredListings = listings.filter((l) => l.seller?.verificationStatus === 'verified');
    }

    // Get total count for pagination
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(listing)
      .where(and(...conditions));

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limitNum);

    // Get available filters for UI
    const categoryCountsResult = await db
      .select({
        category: listing.category,
        count: sql<number>`count(*)`,
      })
      .from(listing)
      .where(eq(listing.status, LISTING_STATUSES.ACTIVE))
      .groupBy(listing.category);

    const priceRangeResult = await db
      .select({
        min: sql<number>`MIN(CAST(${listing.basePrice} AS NUMERIC))`,
        max: sql<number>`MAX(CAST(${listing.basePrice} AS NUMERIC))`,
      })
      .from(listing)
      .where(eq(listing.status, LISTING_STATUSES.ACTIVE));

    const locationsResult = await db
      .select({
        city: sql<string>`DISTINCT ${listing.location}->>'city'`,
      })
      .from(listing)
      .where(eq(listing.status, LISTING_STATUSES.ACTIVE))
      .limit(20);

    return c.json({
      success: true,
      data: filteredListings.map((l) => ({
        ...l.listing,
        seller: l.seller
          ? {
              id: l.seller.id,
              name: l.seller.businessName,
              verificationStatus: l.seller.verificationStatus,
              rating: l.seller.rating,
            }
          : undefined,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
      filters: {
        appliedFilters: {
          category,
          location,
          minPrice,
          maxPrice,
          rating,
          groupEligible,
          verifiedOnly,
          sort,
        },
        availableFilters: {
          categories: categoryCountsResult.map((c) => ({
            value: c.category,
            count: Number(c.count),
          })),
          priceRange: {
            min: Number(priceRangeResult[0]?.min || 0),
            max: Number(priceRangeResult[0]?.max || 100000),
          },
          locations: locationsResult.map((l) => l.city).filter(Boolean),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch listings',
      },
      500
    );
  }
});

/**
 * GET /api/listings/homepage-config
 * Public homepage configuration (hero text + section visibility)
 */
app.get('/homepage-config', async (c) => {
  try {
    const config = await getHomepageConfig();

    return c.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Error fetching homepage config:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch homepage config',
      },
      500
    );
  }
});

/**
 * GET /api/listings/:id/reviews
 * Get latest reviews, rating summary, and review eligibility for logged-in customer
 */
app.get('/:id/reviews', async (c) => {
  try {
    const listingId = c.req.param('id');
    const limit = Math.min(Math.max(Number(c.req.query('limit') || '5'), 1), 20);

    const [listingData] = await db
      .select({
        id: listing.id,
        status: listing.status,
      })
      .from(listing)
      .where(eq(listing.id, listingId))
      .limit(1);

    if (!listingData || listingData.status !== LISTING_STATUSES.ACTIVE) {
      return c.json(
        {
          success: false,
          error: 'Listing not found',
        },
        404
      );
    }

    const latestReviews = await db
      .select({
        id: review.id,
        overallRating: review.overallRating,
        title: review.title,
        comment: review.comment,
        sellerResponse: review.sellerResponse,
        respondedAt: review.respondedAt,
        createdAt: review.createdAt,
        customer: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(review)
      .leftJoin(user, eq(review.customerId, user.id))
      .where(and(eq(review.listingId, listingId), eq(review.status, 'published')))
      .orderBy(desc(review.createdAt))
      .limit(limit);

    const [reviewStats] = await db
      .select({
        averageRating: sql<number>`COALESCE(AVG(${review.overallRating}), 0)`,
        reviewCount: sql<number>`count(*)`,
      })
      .from(review)
      .where(and(eq(review.listingId, listingId), eq(review.status, 'published')))
      .limit(1);

    const userId = await getSessionUserId(c);
    let canReview = false;
    let eligibilityMessage = 'Sign in to submit a rating and review.';

    if (userId) {
      const [eligibleBooking] = await db
        .select({ id: booking.id })
        .from(booking)
        .where(
          and(
            eq(booking.listingId, listingId),
            eq(booking.customerId, userId),
            eq(booking.approvalStatus, 'approved'),
            or(eq(booking.status, 'confirmed'), eq(booking.status, 'completed'))!,
            sql`NOT EXISTS (SELECT 1 FROM ${review} r WHERE r.booking_id = ${booking.id})`
          )
        )
        .orderBy(desc(booking.createdAt))
        .limit(1);

      if (eligibleBooking) {
        canReview = true;
        eligibilityMessage = 'You can submit a review for this package.';
      } else {
        const [approvedBookingCount] = await db
          .select({
            count: sql<number>`count(*)`,
          })
          .from(booking)
          .where(
            and(
              eq(booking.listingId, listingId),
              eq(booking.customerId, userId),
              eq(booking.approvalStatus, 'approved'),
              or(eq(booking.status, 'confirmed'), eq(booking.status, 'completed'))!
            )
          )
          .limit(1);

        if (Number(approvedBookingCount?.count || 0) === 0) {
          eligibilityMessage = 'You can review this package after an approved booking.';
        } else {
          eligibilityMessage = 'You have already submitted reviews for available bookings.';
        }
      }
    }

    return c.json({
      success: true,
      data: {
        averageRating: Number(reviewStats?.averageRating || 0),
        reviewCount: Number(reviewStats?.reviewCount || 0),
        reviews: latestReviews,
        canReview,
        eligibilityMessage,
      },
    });
  } catch (error) {
    console.error('Error fetching listing reviews:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch listing reviews',
      },
      500
    );
  }
});

/**
 * POST /api/listings/:id/reviews
 * Submit rating and review for a listing (customer with approved booking only)
 */
app.post('/:id/reviews', zValidator('json', createListingReviewSchema), async (c) => {
  try {
    const listingId = c.req.param('id');
    const userId = await getSessionUserId(c);
    const data = c.req.valid('json');

    if (!userId) {
      return c.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        401
      );
    }

    const [listingData] = await db
      .select({
        id: listing.id,
        sellerId: listing.sellerId,
        status: listing.status,
      })
      .from(listing)
      .where(eq(listing.id, listingId))
      .limit(1);

    if (!listingData || listingData.status !== LISTING_STATUSES.ACTIVE) {
      return c.json(
        {
          success: false,
          error: 'Listing not found',
        },
        404
      );
    }

    const [eligibleBooking] = await db
      .select({
        id: booking.id,
      })
      .from(booking)
      .where(
        and(
          eq(booking.listingId, listingId),
          eq(booking.customerId, userId),
          eq(booking.approvalStatus, 'approved'),
          or(eq(booking.status, 'confirmed'), eq(booking.status, 'completed'))!,
          sql`NOT EXISTS (SELECT 1 FROM ${review} r WHERE r.booking_id = ${booking.id})`
        )
      )
      .orderBy(desc(booking.createdAt))
      .limit(1);

    if (!eligibleBooking) {
      return c.json(
        {
          success: false,
          error: 'You can review this package only after an approved booking.',
        },
        400
      );
    }

    const [insertedReview] = await db
      .insert(review)
      .values({
        id: nanoid(16),
        listingId,
        bookingId: eligibleBooking.id,
        customerId: userId,
        sellerId: listingData.sellerId,
        overallRating: data.overallRating,
        title: data.title?.trim() || null,
        comment: data.comment.trim(),
        ratings: data.ratings || null,
        status: 'published',
      })
      .returning();

    const [updatedStats] = await db
      .select({
        averageRating: sql<number>`COALESCE(AVG(${review.overallRating}), 0)`,
        reviewCount: sql<number>`count(*)`,
      })
      .from(review)
      .where(and(eq(review.listingId, listingId), eq(review.status, 'published')))
      .limit(1);

    await db
      .update(listing)
      .set({
        rating: Number(updatedStats?.averageRating || 0).toFixed(2),
        reviewCount: Number(updatedStats?.reviewCount || 0),
      })
      .where(eq(listing.id, listingId));

    return c.json({
      success: true,
      message: 'Review submitted successfully.',
      data: insertedReview,
    });
  } catch (error) {
    console.error('Error creating listing review:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to submit review',
      },
      500
    );
  }
});

/**
 * GET /api/listings/:id
 * Get single listing detail with full information
 */
app.get('/:id', async (c) => {
  try {
    const listingId = c.req.param('id');

    const result = await db
      .select({
        listing: listing,
        seller: {
          id: seller.id,
          businessName: seller.businessName,
          verificationStatus: seller.verificationStatus,
          rating: seller.rating,
        },
      })
      .from(listing)
      .leftJoin(seller, eq(listing.sellerId, seller.id))
      .where(and(eq(listing.id, listingId), eq(listing.status, LISTING_STATUSES.ACTIVE)))
      .limit(1);

    if (!result.length) {
      return c.json(
        {
          success: false,
          error: 'Listing not found',
        },
        404
      );
    }

    const { listing: listingData, seller: sellerData } = result[0];

    // Get recent reviews (top 5)
    const recentReviews = await db
      .select()
      .from(review)
      .where(and(eq(review.listingId, listingId), eq(review.status, 'published')))
      .orderBy(desc(review.createdAt))
      .limit(5);

    // Get similar listings (same category, different listing)
    const similarListings = await db
      .select()
      .from(listing)
      .where(
        and(
          eq(listing.category, listingData.category),
          eq(listing.status, LISTING_STATUSES.ACTIVE),
          sql`${listing.id} != ${listingId}`
        )
      )
      .orderBy(desc(listing.rating))
      .limit(4);

    return c.json({
      success: true,
      data: {
        ...listingData,
        seller: sellerData
          ? {
              id: sellerData.id,
              name: sellerData.businessName,
              verificationStatus: sellerData.verificationStatus,
              rating: sellerData.rating,
            }
          : undefined,
        recentReviews,
        similarListings,
      },
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch listing',
      },
      500
    );
  }
});

/**
 * POST /api/listings/search
 * Advanced search with keyword and filters
 */
app.post('/search', async (c) => {
  try {
    const body = await c.req.json();
    const { keyword, filters = {}, amenities = [] } = body;

    const conditions = [eq(listing.status, LISTING_STATUSES.ACTIVE)];

    // Keyword search (title and description)
    if (keyword) {
      conditions.push(
        or(
          sql`${listing.title} ILIKE ${`%${keyword}%`}`,
          sql`${listing.description} ILIKE ${`%${keyword}%`}`
        )!
      );
    }

    // Apply filters (same as GET /listings)
    if (filters.category) {
      conditions.push(eq(listing.category, filters.category));
    }

    if (filters.location) {
      conditions.push(
        or(
          sql`${listing.location}->>'city' ILIKE ${`%${filters.location}%`}`,
          sql`${listing.location}->>'district' ILIKE ${`%${filters.location}%`}`
        )!
      );
    }

    if (filters.minPrice) {
      conditions.push(gte(listing.basePrice, filters.minPrice));
    }

    if (filters.maxPrice) {
      conditions.push(lte(listing.basePrice, filters.maxPrice));
    }

    if (filters.rating) {
      conditions.push(gte(listing.rating, filters.rating));
    }

    if (filters.groupEligible) {
      conditions.push(eq(listing.groupEligible, true));
    }

    // Amenities filter
    if (amenities.length > 0) {
      // Check if listing.amenities contains all requested amenities
      conditions.push(sql`${listing.amenities}::jsonb @> ${JSON.stringify(amenities)}::jsonb`);
    }

    const results = await db
      .select()
      .from(listing)
      .where(and(...conditions))
      .orderBy(desc(listing.createdAt))
      .limit(50);

    return c.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error searching listings:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to search listings',
      },
      500
    );
  }
});

/**
 * POST /api/listings/:id/view
 * Track listing view (rate limited to 1 per user per hour)
 */
app.post('/:id/view', async (c) => {
  try {
    const listingId = c.req.param('id');

    // Simple view increment (in production, add rate limiting)
    await db
      .update(listing)
      .set({ viewCount: sql`${listing.viewCount} + 1` })
      .where(eq(listing.id, listingId));

    return c.json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    return c.json({ success: false, error: 'Failed to track view' }, 500);
  }
});

export default app;
