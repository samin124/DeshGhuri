import { Hono } from 'hono';
import { db, user, userRole, seller, eq, sql, like, and, or, desc, asc } from '@DeshGhuri/db';
import { z } from 'zod';
import { createAuditLog, getRequestMetadata } from '../../lib/audit-log';

const app = new Hono();

/**
 * GET /api/admin/users
 * List all users with pagination, search, and filters
 */
app.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const search = c.req.query('search') || '';
    const role = c.req.query('role') || '';
    const status = c.req.query('status') || ''; // active, suspended
    const sortBy = c.req.query('sortBy') || 'createdAt';
    const sortOrder = (c.req.query('sortOrder') || 'desc') as 'asc' | 'desc';

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(user.name, `%${search}%`),
          like(user.email, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Get users with their roles
    const users = await db.query.user.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy:
        sortOrder === 'asc'
          ? [asc(user[sortBy as keyof typeof user])]
          : [desc(user[sortBy as keyof typeof user])],
      with: {
        roles: true,
      },
    });

    // If role filter is applied, filter in memory (since we need to join)
    let filteredUsers = users;
    if (role) {
      filteredUsers = users.filter((u) =>
        u.roles.some((r) => r.role === role)
      );
    }

    // Get seller info for users who are sellers
    const usersWithSellerInfo = await Promise.all(
      filteredUsers.map(async (u) => {
        const isSeller = u.roles.some((r) => r.role === 'seller');
        let sellerInfo = null;

        if (isSeller) {
          sellerInfo = await db.query.seller.findFirst({
            where: eq(seller.userId, u.id),
            columns: {
              id: true,
              businessName: true,
              verificationStatus: true,
            },
          });
        }

        return {
          ...u,
          seller: sellerInfo,
        };
      })
    );

    return c.json({
      users: usersWithSellerInfo,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List users error:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

/**
 * GET /api/admin/users/:id
 * Get detailed user information
 */
app.get('/:id', async (c) => {
  try {
    const userId = c.req.param('id');

    const userData = await db.query.user.findFirst({
      where: eq(user.id, userId),
      with: {
        roles: true,
        sessions: {
          orderBy: [desc(sql`created_at`)],
          limit: 5,
        },
      },
    });

    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Get seller info if user is a seller
    const isSeller = userData.roles.some((r) => r.role === 'seller');
    let sellerInfo = null;

    if (isSeller) {
      sellerInfo = await db.query.seller.findFirst({
        where: eq(seller.userId, userId),
        with: {
          documents: true,
          bankAccount: true,
          timeline: {
            orderBy: [desc(sql`created_at`)],
          },
        },
      });
    }

    return c.json({
      user: userData,
      seller: sellerInfo,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

/**
 * PATCH /api/admin/users/:id
 * Update user (suspend, reactivate, etc.)
 */
app.patch('/:id', async (c) => {
  try {
    const userId = c.req.param('id');
    const adminUserId = c.get('userId') as string;
    const body = await c.req.json();

    const updateSchema = z.object({
      action: z.enum(['suspend', 'reactivate', 'update-email', 'verify-email']),
      email: z.string().email().optional(),
      reason: z.string().optional(),
    });

    const { action, email, reason } = updateSchema.parse(body);

    // Get current user data
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!currentUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    let updateData: Partial<typeof user.$inferSelect> = {};
    let auditAction = '';

    switch (action) {
      case 'verify-email':
        updateData.emailVerified = true;
        auditAction = 'user.verify-email';
        break;

      case 'update-email':
        if (!email) {
          return c.json({ error: 'Email is required' }, 400);
        }
        updateData.email = email;
        updateData.emailVerified = false;
        auditAction = 'user.update-email';
        break;

      default:
        return c.json({ error: 'Invalid action' }, 400);
    }

    // Update user
    await db.update(user).set(updateData).where(eq(user.id, userId));

    // Get updated user data
    const updatedUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    // Create audit log
    await createAuditLog({
      userId: adminUserId,
      action: auditAction,
      entityType: 'user',
      entityId: userId,
      oldValue: currentUser,
      newValue: updatedUser,
      metadata: {
        ...getRequestMetadata(c.req.raw.headers),
        reason: reason || undefined,
      },
    });

    return c.json({
      user: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.issues }, 400);
    }
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

/**
 * DELETE /api/admin/users/:id
 * Soft delete user (we'll add a deletedAt field via update)
 */
app.delete('/:id', async (c) => {
  try {
    const userId = c.req.param('id');
    const adminUserId = c.get('userId') as string;
    const body = await c.req.json();

    const deleteSchema = z.object({
      reason: z.string().min(1, 'Reason is required'),
    });

    const { reason } = deleteSchema.parse(body);

    // Get current user data
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!currentUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Check if user is admin/super_admin
    const userRoles = await db.query.userRole.findMany({
      where: eq(userRole.userId, userId),
    });

    const isAdmin = userRoles.some((r) =>
      ['admin', 'super_admin'].includes(r.role)
    );

    if (isAdmin) {
      return c.json(
        { error: 'Cannot delete admin users. Please remove admin role first.' },
        403
      );
    }

    // Delete user (cascade will handle related records)
    await db.delete(user).where(eq(user.id, userId));

    // Create audit log
    await createAuditLog({
      userId: adminUserId,
      action: 'user.delete',
      entityType: 'user',
      entityId: userId,
      oldValue: currentUser,
      newValue: null,
      metadata: {
        ...getRequestMetadata(c.req.raw.headers),
        reason,
      },
    });

    return c.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.issues }, 400);
    }
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

/**
 * POST /api/admin/users/:id/roles
 * Add a role to user
 */
app.post('/:id/roles', async (c) => {
  try {
    const userId = c.req.param('id');
    const adminUserId = c.get('userId') as string;
    const body = await c.req.json();

    const roleSchema = z.object({
      role: z.enum(['customer', 'seller', 'admin', 'super_admin']),
    });

    const { role } = roleSchema.parse(body);

    // Check if user exists
    const userData = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Check if role already exists
    const existingRole = await db.query.userRole.findFirst({
      where: and(eq(userRole.userId, userId), eq(userRole.role, role)),
    });

    if (existingRole) {
      return c.json({ error: 'User already has this role' }, 400);
    }

    // Only super_admin can assign admin or super_admin roles
    const isSuperAdmin = c.get('isSuperAdmin') as boolean;
    if (['admin', 'super_admin'].includes(role) && !isSuperAdmin) {
      return c.json(
        { error: 'Only super admins can assign admin roles' },
        403
      );
    }

    // Prevent sellers from becoming admins
    if (['admin', 'super_admin'].includes(role)) {
      const existingSeller = await db.query.seller.findFirst({
        where: eq(seller.userId, userId),
      });

      if (existingSeller) {
        return c.json({
          error: 'Users with seller accounts cannot be assigned admin roles. Admin and seller roles must be kept separate for security and conflict of interest reasons.'
        }, 403);
      }
    }

    // Prevent admins from being assigned seller role
    if (role === 'seller') {
      const userRoles = await db.query.userRole.findMany({
        where: eq(userRole.userId, userId),
      });

      const roles = userRoles.map((r) => r.role);
      const isAdmin = roles.some((r) => r === 'admin' || r === 'super_admin');

      if (isAdmin) {
        return c.json({
          error: 'Admin users cannot be assigned the seller role. Admin and seller roles must be kept separate for security and conflict of interest reasons.'
        }, 403);
      }
    }

    // Add role
    const { generateId } = await import('../../lib/id');
    await db.insert(userRole).values({
      id: generateId('role'),
      userId,
      role,
      createdAt: new Date(),
      createdBy: adminUserId,
    });

    // Create audit log
    await createAuditLog({
      userId: adminUserId,
      action: 'user.role.add',
      entityType: 'user',
      entityId: userId,
      oldValue: null,
      newValue: { role },
      metadata: getRequestMetadata(c.req.raw.headers),
    });

    return c.json({
      message: 'Role added successfully',
    });
  } catch (error) {
    console.error('Add role error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.issues }, 400);
    }
    return c.json({ error: 'Failed to add role' }, 500);
  }
});

/**
 * DELETE /api/admin/users/:id/roles/:roleId
 * Remove a role from user
 */
app.delete('/:id/roles/:roleId', async (c) => {
  try {
    const userId = c.req.param('id');
    const roleId = c.req.param('roleId');
    const adminUserId = c.get('userId') as string;

    // Get role data
    const roleData = await db.query.userRole.findFirst({
      where: and(eq(userRole.id, roleId), eq(userRole.userId, userId)),
    });

    if (!roleData) {
      return c.json({ error: 'Role not found' }, 404);
    }

    // Only super_admin can remove admin or super_admin roles
    const isSuperAdmin = c.get('isSuperAdmin') as boolean;
    if (
      ['admin', 'super_admin'].includes(roleData.role) &&
      !isSuperAdmin
    ) {
      return c.json(
        { error: 'Only super admins can remove admin roles' },
        403
      );
    }

    // Delete role
    await db.delete(userRole).where(eq(userRole.id, roleId));

    // Create audit log
    await createAuditLog({
      userId: adminUserId,
      action: 'user.role.remove',
      entityType: 'user',
      entityId: userId,
      oldValue: { role: roleData.role },
      newValue: null,
      metadata: getRequestMetadata(c.req.raw.headers),
    });

    return c.json({
      message: 'Role removed successfully',
    });
  } catch (error) {
    console.error('Remove role error:', error);
    return c.json({ error: 'Failed to remove role' }, 500);
  }
});

export default app;
