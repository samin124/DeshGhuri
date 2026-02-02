import { Hono } from 'hono';
import {
  db,
  seller,
  sellerDocument,
  sellerBankAccount,
  verificationTimeline,
  user,
  eq,
  sql,
  like,
  and,
  or,
  desc,
  asc,
} from '@DeshGhuri/db';
import { z } from 'zod';
import { createAuditLog, getRequestMetadata } from '../../lib/audit-log';
import { generateId } from '../../lib/id';
import { emailService } from '../../lib/email/service';

const app = new Hono();

/**
 * GET /api/admin/sellers
 * List all sellers with pagination, search, and filters
 */
app.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const search = c.req.query('search') || '';
    const status = c.req.query('status') || ''; // pending, in-review, approved, rejected
    const category = c.req.query('category') || ''; // agency, hotel, tour-operator
    const sortBy = c.req.query('sortBy') || 'createdAt';
    const sortOrder = (c.req.query('sortOrder') || 'desc') as 'asc' | 'desc';

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(seller.businessName, `%${search}%`),
          like(seller.contactEmail, `%${search}%`),
          like(seller.registrationNumber, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(seller.verificationStatus, status));
    }

    if (category) {
      conditions.push(eq(seller.category, category));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(seller)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Get sellers with user info
    const sellers = await db.query.seller.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy:
        sortOrder === 'asc'
          ? [asc(seller[sortBy as keyof typeof seller])]
          : [desc(seller[sortBy as keyof typeof seller])],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        documents: {
          columns: {
            id: true,
            documentType: true,
            status: true,
          },
        },
      },
    });

    return c.json({
      sellers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List sellers error:', error);
    return c.json({ error: 'Failed to fetch sellers' }, 500);
  }
});

/**
 * GET /api/admin/sellers/verification-queue
 * Get sellers pending verification (pending + in-review)
 */
