import { Hono } from 'hono';
import { db, listing, seller, LISTING_STATUSES, eq, sql, and, or, desc, asc } from '@DeshGhuri/db';
import { z } from 'zod';
import { createAuditLog, getRequestMetadata } from '../../lib/audit-log';

const app = new Hono();

/**
 * GET /api/admin/listings/review-queue
 * Get listings pending review
 * IMPORTANT: Must be before /:id route
 */
app.get('/review-queue', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const category = c.req.query('category') || '';
    const sellerId = c.req.query('sellerId') || '';

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(listing.status, LISTING_STATUSES.PENDING_REVIEW)];

    if (category) {
      conditions.push(eq(listing.category, category));
    }

    if (sellerId) {
      conditions.push(eq(listing.sellerId, sellerId));
    }

    // Fetch pending listings with seller info
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
      .orderBy(asc(listing.createdAt)) // Oldest first
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(listing)
      .where(and(...conditions));

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    // Calculate days waiting
    const enrichedListings = listings.map(({ listing: l, seller: s }) => ({
      ...l,
      seller: s
        ? {
            id: s.id,
            name: s.businessName,
            verificationStatus: s.verificationStatus,
            rating: s.rating,
          }
        : undefined,
      daysWaiting: Math.floor(
        (Date.now() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      ),
      priority: s?.rating && Number(s.rating) > 4.5 ? 'high' : 'normal',
    }));

    return c.json({
      success: true,
      data: enrichedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Review queue error:', error);
    return c.json({ error: 'Failed to fetch review queue' }, 500);
  }
});

/**
 * GET /api/admin/listings
 * List all listings with pagination, search, and filters
 */
