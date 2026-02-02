import { Hono } from 'hono';
import {
  db,
  sellerDocument,
  seller,
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
import { emailService } from '../../lib/email/service';

const app = new Hono();

/**
 * GET /api/admin/documents
 * List all documents with pagination, search, and filters
 */
app.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const search = c.req.query('search') || '';
    const status = c.req.query('status') || ''; // pending, approved, rejected
    const documentType = c.req.query('documentType') || '';
    const sellerId = c.req.query('sellerId') || '';
    const sortBy = c.req.query('sortBy') || 'uploadedAt';
    const sortOrder = (c.req.query('sortOrder') || 'desc') as 'asc' | 'desc';

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(like(sellerDocument.fileName, `%${search}%`));
    }

    if (status) {
      conditions.push(eq(sellerDocument.status, status));
    }

    if (documentType) {
      conditions.push(eq(sellerDocument.documentType, documentType));
    }

    if (sellerId) {
      conditions.push(eq(sellerDocument.sellerId, sellerId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sellerDocument)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Get documents with seller and user info
    const documents = await db.query.sellerDocument.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy:
        sortOrder === 'asc'
          ? [asc(sellerDocument[sortBy as keyof typeof sellerDocument])]
          : [desc(sellerDocument[sortBy as keyof typeof sellerDocument])],
      with: {
        seller: {
          columns: {
            id: true,
            businessName: true,
            verificationStatus: true,
          },
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        reviewer: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return c.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List documents error:', error);
    return c.json({ error: 'Failed to fetch documents' }, 500);
  }
});

/**
 * GET /api/admin/documents/:id
 * Get detailed document information
 */
app.get('/:id', async (c) => {
  try {
    const documentId = c.req.param('id');

    const documentData = await db.query.sellerDocument.findFirst({
      where: eq(sellerDocument.id, documentId),
      with: {
        seller: {
          with: {
            user: true,
            bankAccount: true,
          },
        },
        reviewer: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!documentData) {
      return c.json({ error: 'Document not found' }, 404);
    }

    return c.json({
      document: documentData,
    });
  } catch (error) {
    console.error('Get document error:', error);
    return c.json({ error: 'Failed to fetch document' }, 500);
  }
});

/**
 * PATCH /api/admin/documents/:id/review
 * Review document (approve/reject)
 */
app.patch('/:id/review', async (c) => {
  try {
    const documentId = c.req.param('id');
    const adminUserId = c.get('userId') as string;
    const body = await c.req.json();

    const reviewSchema = z.object({
      status: z.enum(['approved', 'rejected']),
      rejectionReason: z.string().optional(),
    });

    const { status, rejectionReason } = reviewSchema.parse(body);

    // Validate rejection reason is provided when rejecting
    if (status === 'rejected' && !rejectionReason) {
      return c.json(
        { error: 'Rejection reason is required when rejecting a document' },
        400
      );
    }

    // Get current document data
    const currentDocument = await db.query.sellerDocument.findFirst({
      where: eq(sellerDocument.id, documentId),
    });

    if (!currentDocument) {
      return c.json({ error: 'Document not found' }, 404);
    }

    // Update document
    await db
      .update(sellerDocument)
      .set({
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
        reviewedAt: new Date(),
        reviewedBy: adminUserId,
      })
      .where(eq(sellerDocument.id, documentId));

    // Get updated document data
    const updatedDocument = await db.query.sellerDocument.findFirst({
      where: eq(sellerDocument.id, documentId),
      with: {
        seller: {
          with: {
            user: {
              columns: {
                email: true,
              },
            },
          },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      userId: adminUserId,
      action: `document.review.${status}`,
      entityType: 'document',
      entityId: documentId,
      oldValue: { status: currentDocument.status },
      newValue: { status, rejectionReason },
      metadata: {
        ...getRequestMetadata(c.req.raw.headers),
        documentType: currentDocument.documentType,
        sellerId: currentDocument.sellerId,
      },
    });

    // Send email notification to seller
    if (updatedDocument && updatedDocument.seller) {
      const baseUrl = process.env.WEB_URL || 'http://localhost:5173';

      try {
        const documentTypeLabels: Record<string, string> = {
          'trade-license': 'Trade License',
          'nid': 'National ID',
          'passport': 'Passport',
          'tin-certificate': 'TIN Certificate',
          'property-docs': 'Property Documents',
          'tour-license': 'Tour License',
        };

        const documentTypeLabel = documentTypeLabels[currentDocument.documentType] || currentDocument.documentType;

        if (status === 'approved') {
          await emailService.sendDocumentApproved({
            to: updatedDocument.seller.user.email,
            userName: updatedDocument.seller.user.name || 'Seller',
            documentType: documentTypeLabel,
            businessName: updatedDocument.seller.businessName,
          });
        } else if (status === 'rejected' && rejectionReason) {
          await emailService.sendDocumentRejected({
            to: updatedDocument.seller.user.email,
            userName: updatedDocument.seller.user.name || 'Seller',
            documentType: documentTypeLabel,
            businessName: updatedDocument.seller.businessName,
            rejectionReason,
            reuploadUrl: `${baseUrl}/seller/documents`,
          });
        }
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Check if all documents for this seller are reviewed
    if (updatedDocument) {
      const allDocuments = await db.query.sellerDocument.findMany({
        where: eq(sellerDocument.sellerId, currentDocument.sellerId),
      });

      const allReviewed = allDocuments.every((doc) =>
        ['approved', 'rejected'].includes(doc.status)
      );
      const anyRejected = allDocuments.some((doc) => doc.status === 'rejected');

      // If all documents are reviewed, we could update seller status
      // But we'll leave that to the seller verification endpoint
      // This is just for informational purposes
      const documentsReviewStatus = {
        allReviewed,
        anyRejected,
        total: allDocuments.length,
        approved: allDocuments.filter((d) => d.status === 'approved').length,
        rejected: allDocuments.filter((d) => d.status === 'rejected').length,
        pending: allDocuments.filter((d) => d.status === 'pending').length,
      };

      return c.json({
        document: updatedDocument,
        documentsReviewStatus,
        message: 'Document reviewed successfully',
      });
    }

    return c.json({
      document: updatedDocument,
      message: 'Document reviewed successfully',
    });
  } catch (error) {
    console.error('Review document error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.issues }, 400);
    }
    return c.json({ error: 'Failed to review document' }, 500);
  }
});

/**
 * POST /api/admin/documents/:sellerId/bulk-review
 * Bulk review all documents for a seller
 */
app.post('/:sellerId/bulk-review', async (c) => {
  try {
    const sellerId = c.req.param('sellerId');
    const adminUserId = c.get('userId') as string;
    const body = await c.req.json();

    const bulkReviewSchema = z.object({
      status: z.enum(['approved', 'rejected']),
      rejectionReason: z.string().optional(),
    });

    const { status, rejectionReason } = bulkReviewSchema.parse(body);

    if (status === 'rejected' && !rejectionReason) {
      return c.json(
        { error: 'Rejection reason is required when rejecting documents' },
        400
      );
    }

    // Get all pending documents for this seller
    const documents = await db.query.sellerDocument.findMany({
      where: and(
        eq(sellerDocument.sellerId, sellerId),
        eq(sellerDocument.status, 'pending')
      ),
    });

    if (documents.length === 0) {
      return c.json({ error: 'No pending documents found for this seller' }, 404);
    }

    // Update all pending documents
    await db
      .update(sellerDocument)
      .set({
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
        reviewedAt: new Date(),
        reviewedBy: adminUserId,
      })
      .where(
        and(
          eq(sellerDocument.sellerId, sellerId),
          eq(sellerDocument.status, 'pending')
        )
      );

    // Create audit log for bulk action
    await createAuditLog({
      userId: adminUserId,
      action: `document.bulk-review.${status}`,
      entityType: 'seller',
      entityId: sellerId,
      oldValue: { documentCount: documents.length },
      newValue: { status, rejectionReason },
      metadata: {
        ...getRequestMetadata(c.req.raw.headers),
        documentIds: documents.map((d) => d.id),
      },
    });

    return c.json({
      message: `${documents.length} documents ${status} successfully`,
      count: documents.length,
    });
  } catch (error) {
    console.error('Bulk review documents error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.issues }, 400);
    }
    return c.json({ error: 'Failed to bulk review documents' }, 500);
  }
});

export default app;
