import { Hono } from 'hono';
import { db, seller as sellerTable, sellerDocument, eq, and } from '@DeshGhuri/db';
import { uploadFile, deleteFile, isStorageConfigured, storageClient } from '../lib/storage';
import { env } from '@DeshGhuri/env/server';

const app = new Hono();

// Generate unique ID
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// POST /api/seller/upload-image - Upload listing image
app.post('/upload-image', async (c) => {
  try {
    console.log('📤 Image upload request received');

    // Check if Supabase Storage is configured
    if (!isStorageConfigured) {
      console.log('❌ Supabase Storage not configured');
      return c.json(
        {
          error:
            'File upload service not configured. Please contact administrator to configure Supabase Storage.',
        },
        503
      );
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.log('❌ No file provided');
      return c.json({ error: 'No file provided' }, 400);
    }

    console.log('📋 Upload details:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // Validate file size (max 5MB for images)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size);
      return c.json({ error: 'File size exceeds 5MB limit' }, 400);
    }

    // Validate file type - only images
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type);
      return c.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP images are allowed' },
        400
      );
    }

    console.log('⏳ Converting file to ArrayBuffer...');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('✅ Buffer created, size:', buffer.byteLength);

    // Generate unique storage key
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const extension = file.type.split('/')[1] || 'jpg';
    const storageKey = `listing-images/${timestamp}_${randomId}.${extension}`;

    console.log('📁 Storage key:', storageKey);
    console.log('☁️ Uploading to Supabase Storage...');

    // Upload directly to Supabase Storage
    const BUCKET_NAME = env.SUPABASE_STORAGE_BUCKET;
    const { error } = await storageClient.from(BUCKET_NAME).upload(storageKey, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error('❌ Upload error:', error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    console.log('✅ Upload successful');

    // Generate signed URL (24 hours expiry for listing images)
    const { data: signedData, error: signedError } = await storageClient
      .from(BUCKET_NAME)
      .createSignedUrl(storageKey, 86400); // 24 hours

    if (signedError || !signedData?.signedUrl) {
      console.error('❌ Signed URL error:', signedError);
      throw new Error('Failed to create signed URL');
    }

    console.log('🔗 Signed URL generated');

    return c.json(
      {
        url: signedData.signedUrl,
        key: storageKey,
        size: file.size,
        type: file.type,
      },
      200
    );
  } catch (error) {
    console.error('Upload image error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json(
      {
        error: 'Failed to upload image',
        details: errorMessage,
      },
      500
    );
  }
});

// POST /api/seller/documents/upload - Upload a document
app.post('/documents/upload', async (c) => {
  try {
    console.log('📤 Upload request received');

    // Check if Supabase Storage is configured
    if (!isStorageConfigured) {
      console.log('❌ Supabase Storage not configured');
      return c.json(
        {
          error:
            'File upload service not configured. Please contact administrator to configure Supabase Storage.',
        },
        503
      );
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
      documentType,
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
    const arrayBuffer = await file.arrayBuffer();
    console.log('✅ ArrayBuffer created, size:', arrayBuffer.byteLength);

    // Verify seller exists before uploading
    console.log('🔍 Verifying seller exists...');
    const existingSeller = await db.query.seller.findFirst({
      where: eq(sellerTable.id, sellerId),
    });

    if (!existingSeller) {
      console.log('❌ Seller not found:', sellerId);
      return c.json(
        {
          error: 'Seller not found. Please restart the onboarding process.',
          code: 'SELLER_NOT_FOUND',
        },
        404
      );
    }
    console.log('✅ Seller verified:', existingSeller.id);

    // Check if document of this type already exists
    console.log('🔍 Checking for existing document of type:', documentType);
    const existingDocument = await db.query.sellerDocument.findFirst({
      where: and(
        eq(sellerDocument.sellerId, sellerId),
        eq(sellerDocument.documentType, documentType)
      ),
    });

    let documentId: string;
    let uploadResult: { url: string; storageKey: string };

    if (existingDocument) {
      console.log('📄 Existing document found, updating:', existingDocument.id);

      // Delete old file from Supabase Storage
      if (existingDocument.storageKey) {
        try {
          await deleteFile(existingDocument.storageKey);
          console.log('🗑️ Old file deleted from Supabase Storage');
        } catch (error) {
          console.error('Failed to delete old file:', error);
        }
      }

      // Upload new file
      console.log('☁️ Uploading new file to Supabase Storage...');
      uploadResult = await uploadFile(arrayBuffer, {
        folder: 'seller-documents',
        documentType,
        sellerId,
      });
      console.log('✅ Supabase Storage upload successful:', uploadResult.url);

      // Update existing document record
      documentId = existingDocument.id;
      await db
        .update(sellerDocument)
        .set({
          fileName: file.name,
          fileUrl: uploadResult.url,
          fileSize: file.size,
          storageKey: uploadResult.storageKey,
          status: 'pending',
          rejectionReason: null,
          uploadedAt: new Date(),
        })
        .where(eq(sellerDocument.id, documentId));
      console.log('✅ Database update successful');
    } else {
      console.log('📄 No existing document, creating new one');

      // Upload new file
      console.log('☁️ Uploading to Supabase Storage...');
      uploadResult = await uploadFile(arrayBuffer, {
        folder: 'seller-documents',
        documentType,
        sellerId,
      });
      console.log('✅ Supabase Storage upload successful:', uploadResult.url);

      // Save new document record
      documentId = generateId('doc');
      await db.insert(sellerDocument).values({
        id: documentId,
        sellerId,
        documentType,
        fileName: file.name,
        fileUrl: uploadResult.url,
        fileSize: file.size,
        storageKey: uploadResult.storageKey,
        status: 'pending',
      });
      console.log('✅ Database save successful');
    }

    return c.json(
      {
        documentId,
        url: uploadResult.url,
        fileName: file.name,
        fileSize: file.size,
      },
      201
    );
  } catch (error) {
    console.error('Upload document error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json(
      {
        error: 'Failed to upload document',
        details: errorMessage,
      },
      500
    );
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

    // Delete old file from Supabase Storage
    if (existingDoc.storageKey) {
      try {
        await deleteFile(existingDoc.storageKey);
      } catch (error) {
        console.error('Failed to delete old file:', error);
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
        storageKey: uploadResult.storageKey,
        status: 'pending',
        rejectionReason: null,
        uploadedAt: new Date(),
      })
      .where(eq(sellerDocument.id, documentId));

    return c.json(
      {
        documentId,
        url: uploadResult.url,
        status: 'pending',
      },
      200
    );
  } catch (error) {
    console.error('Update document error:', error);
    return c.json({ error: 'Failed to update document' }, 500);
  }
});

export default app;