app.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const search = c.req.query('search') || '';
    const status = c.req.query('status') || '';
    const category = c.req.query('category') || '';
    const sellerId = c.req.query('sellerId') || '';
    const featured = c.req.query('featured');
    const sortBy = c.req.query('sortBy') || 'createdAt';
    const sortOrder = (c.req.query('sortOrder') || 'desc') as 'asc' | 'desc';

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(listing.status, status));
    }

    if (category) {
      conditions.push(eq(listing.category, category));
    }

    if (sellerId) {
      conditions.push(eq(listing.sellerId, sellerId));
    }

    if (featured !== undefined) {
      conditions.push(eq(listing.isFeatured, featured === 'true'));
    }

    if (search) {
      conditions.push(
        or(
          sql`${listing.title} ILIKE ${`%${search}%`}`,
          sql`${listing.description} ILIKE ${`%${search}%`}`
        )!
      );
    }

    // Build order by
    let orderBy;
    switch (sortBy) {
      case 'title':
        orderBy = sortOrder === 'asc' ? asc(listing.title) : desc(listing.title);
        break;
      case 'price':
        orderBy = sortOrder === 'asc' ? asc(listing.basePrice) : desc(listing.basePrice);
        break;
      case 'viewCount':
        orderBy = sortOrder === 'asc' ? asc(listing.viewCount) : desc(listing.viewCount);
        break;
      case 'createdAt':
      default:
        orderBy = sortOrder === 'asc' ? asc(listing.createdAt) : desc(listing.createdAt);
        break;
    }

    // Fetch listings
    const listings = await db
      .select({
        listing: listing,
        seller: {
          id: seller.id,
          businessName: seller.businessName,
          verificationStatus: seller.verificationStatus,
        },
      })
      .from(listing)
      .leftJoin(seller, eq(listing.sellerId, seller.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(listing)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return c.json({
      success: true,
      data: listings.map((l) => ({
        ...l.listing,
        seller: l.seller,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('List listings error:', error);
    return c.json({ error: 'Failed to fetch listings' }, 500);
  }
});

/**
 * GET /api/admin/listings/:id
 * Get listing details
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
          email: seller.email,
          verificationStatus: seller.verificationStatus,
          rating: seller.rating,
          totalBookings: seller.totalBookings,
        },
      })
      .from(listing)
      .leftJoin(seller, eq(listing.sellerId, seller.id))
      .where(eq(listing.id, listingId))
      .limit(1);

    if (!result.length) {
      return c.json({ error: 'Listing not found' }, 404);
    }

    return c.json({
      success: true,
      data: {
        ...result[0].listing,
        seller: result[0].seller,
      },
    });
  } catch (error) {
    console.error('Get listing error:', error);
    return c.json({ error: 'Failed to fetch listing' }, 500);
  }
});

/**
 * PATCH /api/admin/listings/:id/review
 * Review listing (approve/reject)
 */
app.patch('/:id/review', async (c) => {
  try {
    const listingId = c.req.param('id');
    const adminUserId = c.get('userId') as string;
    const body = await c.req.json();

    const reviewSchema = z.object({
      action: z.enum(['approve', 'reject']),
      rejectionReason: z.string().optional(),
      feedback: z.string().optional(),
      featured: z.boolean().optional(),
    });

    const { action, rejectionReason, feedback, featured } = reviewSchema.parse(body);

    if (action === 'reject' && !rejectionReason) {
      return c.json({ error: 'Rejection reason is required when rejecting a listing' }, 400);
    }

    // Get current listing
    const existingListing = await db.query.listing.findFirst({
      where: eq(listing.id, listingId),
    });

    if (!existingListing) {
      return c.json({ error: 'Listing not found' }, 404);
    }

    if (existingListing.status !== LISTING_STATUSES.PENDING_REVIEW) {
      return c.json({ error: 'Only pending listings can be reviewed' }, 400);
    }

    // Update listing based on action
    if (action === 'approve') {
      await db
        .update(listing)
        .set({
          status: LISTING_STATUSES.ACTIVE,
          publishedAt: new Date(),
          isFeatured: featured || false,
          rejectionReason: null,
          updatedAt: new Date(),
        })
        .where(eq(listing.id, listingId));

      // TODO: Send approval email to seller
    } else {
      await db
        .update(listing)
        .set({
          status: LISTING_STATUSES.REJECTED,
          rejectionReason,
          updatedAt: new Date(),
        })
        .where(eq(listing.id, listingId));

      // TODO: Send rejection email to seller
    }

    // Create audit log
    await createAuditLog({
      userId: adminUserId,
      action: `listing.review.${action}`,
      entityType: 'listing',
      entityId: listingId,
      oldValue: { status: existingListing.status },
      newValue: {
        status: action === 'approve' ? LISTING_STATUSES.ACTIVE : LISTING_STATUSES.REJECTED,
        rejectionReason,
        featured,
      },
      metadata: {
        ...getRequestMetadata(c.req.raw.headers),
        feedback,
      },
    });

    return c.json({
      success: true,
      message: `Listing ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: {
        listingId,
        action,
        newStatus: action === 'approve' ? LISTING_STATUSES.ACTIVE : LISTING_STATUSES.REJECTED,
      },
    });
  } catch (error) {
    console.error('Review listing error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.issues }, 400);
    }
    return c.json({ error: 'Failed to review listing' }, 500);
  }
});

/**
 * PATCH /api/admin/listings/:id/featured
 * Toggle featured status
 */
app.patch('/:id/featured', async (c) => {
  try {
    const listingId = c.req.param('id');
    const adminUserId = c.get('userId') as string;
    const body = await c.req.json();

    const schema = z.object({
      featured: z.boolean(),
    });

    const { featured } = schema.parse(body);

    // Get current listing
    const existingListing = await db.query.listing.findFirst({
      where: eq(listing.id, listingId),
    });

    if (!existingListing) {
      return c.json({ error: 'Listing not found' }, 404);
    }

    // Update featured status
    await db
      .update(listing)
      .set({
        isFeatured: featured,
        updatedAt: new Date(),
      })
      .where(eq(listing.id, listingId));

    // Create audit log
    await createAuditLog({
      userId: adminUserId,
      action: 'listing.featured.toggle',
      entityType: 'listing',
      entityId: listingId,
      oldValue: { isFeatured: existingListing.isFeatured },
      newValue: { isFeatured: featured },
      metadata: getRequestMetadata(c.req.raw.headers),
    });

    return c.json({
      success: true,
      message: `Listing ${featured ? 'marked as featured' : 'unmarked as featured'}`,
      data: {
        listingId,
        isFeatured: featured,
      },
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.issues }, 400);
    }
    return c.json({ error: 'Failed to toggle featured status' }, 500);
  }
});

/**
 * PATCH /api/admin/listings/:id/force-pause
 * Force pause a listing (policy violation)
 */
app.patch('/:id/force-pause', async (c) => {
  try {
    const listingId = c.req.param('id');
    const adminUserId = c.get('userId') as string;
    const body = await c.req.json();

    const schema = z.object({
      reason: z.string().min(1, 'Reason is required'),
    });

    const { reason } = schema.parse(body);

    // Get current listing
    const existingListing = await db.query.listing.findFirst({
      where: eq(listing.id, listingId),
    });

    if (!existingListing) {
      return c.json({ error: 'Listing not found' }, 404);
    }

    // Update to paused
    await db
      .update(listing)
      .set({
        status: LISTING_STATUSES.PAUSED,
        rejectionReason: `Admin paused: ${reason}`,
        updatedAt: new Date(),
      })
      .where(eq(listing.id, listingId));

    // Create audit log
    await createAuditLog({
      userId: adminUserId,
      action: 'listing.force-pause',
      entityType: 'listing',
      entityId: listingId,
      oldValue: { status: existingListing.status },
      newValue: { status: LISTING_STATUSES.PAUSED },
      metadata: {
        ...getRequestMetadata(c.req.raw.headers),
        reason,
      },
    });

    // TODO: Send notification to seller

    return c.json({
      success: true,
      message: 'Listing paused successfully',
      data: {
        listingId,
        status: LISTING_STATUSES.PAUSED,
        reason,
      },
    });
  } catch (error) {
    console.error('Force pause error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.issues }, 400);
    }
    return c.json({ error: 'Failed to pause listing' }, 500);
  }
});

export default app;
