import { Hono } from 'hono';
import { db, seller, sellerDocument, sellerBankAccount, verificationTimeline, eq, desc } from '@DeshGhuri/db';
import { uploadFile, deleteFile, isCloudinaryConfigured } from '../lib/cloudinary';
import { z } from 'zod';

const app = new Hono();

// Generate unique ID
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Test endpoint to verify Cloudinary configuration
app.get('/test-cloudinary', async (c) => {
  return c.json({
    configured: isCloudinaryConfigured,
    message: isCloudinaryConfigured
      ? 'Cloudinary is configured and ready'
      : 'Cloudinary is not configured. Add credentials to .env file.',
  });
});

// Validation schemas
const businessInfoSchema = z.object({
  businessName: z.string().min(1),
  category: z.enum(['agency', 'hotel', 'tour-operator']),
  registrationNumber: z.string().min(1),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    district: z.string().min(1),
    postalCode: z.string().optional(),
  }),
  contactPhone: z.string().min(1),
  contactEmail: z.string().email(),
  businessDescription: z.string().optional(),
});

const bankAccountSchema = z.object({
  bankName: z.string().min(1),
  branchName: z.string().min(1),
  accountHolderName: z.string().min(1),
  accountNumber: z.string().min(1),
  routingNumber: z.string().optional(),
  accountType: z.enum(['savings', 'current']),
});

// POST /api/seller/register - Create initial seller record
app.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const userId = body.userId;

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Check if seller already exists for this user
    const existingSeller = await db.query.seller.findFirst({
      where: eq(seller.userId, userId),
    });

    if (existingSeller) {
      return c.json({ error: 'Seller account already exists for this user' }, 400);
    }

    const sellerId = generateId('sel');

    await db.insert(seller).values({
      id: sellerId,
      userId,
      businessName: 'Pending',
      category: 'agency',
      registrationNumber: 'Pending',
      address: { street: '', city: '', district: '', postalCode: '' },
      contactPhone: '',
      contactEmail: '',
      verificationStatus: 'pending',
    });

    return c.json({ sellerId }, 201);
  } catch (error) {
    console.error('Register seller error:', error);
    return c.json({ error: 'Failed to register seller' }, 500);
  }
});

// POST /api/seller/documents/upload - Upload a document
app.post('/documents/upload', async (c) => {
  try {
    console.log('📤 Upload request received');

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured) {
      console.log('❌ Cloudinary not configured');
      return c.json({
        error: 'File upload service not configured. Please contact administrator to configure Cloudinary.'
      }, 503);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const sellerId = formData.get('sellerId') as string;
    const documentType = formData.get('documentType') as string;

    console.log('📋 Upload details:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      sellerId,
      documentType
    });

    if (!file || !sellerId || !documentType) {
      console.log('❌ Missing required fields');
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Validate file size (max 25MB)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size);
      return c.json({ error: 'File size exceeds 25MB limit' }, 400);
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type);
      return c.json({ error: 'Invalid file type. Only PDF, JPG, and PNG are allowed' }, 400);
    }

    console.log('⏳ Converting file to ArrayBuffer...');
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('✅ ArrayBuffer created, size:', arrayBuffer.byteLength);

    // Verify seller exists before uploading
    console.log('🔍 Verifying seller exists...');
    const existingSeller = await db.query.seller.findFirst({
      where: eq(seller.id, sellerId),
    });

    if (!existingSeller) {
      console.log('❌ Seller not found:', sellerId);
      return c.json({
        error: 'Seller not found. Please restart the onboarding process.',
        code: 'SELLER_NOT_FOUND'
      }, 404);
    }
    console.log('✅ Seller verified:', existingSeller.id);

    // Check if document of this type already exists for this seller
    console.log('🔍 Checking for existing document of type:', documentType);
    const existingDocument = await db.query.sellerDocument.findFirst({
      where: eq(sellerDocument.sellerId, sellerId) && eq(sellerDocument.documentType, documentType),
    });

    let documentId: string;
    let uploadResult: any;

    if (existingDocument) {
      console.log('📄 Existing document found, updating:', existingDocument.id);
      
      // Delete old file from Cloudinary if exists
      if (existingDocument.cloudinaryPublicId) {
        try {
          await deleteFile(existingDocument.cloudinaryPublicId, 'auto' as any);
          console.log('🗑️ Old file deleted from Cloudinary');
        } catch (error) {
          console.error('Failed to delete old file:', error);
          // Continue anyway
        }
      }

      // Upload new file
      console.log('☁️ Uploading new file to Cloudinary...');
      uploadResult = await uploadFile(arrayBuffer, {
        folder: 'seller-documents',
        documentType,
        sellerId,
      });
      console.log('✅ Cloudinary upload successful:', uploadResult.url);

      // Update existing document record
      documentId = existingDocument.id;
      await db
        .update(sellerDocument)
        .set({
          fileName: file.name,
          fileUrl: uploadResult.url,
          fileSize: file.size,
          cloudinaryPublicId: uploadResult.publicId,
          status: 'pending',
          rejectionReason: null,
          uploadedAt: new Date(),
        })
        .where(eq(sellerDocument.id, documentId));
      console.log('✅ Database update successful, documentId:', documentId);
    } else {
      console.log('📄 No existing document, creating new one');
      
      // Upload new file
      console.log('☁️ Uploading to Cloudinary...');
      uploadResult = await uploadFile(arrayBuffer, {
        folder: 'seller-documents',
        documentType,
        sellerId,
      });
      console.log('✅ Cloudinary upload successful:', uploadResult.url);

      // Save new document record to database
      documentId = generateId('doc');
      await db.insert(sellerDocument).values({
        id: documentId,
        sellerId,
        documentType,
        fileName: file.name,
        fileUrl: uploadResult.url,
        fileSize: file.size,
        cloudinaryPublicId: uploadResult.publicId,
        status: 'pending',
      });
      console.log('✅ Database save successful, documentId:', documentId);
    }

    return c.json({
      documentId,
      url: uploadResult.url,
      fileName: file.name,
      fileSize: file.size,
      }, 201);
  } catch (error) {
    console.error('Upload document error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({
      error: 'Failed to upload document',
      details: errorMessage
    }, 500);
  }
});

