import { Hono } from 'hono';
import { db, user, seller, sellerDocument, userRole, eq, sql, and, desc } from '@DeshGhuri/db';

const app = new Hono();

/**
 * GET /api/admin/dashboard/stats
 * Get dashboard overview statistics
 */
app.get('/stats', async (c) => {
  try {
    const userId = c.get('userId') as string;

    // Get total users count
    const totalUsersResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get users created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersTodayResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user)
      .where(sql`${user.createdAt} >= ${today}`);
    const newUsersToday = newUsersTodayResult[0]?.count || 0;

    // Get total sellers count
    const totalSellersResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(seller);
    const totalSellers = totalSellersResult[0]?.count || 0;

    // Get sellers pending verification
    const pendingVerificationResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(seller)
      .where(eq(seller.verificationStatus, 'pending'));
    const pendingVerification = pendingVerificationResult[0]?.count || 0;

    // Get sellers in review
    const inReviewResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(seller)
      .where(eq(seller.verificationStatus, 'in-review'));
    const inReview = inReviewResult[0]?.count || 0;

    // Get approved sellers
    const approvedSellersResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(seller)
      .where(eq(seller.verificationStatus, 'approved'));
    const approvedSellers = approvedSellersResult[0]?.count || 0;

    // Get documents pending review
    const documentsPendingResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sellerDocument)
      .where(eq(sellerDocument.status, 'pending'));
    const documentsPending = documentsPendingResult[0]?.count || 0;

    // Get total documents
    const totalDocumentsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sellerDocument);
    const totalDocuments = totalDocumentsResult[0]?.count || 0;

    // Get admin users count
    const adminUsersResult = await db
      .select({ count: sql<number>`count(DISTINCT ${userRole.userId})::int` })
      .from(userRole)
      .where(sql`${userRole.role} IN ('admin', 'super_admin')`);
    const adminUsers = adminUsersResult[0]?.count || 0;

    return c.json({
      users: {
        total: totalUsers,
        newToday: newUsersToday,
      },
      sellers: {
        total: totalSellers,
        pendingVerification,
        inReview,
        approved: approvedSellers,
      },
      documents: {
        total: totalDocuments,
        pending: documentsPending,
      },
      admins: {
        total: adminUsers,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return c.json({ error: 'Failed to fetch dashboard stats' }, 500);
  }
});

/**
 * GET /api/admin/dashboard/pending-actions
 * Get items that need admin attention
 */
app.get('/pending-actions', async (c) => {
  try {
    // Get pending sellers (limit 10)
    const pendingSellers = await db.query.seller.findMany({
      where: eq(seller.verificationStatus, 'pending'),
      orderBy: [seller.createdAt],
      limit: 10,
      with: {
        user: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Get sellers in review (limit 10)
    const inReviewSellers = await db.query.seller.findMany({
      where: eq(seller.verificationStatus, 'in-review'),
      orderBy: [seller.updatedAt],
      limit: 10,
      with: {
        user: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Get pending documents (limit 10)
    const pendingDocuments = await db.query.sellerDocument.findMany({
      where: eq(sellerDocument.status, 'pending'),
      orderBy: [sellerDocument.uploadedAt],
      limit: 10,
      with: {
        seller: {
          columns: {
            id: true,
            businessName: true,
          },
          with: {
            user: {
              columns: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return c.json({
      pendingSellers,
      inReviewSellers,
      pendingDocuments,
    });
  } catch (error) {
    console.error('Pending actions error:', error);
    return c.json({ error: 'Failed to fetch pending actions' }, 500);
  }
});

export default app;
