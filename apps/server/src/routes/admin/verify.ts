import { Hono } from 'hono';
import { db, userRole, eq } from '@DeshGhuri/db';
import { auth } from '@DeshGhuri/auth';

const app = new Hono();

/**
 * GET /api/admin/verify
 * Verify if the current user has admin access
 * This endpoint is NOT protected by requireAdmin middleware
 * because it's used during the login process to check admin status
 */
app.get('/', async (c) => {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return c.json({ isAdmin: false, message: 'Not authenticated' }, 401);
    }

    // Check user roles
    const userRoles = await db.query.userRole.findMany({
      where: eq(userRole.userId, session.user.id),
    });

    const roles = userRoles.map((r) => r.role);
    const isAdmin = roles.some((role) => role === 'admin' || role === 'super_admin');

    if (isAdmin) {
      return c.json({
        isAdmin: true,
        role: roles.includes('super_admin') ? 'super_admin' : 'admin',
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
      });
    }

    return c.json({ isAdmin: false, message: 'Insufficient permissions' }, 403);
  } catch (error) {
    console.error('Admin verification error:', error);
    return c.json({ isAdmin: false, message: 'Verification failed' }, 500);
  }
});

export default app;