// POST /api/seller/onboarding/complete - Complete onboarding
app.post('/onboarding/complete', async (c) => {
  try {
    const body = await c.req.json();

    // Validate business info
    const businessInfo = businessInfoSchema.parse(body.businessInfo);

    // Validate bank account
    const bankAccountData = bankAccountSchema.parse(body.bankAccount);

    const sellerId = body.sellerId;

    if (!sellerId) {
      return c.json({ error: 'Seller ID is required' }, 400);
    }

    // Update seller record
    await db
      .update(seller)
      .set({
        businessName: businessInfo.businessName,
        category: businessInfo.category,
        registrationNumber: businessInfo.registrationNumber,
        address: businessInfo.address,
        contactPhone: businessInfo.contactPhone,
        contactEmail: businessInfo.contactEmail,
        businessDescription: businessInfo.businessDescription,
        verificationStatus: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(seller.id, sellerId));

    // Insert bank account
    const bankAccountId = generateId('bank');
    await db.insert(sellerBankAccount).values({
      id: bankAccountId,
      sellerId,
      ...bankAccountData,
    });

    // Add timeline event
    const timelineId = generateId('timeline');
    await db.insert(verificationTimeline).values({
      id: timelineId,
      sellerId,
      status: 'pending',
      message: 'Application submitted successfully',
    });

    return c.json({
      sellerId,
      status: 'pending',
      message: 'Onboarding completed successfully',
    }, 200);
  } catch (error) {
    console.error('Complete onboarding error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.issues }, 400);
    }
    return c.json({ error: 'Failed to complete onboarding' }, 500);
  }
});

// GET /api/seller/verification-status/:sellerId - Get verification status
app.get('/verification-status/:sellerId', async (c) => {
  try {
    const sellerId = c.req.param('sellerId');

    // Get seller data
    const sellerData = await db.query.seller.findFirst({
      where: eq(seller.id, sellerId),
    });

    if (!sellerData) {
      return c.json({ error: 'Seller not found' }, 404);
    }

    // Get documents
    const documents = await db.query.sellerDocument.findMany({
      where: eq(sellerDocument.sellerId, sellerId),
      orderBy: [desc(sellerDocument.uploadedAt)],
    });

    // Get timeline
    const timeline = await db.query.verificationTimeline.findMany({
      where: eq(verificationTimeline.sellerId, sellerId),
      orderBy: [desc(verificationTimeline.createdAt)],
    });

    // Get bank account
    const bankAccount = await db.query.sellerBankAccount.findFirst({
      where: eq(sellerBankAccount.sellerId, sellerId),
    });

    return c.json({
      seller: sellerData,
      documents,
      timeline,
      bankAccount,
    }, 200);
  } catch (error) {
    console.error('Get verification status error:', error);
    return c.json({ error: 'Failed to get verification status' }, 500);
  }
});

// GET /api/seller/by-user/:userId - Get seller by user ID
app.get('/by-user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    const sellerData = await db.query.seller.findFirst({
      where: eq(seller.userId, userId),
    });

    if (!sellerData) {
      return c.json({ seller: null }, 200);
    }

    return c.json({ seller: sellerData }, 200);
  } catch (error) {
    console.error('Get seller by user error:', error);
    return c.json({ error: 'Failed to get seller' }, 500);
  }
});

// PATCH /api/seller/documents/:documentId - Update/resubmit document
app.patch('/documents/:documentId', async (c) => {
  try {
    const documentId = c.req.param('documentId');
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'File is required' }, 400);
    }

    // Get existing document
    const existingDoc = await db.query.sellerDocument.findFirst({
      where: eq(sellerDocument.id, documentId),
    });

    if (!existingDoc) {
      return c.json({ error: 'Document not found' }, 404);
    }

    // Delete old file from Cloudinary if exists
    if (existingDoc.cloudinaryPublicId) {
      try {
        await deleteFile(existingDoc.cloudinaryPublicId, 'auto' as any);
      } catch (error) {
        console.error('Failed to delete old file:', error);
        // Continue anyway
      }
    }

    // Upload new file
    const arrayBuffer = await file.arrayBuffer();
    const uploadResult = await uploadFile(arrayBuffer, {
      folder: 'seller-documents',
      documentType: existingDoc.documentType,
      sellerId: existingDoc.sellerId,
    });

    // Update document record
    await db
      .update(sellerDocument)
      .set({
        fileName: file.name,
        fileUrl: uploadResult.url,
        fileSize: file.size,
        cloudinaryPublicId: uploadResult.publicId,
        status: 'pending',
        rejectionReason: null,
        uploadedAt: new Date(),
      })
      .where(eq(sellerDocument.id, documentId));

    return c.json({
      documentId,
      url: uploadResult.url,
      status: 'pending',
    }, 200);
  } catch (error) {
    console.error('Update document error:', error);
    return c.json({ error: 'Failed to update document' }, 500);
  }
});

export default app;