app.get('/verification-queue', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    // Get sellers pending or in review
    const whereClause = or(
      eq(seller.verificationStatus, 'pending'),
      eq(seller.verificationStatus, 'in-review')
    );

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(seller)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Get sellers ordered by creation date (oldest first)
    const sellers = await db.query.seller.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: [asc(seller.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        documents: {
          columns: {
            id: true,
            documentType: true,
            status: true,
            uploadedAt: true,
          },
        },
      },
    });

    // Calculate priority (how long pending)
    const sellersWithPriority = sellers.map((s) => {
      const daysPending = Math.floor(
        (Date.now() - new Date(s.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      let priority: 'low' | 'medium' | 'high' = 'low';
      if (daysPending > 7) priority = 'high';
      else if (daysPending > 3) priority = 'medium';

      return {
        ...s,
        daysPending,
        priority,
      };
    });

    return c.json({
      sellers: sellersWithPriority,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Verification queue error:', error);
    return c.json({ error: 'Failed to fetch verification queue' }, 500);
  }
});

/**
 * GET /api/admin/sellers/:id
 * Get detailed seller information
 */
app.get('/:id', async (c) => {
  try {
    const sellerId = c.req.param('id');

    const sellerData = await db.query.seller.findFirst({
      where: eq(seller.id, sellerId),
      with: {
        user: true,
        documents: {
          orderBy: [desc(sellerDocument.uploadedAt)],
        },
        bankAccount: true,
        timeline: {
          orderBy: [desc(verificationTimeline.createdAt)],
          with: {
            performedByUser: {
              columns: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!sellerData) {
      return c.json({ error: 'Seller not found' }, 404);
    }

    return c.json({
      seller: sellerData,
    });
  } catch (error) {
    console.error('Get seller error:', error);
    return c.json({ error: 'Failed to fetch seller' }, 500);
  }
});

/**
 * PATCH /api/admin/sellers/:id/verification
 * Update seller verification status (approve/reject/request changes)
 */
app.patch('/:id/verification', async (c) => {
  try {
    const sellerId = c.req.param('id');
    const adminUserId = c.get('userId') as string;
    const body = await c.req.json();

    const verificationSchema = z.object({
      status: z.enum(['approved', 'rejected', 'in-review', 'incomplete']),
      reason: z.string().optional(),
      message: z.string().min(1, 'Message is required'),
    });

    const { status, reason, message } = verificationSchema.parse(body);

    // Get current seller data
    const currentSeller = await db.query.seller.findFirst({
      where: eq(seller.id, sellerId),
    });

    if (!currentSeller) {
      return c.json({ error: 'Seller not found' }, 404);
    }

    // Update seller status
    const updateData: Partial<typeof seller.$inferSelect> = {
      verificationStatus: status,
      updatedAt: new Date(),
    };

    if (status === 'approved') {
      updateData.verifiedAt = new Date();
    }

    await db.update(seller).set(updateData).where(eq(seller.id, sellerId));

    // Create timeline entry
    await db.insert(verificationTimeline).values({
      id: generateId('timeline'),
      sellerId,
      status,
      message,
      performedBy: adminUserId,
      createdAt: new Date(),
    });

    // Get updated seller data with user info
    const updatedSeller = await db.query.seller.findFirst({
      where: eq(seller.id, sellerId),
      with: {
        user: true,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: adminUserId,
      action: `seller.verification.${status}`,
      entityType: 'seller',
      entityId: sellerId,
      oldValue: { verificationStatus: currentSeller.verificationStatus },
      newValue: { verificationStatus: status },
      metadata: {
        ...getRequestMetadata(c.req.raw.headers),
        reason,
        message,
      },
    });

    // Send email notification to seller
    if (updatedSeller) {
      const baseUrl = process.env.WEB_URL || 'http://localhost:5173';

      try {
        switch (status) {
          case 'approved':
            await emailService.sendSellerVerificationApproved({
              to: updatedSeller.user.email,
              userName: updatedSeller.user.name || 'Seller',
              businessName: updatedSeller.businessName,
              message,
              dashboardUrl: `${baseUrl}/seller/dashboard`,
            });
            break;

          case 'rejected':
            await emailService.sendSellerVerificationRejected({
              to: updatedSeller.user.email,
              userName: updatedSeller.user.name || 'Seller',
              businessName: updatedSeller.businessName,
              message,
              reason,
              reapplyUrl: `${baseUrl}/seller/application`,
            });
            break;

          case 'incomplete':
            await emailService.sendSellerVerificationIncomplete({
              to: updatedSeller.user.email,
              userName: updatedSeller.user.name || 'Seller',
              businessName: updatedSeller.businessName,
              message,
              applicationUrl: `${baseUrl}/seller/application`,
            });
            break;

          case 'in-review':
            await emailService.sendSellerVerificationInReview({
              to: updatedSeller.user.email,
              userName: updatedSeller.user.name || 'Seller',
              businessName: updatedSeller.businessName,
              message,
            });
            break;
        }
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    return c.json({
      seller: updatedSeller,
      message: 'Seller verification status updated successfully',
    });
  } catch (error) {
    console.error('Update seller verification error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.issues }, 400);
    }
    return c.json({ error: 'Failed to update seller verification' }, 500);
  }
});

/**
 * PATCH /api/admin/sellers/:id
 * Update seller information (admin override)
 */
app.patch('/:id', async (c) => {
  try {
    const sellerId = c.req.param('id');
    const adminUserId = c.get('userId') as string;
    const body = await c.req.json();

    const updateSchema = z.object({
      businessName: z.string().min(1).optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().min(1).optional(),
      businessDescription: z.string().optional(),
      reason: z.string().min(1, 'Reason for update is required'),
    });

    const { reason, ...updateData } = updateSchema.parse(body);

    // Get current seller data
    const currentSeller = await db.query.seller.findFirst({
      where: eq(seller.id, sellerId),
    });

    if (!currentSeller) {
      return c.json({ error: 'Seller not found' }, 404);
    }

    // Update seller
    await db
      .update(seller)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(seller.id, sellerId));

    // Get updated seller data
    const updatedSeller = await db.query.seller.findFirst({
      where: eq(seller.id, sellerId),
    });

    // Create audit log
    await createAuditLog({
      userId: adminUserId,
      action: 'seller.update',
      entityType: 'seller',
      entityId: sellerId,
      oldValue: currentSeller,
      newValue: updatedSeller,
      metadata: {
        ...getRequestMetadata(c.req.raw.headers),
        reason,
      },
    });

    return c.json({
      seller: updatedSeller,
      message: 'Seller updated successfully',
    });
  } catch (error) {
    console.error('Update seller error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.issues }, 400);
    }
    return c.json({ error: 'Failed to update seller' }, 500);
  }
});

export default app;
