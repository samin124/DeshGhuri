import { Hono } from 'hono';
import { db, auditLog, user, eq, sql, like, and, desc, asc, gte, lte } from '@DeshGhuri/db';

const app = new Hono();

/**
 * GET /api/admin/audit-logs
 * Get audit logs with pagination and filters
 */
app.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const userId = c.req.query('userId') || '';
    const action = c.req.query('action') || '';
    const entityType = c.req.query('entityType') || '';
    const entityId = c.req.query('entityId') || '';
    const startDate = c.req.query('startDate') || '';
    const endDate = c.req.query('endDate') || '';
    const sortOrder = (c.req.query('sortOrder') || 'desc') as 'asc' | 'desc';

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (userId) {
      conditions.push(eq(auditLog.userId, userId));
    }

    if (action) {
      conditions.push(like(auditLog.action, `%${action}%`));
    }

    if (entityType) {
      conditions.push(eq(auditLog.entityType, entityType));
    }

    if (entityId) {
      conditions.push(eq(auditLog.entityId, entityId));
    }

    if (startDate) {
      const start = new Date(startDate);
      conditions.push(gte(auditLog.createdAt, start));
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      conditions.push(lte(auditLog.createdAt, end));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLog)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Get audit logs with user info
    const logs = await db.query.auditLog.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: sortOrder === 'asc' ? [asc(auditLog.createdAt)] : [desc(auditLog.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return c.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List audit logs error:', error);
    return c.json({ error: 'Failed to fetch audit logs' }, 500);
  }
});

/**
 * GET /api/admin/audit-logs/stats
 * Get audit log statistics
 */
app.get('/stats', async (c) => {
  try {
    // Get total audit logs count
    const totalResult = await db.select({ count: sql<number>`count(*)::int` }).from(auditLog);
    const total = totalResult[0]?.count || 0;

    // Get logs from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last24hResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLog)
      .where(gte(auditLog.createdAt, oneDayAgo));
    const last24h = last24hResult[0]?.count || 0;

    // Get logs from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last7daysResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLog)
      .where(gte(auditLog.createdAt, sevenDaysAgo));
    const last7days = last7daysResult[0]?.count || 0;

    // Get top actions (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const topActionsResult = await db
      .select({
        action: auditLog.action,
        count: sql<number>`count(*)::int`,
      })
      .from(auditLog)
      .where(gte(auditLog.createdAt, thirtyDaysAgo))
      .groupBy(auditLog.action)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    // Get top entity types (last 30 days)
    const topEntityTypesResult = await db
      .select({
        entityType: auditLog.entityType,
        count: sql<number>`count(*)::int`,
      })
      .from(auditLog)
      .where(gte(auditLog.createdAt, thirtyDaysAgo))
      .groupBy(auditLog.entityType)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    // Get most active admins (last 30 days)
    const topAdminsResult = await db
      .select({
        userId: auditLog.userId,
        count: sql<number>`count(*)::int`,
      })
      .from(auditLog)
      .where(gte(auditLog.createdAt, thirtyDaysAgo))
      .groupBy(auditLog.userId)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    // Get user details for top admins
    const topAdmins = await Promise.all(
      topAdminsResult.map(async (admin) => {
        if (!admin.userId) return { ...admin, user: null };

        const userData = await db.query.user.findFirst({
          where: eq(user.id, admin.userId),
          columns: {
            id: true,
            name: true,
            email: true,
          },
        });

        return {
          ...admin,
          user: userData,
        };
      })
    );

    return c.json({
      total,
      last24h,
      last7days,
      topActions: topActionsResult,
      topEntityTypes: topEntityTypesResult,
      topAdmins,
    });
  } catch (error) {
    console.error('Audit log stats error:', error);
    return c.json({ error: 'Failed to fetch audit log stats' }, 500);
  }
});

/**
 * GET /api/admin/audit-logs/:id
 * Get detailed audit log entry
 */
app.get('/:id', async (c) => {
  try {
    const logId = c.req.param('id');

    const log = await db.query.auditLog.findFirst({
      where: eq(auditLog.id, logId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!log) {
      return c.json({ error: 'Audit log not found' }, 404);
    }

    return c.json({
      log,
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    return c.json({ error: 'Failed to fetch audit log' }, 500);
  }
});

/**
 * GET /api/admin/audit-logs/export
 * Export audit logs as CSV (for compliance)
 */
app.get('/export', async (c) => {
  try {
    const startDate = c.req.query('startDate') || '';
    const endDate = c.req.query('endDate') || '';
    const userId = c.req.query('userId') || '';

    // Build where conditions
    const conditions = [];

    if (startDate) {
      const start = new Date(startDate);
      conditions.push(gte(auditLog.createdAt, start));
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(auditLog.createdAt, end));
    }

    if (userId) {
      conditions.push(eq(auditLog.userId, userId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get all matching logs (limit to 10000 for safety)
    const logs = await db.query.auditLog.findMany({
      where: whereClause,
      limit: 10000,
      orderBy: [desc(auditLog.createdAt)],
      with: {
        user: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Convert to CSV
    const headers = [
      'ID',
      'Timestamp',
      'User ID',
      'User Name',
      'User Email',
      'Action',
      'Entity Type',
      'Entity ID',
      'Old Value',
      'New Value',
      'Metadata',
    ];

    const rows = logs.map((log) => [
      log.id,
      log.createdAt.toISOString(),
      log.userId || '',
      log.user?.name || '',
      log.user?.email || '',
      log.action,
      log.entityType,
      log.entityId,
      JSON.stringify(log.oldValue || {}),
      JSON.stringify(log.newValue || {}),
      JSON.stringify(log.metadata || {}),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    // Set headers for CSV download
    c.header('Content-Type', 'text/csv');
    c.header(
      'Content-Disposition',
      `attachment; filename="audit-logs-${new Date().toISOString()}.csv"`
    );

    return c.body(csvContent);
  } catch (error) {
    console.error('Export audit logs error:', error);
    return c.json({ error: 'Failed to export audit logs' }, 500);
  }
});

export default app;
