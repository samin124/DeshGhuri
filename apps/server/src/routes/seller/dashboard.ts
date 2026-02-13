import { Hono } from 'hono';
import {
  db,
  eq,
  and,
  gte,
  lte,
  desc,
  sql,
  asc,
  booking,
  listing,
  review,
  escrowTransaction,
  payout,
  listingAnalytics,
} from '@DeshGhuri/db';
import { requireSeller } from '../../middleware/seller-auth';

const app = new Hono();

// Apply seller authentication to all routes
app.use('*', requireSeller);

/**
 * GET /api/seller/dashboard/stats
 * Get dashboard overview statistics
 */
app.get('/stats', async (c) => {
  const sellerId = c.get('sellerId') as string;

  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    // Get today's bookings
    const todayBookings = await db
      .select({ count: sql<number>`count(*)` })
      .from(booking)
      .where(
        and(
          eq(booking.sellerId, sellerId),
          gte(booking.createdAt, todayStart),
          lte(booking.createdAt, todayEnd)
        )
      );

    // Get today's revenue
    const todayRevenue = await db
      .select({
        total: sql<string>`COALESCE(SUM(${booking.totalAmount}), 0)`,
      })
      .from(booking)
      .where(
        and(
          eq(booking.sellerId, sellerId),
          eq(booking.paymentStatus, 'completed'),
          gte(booking.createdAt, todayStart),
          lte(booking.createdAt, todayEnd)
        )
      );

    // Get today's views (from analytics)
    const todayViews = await db
      .select({
        total: sql<number>`COALESCE(SUM(${listingAnalytics.views}), 0)`,
      })
      .from(listingAnalytics)
      .where(and(eq(listingAnalytics.sellerId, sellerId), eq(listingAnalytics.date, todayStart)));

    // Get pending proofs
    const pendingProofs = await db
      .select({ count: sql<number>`count(*)` })
      .from(escrowTransaction)
      .where(
        and(eq(escrowTransaction.sellerId, sellerId), eq(escrowTransaction.status, 'pending-proof'))
      );

    // Get unanswered reviews
    const unansweredReviews = await db
      .select({ count: sql<number>`count(*)` })
      .from(review)
      .where(and(eq(review.sellerId, sellerId), sql`${review.sellerResponse} IS NULL`));

    // Get upcoming bookings (next 7 days)
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 7);
    const upcomingBookings = await db
      .select({ count: sql<number>`count(*)` })
      .from(booking)
      .where(
        and(
          eq(booking.sellerId, sellerId),
          eq(booking.status, 'confirmed'),
          gte(booking.serviceDate!, todayStart),
          lte(booking.serviceDate!, upcomingDate)
        )
      );

    // Get total listings
    const totalListings = await db
      .select({ count: sql<number>`count(*)` })
      .from(listing)
      .where(eq(listing.sellerId, sellerId));

    // Get active listings
    const activeListings = await db
      .select({ count: sql<number>`count(*)` })
      .from(listing)
      .where(and(eq(listing.sellerId, sellerId), eq(listing.status, 'active')));

    // Get total bookings
    const totalBookingsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(booking)
      .where(eq(booking.sellerId, sellerId));

    // Get total revenue
    const totalRevenueResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${booking.totalAmount}), 0)`,
      })
      .from(booking)
      .where(and(eq(booking.sellerId, sellerId), eq(booking.paymentStatus, 'completed')));

    // Get average rating and review count
    const ratingStats = await db
      .select({
        avgRating: sql<number>`COALESCE(AVG(${review.overallRating}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(review)
      .where(eq(review.sellerId, sellerId));

    // Get earnings breakdown
    const pendingEarnings = await db
      .select({
        total: sql<string>`COALESCE(SUM(${escrowTransaction.sellerAmount}), 0)`,
      })
      .from(escrowTransaction)
      .where(
        and(
          eq(escrowTransaction.sellerId, sellerId),
          sql`${escrowTransaction.status} IN ('created', 'pending-proof', 'proof-submitted', 'proof-verified')`
        )
      );

    const releasedEarnings = await db
      .select({
        total: sql<string>`COALESCE(SUM(${escrowTransaction.sellerAmount}), 0)`,
      })
      .from(escrowTransaction)
      .where(
        and(eq(escrowTransaction.sellerId, sellerId), eq(escrowTransaction.status, 'released'))
      );

    const withdrawnEarnings = await db
      .select({
        total: sql<string>`COALESCE(SUM(${payout.amount}), 0)`,
      })
      .from(payout)
      .where(and(eq(payout.sellerId, sellerId), eq(payout.status, 'completed')));

    return c.json({
      todayBookings: Number(todayBookings[0]?.count || 0),
      todayRevenue: todayRevenue[0]?.total || '0',
      todayViews: Number(todayViews[0]?.total || 0),
      pendingProofs: Number(pendingProofs[0]?.count || 0),
      unansweredReviews: Number(unansweredReviews[0]?.count || 0),
      upcomingBookings: Number(upcomingBookings[0]?.count || 0),
      totalListings: Number(totalListings[0]?.count || 0),
      activeListings: Number(activeListings[0]?.count || 0),
      totalBookings: Number(totalBookingsCount[0]?.count || 0),
      totalRevenue: totalRevenueResult[0]?.total || '0',
      averageRating: Number(ratingStats[0]?.avgRating || 0),
      totalReviews: Number(ratingStats[0]?.count || 0),
      pendingEarnings: pendingEarnings[0]?.total || '0',
      releasedEarnings: releasedEarnings[0]?.total || '0',
      totalEarnings: String(
        Number(pendingEarnings[0]?.total || 0) +
          Number(releasedEarnings[0]?.total || 0) +
          Number(withdrawnEarnings[0]?.total || 0)
      ),
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return c.json({ error: 'Failed to fetch dashboard statistics' }, 500);
  }
});

/**
 * GET /api/seller/dashboard/bookings
 * Get seller's bookings with filtering and pagination
 */
app.get('/bookings', async (c) => {
  const sellerId = c.get('sellerId') as string;

  try {
    // Get query parameters
    const status = c.req.query('status');
    const approvalStatus = c.req.query('approvalStatus');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    const page = Number(c.req.query('page')) || 1;
    const limit = Number(c.req.query('limit')) || 10;
    const sortBy = c.req.query('sortBy') || 'createdAt';
    const sortOrder = c.req.query('sortOrder') || 'desc';
    const offset = (page - 1) * limit;

    console.log('🔍 Seller Dashboard Bookings Request:', {
      sellerId,
      status,
      approvalStatus,
      startDate,
      endDate,
      page,
      limit,
    });

    // Build where conditions
    const conditions = [eq(booking.sellerId, sellerId)];

    if (status) {
      conditions.push(eq(booking.status, status));
    }

    if (approvalStatus) {
      conditions.push(eq(booking.approvalStatus, approvalStatus));
    }

    if (startDate) {
      conditions.push(gte(booking.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(booking.createdAt, new Date(endDate)));
    }

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(booking)
      .where(and(...conditions));

    const total = Number(totalResult[0]?.count || 0);

    // Get bookings with related data
    const bookings = await db.query.booking.findMany({
      where: and(...conditions),
      with: {
        listing: {
          columns: {
            id: true,
            title: true,
            category: true,
            images: true,
          },
        },
        customer: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      limit,
      offset,
      orderBy:
        sortOrder === 'asc'
          ? asc(booking[sortBy as keyof typeof booking])
          : desc(booking[sortBy as keyof typeof booking]),
    });

    console.log('✅ Found bookings:', bookings.length);
    console.log(
      '📦 Bookings data:',
      bookings.slice(0, 3).map((b) => ({
        id: b.id,
        listingId: b.listingId,
        sellerId: b.sellerId,
        approvalStatus: b.approvalStatus,
        status: b.status,
        customerId: b.customerId,
      }))
    );

    return c.json({
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

/**
 * GET /api/seller/dashboard/earnings
 * Get earnings summary and breakdown
 */
app.get('/earnings', async (c) => {
  const sellerId = c.get('sellerId') as string;

  try {
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');

    const conditions = [eq(escrowTransaction.sellerId, sellerId)];
    const payoutConditions = [eq(payout.sellerId, sellerId), eq(payout.status, 'completed')];

    if (startDate) {
      conditions.push(gte(escrowTransaction.createdAt, new Date(startDate)));
      payoutConditions.push(gte(payout.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(escrowTransaction.createdAt, new Date(endDate)));
      payoutConditions.push(lte(payout.createdAt, new Date(endDate)));
    }

    // Get pending transactions
    const pendingTransactions = await db.query.escrowTransaction.findMany({
      where: and(
        ...conditions,
        sql`${escrowTransaction.status} IN ('created', 'pending-proof', 'proof-submitted', 'proof-verified')`
      ),
      with: {
        booking: {
          columns: {
            id: true,
            serviceDate: true,
          },
          with: {
            listing: {
              columns: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: desc(escrowTransaction.createdAt),
    });

    const pendingAmount = pendingTransactions.reduce((sum, t) => sum + Number(t.sellerAmount), 0);

    // Get released transactions (ready for payout)
    const releasedTransactions = await db.query.escrowTransaction.findMany({
      where: and(...conditions, eq(escrowTransaction.status, 'released')),
      orderBy: desc(escrowTransaction.releasedAt),
    });

    const releasedAmount = releasedTransactions.reduce((sum, t) => sum + Number(t.sellerAmount), 0);

    // Get withdrawn (completed payouts)
    const withdrawnPayouts = await db.query.payout.findMany({
      where: and(...payoutConditions),
      orderBy: desc(payout.completedAt),
    });

    const withdrawnAmount = withdrawnPayouts.reduce((sum, p) => sum + Number(p.amount), 0);

    return c.json({
      pending: {
        amount: String(pendingAmount),
        count: pendingTransactions.length,
        transactions: pendingTransactions,
      },
      released: {
        amount: String(releasedAmount),
        count: releasedTransactions.length,
        readyForPayout: String(releasedAmount),
      },
      withdrawn: {
        amount: String(withdrawnAmount),
        count: withdrawnPayouts.length,
      },
      total: {
        amount: String(pendingAmount + releasedAmount + withdrawnAmount),
        count: pendingTransactions.length + releasedTransactions.length + withdrawnPayouts.length,
      },
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return c.json({ error: 'Failed to fetch earnings' }, 500);
  }
});

/**
 * GET /api/seller/dashboard/payouts
 * Get payout history
 */
app.get('/payouts', async (c) => {
  const sellerId = c.get('sellerId') as string;

  try {
    const page = Number(c.req.query('page')) || 1;
    const limit = Number(c.req.query('limit')) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(payout)
      .where(eq(payout.sellerId, sellerId));

    const total = Number(totalResult[0]?.count || 0);

    // Get payouts
    const payouts = await db.query.payout.findMany({
      where: eq(payout.sellerId, sellerId),
      limit,
      offset,
      orderBy: desc(payout.createdAt),
    });

    return c.json({
      payouts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return c.json({ error: 'Failed to fetch payouts' }, 500);
  }
});

/**
 * GET /api/seller/dashboard/reviews
 * Get reviews for seller's listings
 */
app.get('/reviews', async (c) => {
  const sellerId = c.get('sellerId') as string;

  try {
    const page = Number(c.req.query('page')) || 1;
    const limit = Number(c.req.query('limit')) || 10;
    const hasResponse = c.req.query('hasResponse');
    const minRating = c.req.query('minRating');
    const sortBy = c.req.query('sortBy') || 'createdAt';
    const sortOrder = c.req.query('sortOrder') || 'desc';
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(review.sellerId, sellerId)];

    if (hasResponse === 'false') {
      conditions.push(sql`${review.sellerResponse} IS NULL`);
    } else if (hasResponse === 'true') {
      conditions.push(sql`${review.sellerResponse} IS NOT NULL`);
    }

    if (minRating) {
      conditions.push(gte(review.overallRating, Number(minRating)));
    }

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(review)
      .where(and(...conditions));

    const total = Number(totalResult[0]?.count || 0);

    // Get reviews with related data
    const reviews = await db.query.review.findMany({
      where: and(...conditions),
      with: {
        customer: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        listing: {
          columns: {
            id: true,
            title: true,
            category: true,
          },
        },
        booking: {
          columns: {
            id: true,
            serviceDate: true,
          },
        },
      },
      limit,
      offset,
      orderBy:
        sortOrder === 'asc'
          ? asc(review[sortBy as keyof typeof review])
          : desc(review[sortBy as keyof typeof review]),
    });

    // Calculate average rating
    const ratingStats = await db
      .select({
        avgRating: sql<number>`COALESCE(AVG(${review.overallRating}), 0)`,
        rating1: sql<number>`count(*) FILTER (WHERE ${review.overallRating} = 1)`,
        rating2: sql<number>`count(*) FILTER (WHERE ${review.overallRating} = 2)`,
        rating3: sql<number>`count(*) FILTER (WHERE ${review.overallRating} = 3)`,
        rating4: sql<number>`count(*) FILTER (WHERE ${review.overallRating} = 4)`,
        rating5: sql<number>`count(*) FILTER (WHERE ${review.overallRating} = 5)`,
      })
      .from(review)
      .where(eq(review.sellerId, sellerId));

    return c.json({
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      averageRating: Number(ratingStats[0]?.avgRating || 0),
      ratingDistribution: {
        1: Number(ratingStats[0]?.rating1 || 0),
        2: Number(ratingStats[0]?.rating2 || 0),
        3: Number(ratingStats[0]?.rating3 || 0),
        4: Number(ratingStats[0]?.rating4 || 0),
        5: Number(ratingStats[0]?.rating5 || 0),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

/**
 * POST /api/seller/dashboard/reviews/:reviewId/respond
 * Respond to a customer review
 */
app.post('/reviews/:reviewId/respond', async (c) => {
  const sellerId = c.get('sellerId') as string;
  const reviewId = c.req.param('reviewId');

  try {
    const body = await c.req.json();
    const { response } = body;

    if (!response || response.trim().length === 0) {
      return c.json({ error: 'Response text is required' }, 400);
    }

    // Verify review belongs to seller
    const reviewRecord = await db.query.review.findFirst({
      where: and(eq(review.id, reviewId), eq(review.sellerId, sellerId)),
    });

    if (!reviewRecord) {
      return c.json({ error: 'Review not found' }, 404);
    }

    if (reviewRecord.sellerResponse) {
      return c.json({ error: 'Review already has a response' }, 400);
    }

    // Update review with response
    await db
      .update(review)
      .set({
        sellerResponse: response,
        respondedAt: new Date(),
      })
      .where(eq(review.id, reviewId));

    return c.json({
      message: 'Response added successfully',
      reviewId,
    });
  } catch (error) {
    console.error('Error responding to review:', error);
    return c.json({ error: 'Failed to add response' }, 500);
  }
});

/**
 * GET /api/seller/dashboard/analytics
 * Get analytics data for charts and trends
 */
app.get('/analytics', async (c) => {
  const sellerId = c.get('sellerId') as string;

  try {
    const periodParam = c.req.query('period');
    const period: 'today' | 'week' | 'month' | 'year' =
      periodParam === 'today' ||
      periodParam === 'week' ||
      periodParam === 'month' ||
      periodParam === 'year'
        ? periodParam
        : 'month';

    const now = new Date();
    const endDate = new Date(now);
    let startDate: Date;

    // Calculate date range based on period
    switch (period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 364);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
    }

    const periodDurationMs = endDate.getTime() - startDate.getTime();
    const previousEndDate = new Date(startDate.getTime() - 1);
    const previousStartDate = new Date(previousEndDate.getTime() - periodDurationMs);

    // Current period listing analytics
    const currentListingAnalytics = await db.query.listingAnalytics.findMany({
      where: and(
        eq(listingAnalytics.sellerId, sellerId),
        gte(listingAnalytics.date, startDate),
        lte(listingAnalytics.date, endDate)
      ),
      orderBy: asc(listingAnalytics.date),
    });

    // Previous period listing analytics
    const previousListingAnalytics = await db.query.listingAnalytics.findMany({
      where: and(
        eq(listingAnalytics.sellerId, sellerId),
        gte(listingAnalytics.date, previousStartDate),
        lte(listingAnalytics.date, previousEndDate)
      ),
    });

    // Current period bookings (all + revenue from completed)
    const currentBookings = await db.query.booking.findMany({
      where: and(
        eq(booking.sellerId, sellerId),
        gte(booking.createdAt, startDate),
        lte(booking.createdAt, endDate)
      ),
      columns: {
        id: true,
        listingId: true,
        createdAt: true,
        totalAmount: true,
        paymentStatus: true,
      },
      orderBy: asc(booking.createdAt),
    });

    // Previous period bookings
    const previousBookings = await db.query.booking.findMany({
      where: and(
        eq(booking.sellerId, sellerId),
        gte(booking.createdAt, previousStartDate),
        lte(booking.createdAt, previousEndDate)
      ),
      columns: {
        id: true,
        listingId: true,
        totalAmount: true,
        paymentStatus: true,
      },
    });

    const currentViews = currentListingAnalytics.reduce((sum, row) => sum + row.views, 0);
    const currentUniqueViews = currentListingAnalytics.reduce(
      (sum, row) => sum + row.uniqueViews,
      0
    );
    const currentBookingsCount = currentBookings.length;
    const currentRevenue = currentBookings.reduce(
      (sum, row) => sum + (row.paymentStatus === 'completed' ? Number(row.totalAmount) : 0),
      0
    );

    const previousViews = previousListingAnalytics.reduce((sum, row) => sum + row.views, 0);
    const previousBookingsCount = previousBookings.length;
    const previousRevenue = previousBookings.reduce(
      (sum, row) => sum + (row.paymentStatus === 'completed' ? Number(row.totalAmount) : 0),
      0
    );

    const currentConversionRate =
      currentViews > 0 ? (currentBookingsCount / currentViews) * 100 : 0;
    const previousConversionRate =
      previousViews > 0 ? (previousBookingsCount / previousViews) * 100 : 0;

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(2));
    };

    const viewsChange = calculateChange(currentViews, previousViews);
    const bookingsChange = calculateChange(currentBookingsCount, previousBookingsCount);
    const revenueChange = calculateChange(currentRevenue, previousRevenue);
    const conversionChange = calculateChange(currentConversionRate, previousConversionRate);

    const toDateKey = (value: Date) => value.toISOString().split('T')[0];
    const startOfDay = (value: Date) => {
      const normalized = new Date(value);
      normalized.setHours(0, 0, 0, 0);
      return normalized;
    };

    // Build daily chart buckets for the selected period
    const dailyViewsMap = currentListingAnalytics.reduce(
      (acc, row) => {
        const key = toDateKey(row.date);
        acc[key] = (acc[key] || 0) + row.views;
        return acc;
      },
      {} as Record<string, number>
    );

    const dailyRevenueAndBookingsMap = currentBookings.reduce(
      (acc, day) => ({
        ...acc,
        [toDateKey(day.createdAt)]: {
          bookings: (acc[toDateKey(day.createdAt)]?.bookings || 0) + 1,
          revenue:
            (acc[toDateKey(day.createdAt)]?.revenue || 0) +
            (day.paymentStatus === 'completed' ? Number(day.totalAmount) : 0),
        },
      }),
      {} as Record<string, { bookings: number; revenue: number }>
    );

    const revenueChart: Array<{ date: string; revenue: number; bookings: number }> = [];
    const viewsChart: Array<{ date: string; views: number }> = [];

    for (
      let cursor = startOfDay(startDate);
      cursor <= endDate;
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000)
    ) {
      const key = toDateKey(cursor);
      const bookingStats = dailyRevenueAndBookingsMap[key] || { bookings: 0, revenue: 0 };

      revenueChart.push({
        date: key,
        revenue: Number(bookingStats.revenue.toFixed(2)),
        bookings: bookingStats.bookings,
      });

      viewsChart.push({
        date: key,
        views: dailyViewsMap[key] || 0,
      });
    }

    // Get top listings
    const sellerListings = await db.query.listing.findMany({
      where: eq(listing.sellerId, sellerId),
      columns: {
        id: true,
        title: true,
      },
    });

    const listingViewsMap = currentListingAnalytics.reduce(
      (acc, row) => {
        acc[row.listingId] = (acc[row.listingId] || 0) + row.views;
        return acc;
      },
      {} as Record<string, number>
    );

    const listingBookingsAndRevenueMap = currentBookings.reduce(
      (acc, row) => {
        const current = acc[row.listingId] || { bookings: 0, revenue: 0 };
        current.bookings += 1;
        if (row.paymentStatus === 'completed') {
          current.revenue += Number(row.totalAmount);
        }
        acc[row.listingId] = current;
        return acc;
      },
      {} as Record<string, { bookings: number; revenue: number }>
    );

    const topListings = sellerListings
      .map((row) => {
        const stats = listingBookingsAndRevenueMap[row.id] || { bookings: 0, revenue: 0 };
        const views = listingViewsMap[row.id] || 0;
        return {
          id: row.id,
          title: row.title,
          views,
          bookings: stats.bookings,
          revenue: stats.revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings || b.views - a.views)
      .slice(0, 5)
      .map((row) => ({
        id: row.id,
        title: row.title,
        views: row.views,
        bookings: row.bookings,
        revenue: row.revenue.toFixed(2),
      }));

    return c.json({
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalViews: currentViews,
      uniqueViews: currentUniqueViews,
      totalBookings: currentBookingsCount,
      totalRevenue: currentRevenue.toFixed(2),
      conversionRate: Number(currentConversionRate.toFixed(2)),
      viewsChange,
      bookingsChange,
      revenueChange,
      conversionChange,
      revenueChart,
      viewsChart,
      topListings,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

export default app;
