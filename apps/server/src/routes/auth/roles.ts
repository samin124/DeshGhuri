import { Hono } from 'hono';
import { db, userRole, eq } from '@DeshGhuri/db';
import { auth } from '@DeshGhuri/auth';

const app = new Hono();

/**
 * GET /api/auth/roles
 * Returns current user's roles
 * Used for role-based redirects and role switcher
 */
app.get('/', async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return c.json({ roles: [], primaryRole: null }, 401);
    }

    const userRoles = await db.query.userRole.findMany({
      where: eq(userRole.userId, session.user.id),
    });

    const roles = userRoles.map((r) => r.role);
    const primaryRole = determinePrimaryRole(roles);

    return c.json({
      roles,
      primaryRole,
      userId: session.user.id,
      userEmail: session.user.email,
    });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return c.json({ error: 'Failed to fetch roles' }, 500);
  }
});

/**
 * Determines the primary role for a user based on role hierarchy
 * Priority: super_admin > admin > seller > customer
 */
function determinePrimaryRole(roles: string[]): string {
  if (roles.includes('super_admin')) return 'super_admin';
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('seller')) return 'seller';
  if (roles.includes('customer')) return 'customer';
  return 'customer'; // Default fallback
}

export default app;
