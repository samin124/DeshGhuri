import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db, eq, userRole } from '@DeshGhuri/db';
import { auth } from '@DeshGhuri/auth';

/**
 * Middleware to require admin authentication
 * Checks if the user is authenticated and has admin or super_admin role
 */
export async function requireAdmin(c: Context, next: () => Promise<void>) {
  // Get session using Better Auth
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw new HTTPException(401, {
      message: 'Unauthorized: No valid session found',
    });
  }

  // Get user roles from database
  const userRoles = await db.query.userRole.findMany({
    where: eq(userRole.userId, session.user.id),
  });

  const roles = userRoles.map((r) => r.role);

  // Check if user has admin or super_admin role
  const isAdmin = roles.some((role) => role === 'admin' || role === 'super_admin');

  if (!isAdmin) {
    throw new HTTPException(403, {
      message: 'Forbidden: Admin access required',
    });
  }

  // Store user info and roles in context for use in route handlers
  c.set('userId', session.user.id);
  c.set('userEmail', session.user.email);
  c.set('userRoles', roles);
  c.set('isSuperAdmin', roles.includes('super_admin'));

  await next();
}

/**
 * Middleware to require super admin authentication
 * Checks if the user is authenticated and has super_admin role
 */
export async function requireSuperAdmin(c: Context, next: () => Promise<void>) {
  // Get session using Better Auth
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw new HTTPException(401, {
      message: 'Unauthorized: No valid session found',
    });
  }

  // Get user roles from database
  const userRoles = await db.query.userRole.findMany({
    where: eq(userRole.userId, session.user.id),
  });

  const roles = userRoles.map((r) => r.role);
  const isSuperAdmin = roles.includes('super_admin');

  if (!isSuperAdmin) {
    throw new HTTPException(403, {
      message: 'Forbidden: Super admin access required',
    });
  }

  // Store user info and roles in context for use in route handlers
  c.set('userId', session.user.id);
  c.set('userEmail', session.user.email);
  c.set('userRoles', roles);
  c.set('isSuperAdmin', true);

  await next();
}
