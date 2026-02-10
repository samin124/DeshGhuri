import { Hono } from 'hono';
import { db, listing, seller, review, LISTING_CATEGORIES, LISTING_STATUSES } from '@DeshGhuri/db';
import { eq, and, gte, lte, desc, asc, sql, or, like, inArray } from 'drizzle-orm';

const app = new Hono();

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
      .where(
        and(
          eq(listing.status, LISTING_STATUSES.ACTIVE),
          eq(listing.isFeatured, true)
        )
      )
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
      .orderBy(
        desc(sql`${listing.viewCount} * 0.7 + ${listing.bookingCount} * 0.3`)
      )
      .limit(8);

    // Map to add isTrending flag for frontend
    const dataWithTrendingFlag = trendingListings.map(l => ({
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

    if (category && Object.values(LISTING_CATEGORIES).includes(category as any)) {
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
      conditions.push(
        and(
          eq(listing.isFlashDeal, true),
          sql`${listing.flashDealEndsAt} > NOW()`
        )!
      );
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
      filteredListings = listings.filter(
        (l) => l.seller?.verificationStatus === 'verified'
      );
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
      .where(
        and(
          eq(listing.id, listingId),
          eq(listing.status, LISTING_STATUSES.ACTIVE)
        )
      )
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
      .where(
        and(
          eq(review.listingId, listingId),
          eq(review.status, 'published')
        )
      )
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
      conditions.push(
        sql`${listing.amenities}::jsonb @> ${JSON.stringify(amenities)}::jsonb`
      );
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
