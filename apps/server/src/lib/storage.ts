import { StorageClient } from '@supabase/storage-js';
import { env } from '@DeshGhuri/env/server';

// Configure Supabase Storage client
const STORAGE_URL = 'http://127.0.0.1:54321/storage/v1';
const storageClient = new StorageClient(STORAGE_URL, {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
});

const BUCKET_NAME = env.SUPABASE_STORAGE_BUCKET;

// Check if storage is configured
export const isStorageConfigured = Boolean(
  env.SUPABASE_PROJECT_REF &&
  env.SUPABASE_SERVICE_ROLE_KEY
);

if (isStorageConfigured) {
  console.log('✅ Supabase Storage configured successfully');
} else {
  console.warn('⚠️  Supabase Storage credentials not configured. File uploads will not work.');
}

export interface UploadResult {
  url: string;
  storageKey: string;
  format: string;
  bytes: number;
}

/**
 * Detect MIME type from file buffer
 * @param buffer - File buffer
 * @returns MIME type string
 */
function detectMimeType(buffer: Buffer): string {
  const header = buffer.slice(0, 8).toString('hex');

  // PDF
  if (header.startsWith('255044462d')) {
    return 'application/pdf';
  }

  // JPEG
  if (header.startsWith('ffd8ff')) {
    return 'image/jpeg';
  }

  // PNG
  if (header.startsWith('89504e47')) {
    return 'image/png';
  }

  // Default to octet-stream
  return 'application/octet-stream';
}

/**
 * Get file extension from MIME type
 * @param mimeType - MIME type string
 * @returns File extension
 */
function getExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case 'application/pdf':
      return 'pdf';
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    default:
      return 'bin';
  }
}

/**
 * Upload a file to Supabase Storage
 * @param file - File buffer or data URI
 * @param options - Upload options
 * @returns Upload result with URL and storage key
 */
export async function uploadFile(
  file: ArrayBuffer | string,
  options: {
    folder: string;
    documentType: string;
    sellerId: string;
  }
): Promise<UploadResult> {
  console.log('☁️ Supabase Storage uploadFile called with options:', options);

  if (!isStorageConfigured) {
    console.error('❌ Supabase Storage not configured');
    throw new Error('Supabase Storage is not configured. Please add SUPABASE credentials to .env file.');
  }

  try {
    let buffer: Buffer;
    let mimeType: string;

    if (file instanceof ArrayBuffer) {
      console.log('📦 Converting ArrayBuffer to Buffer, size:', file.byteLength);
      buffer = Buffer.from(file);
      mimeType = detectMimeType(buffer);
      console.log('🔍 Detected MIME type:', mimeType);
    } else {
      // Handle data URI
      console.log('📝 Processing data URI');
      const matches = file.match(/^data:(.+?);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid data URI format');
      }
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    }

    // Generate storage key
    const extension = getExtensionFromMimeType(mimeType);
    const timestamp = Date.now();
    const storageKey = `${options.sellerId}/${options.documentType}_${timestamp}.${extension}`;

    console.log('📁 Storage key:', storageKey);
    console.log('⬆️ Uploading to Supabase Storage...');

    // Upload to Supabase Storage
    const { data, error } = await storageClient
      .from(BUCKET_NAME)
      .upload(storageKey, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error('❌ Upload error:', error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    console.log('✅ Upload successful');

    // Generate signed URL (1 hour expiry)
    const signedUrl = await getSignedUrlForFile(storageKey, 3600);

    console.log('🔗 Signed URL generated');

    return {
      url: signedUrl,
      storageKey,
      format: extension,
      bytes: buffer.length,
    };
  } catch (error) {
    console.error('❌ Supabase Storage upload error:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
    throw new Error(`Failed to upload file to cloud storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a file from Supabase Storage
 * @param storageKey - The storage key of the file to delete
 */
export async function deleteFile(storageKey: string): Promise<void> {
  if (!isStorageConfigured) {
    console.warn('Supabase Storage not configured, skipping file deletion');
    return;
  }

  try {
    console.log(`🗑️ Deleting file from Supabase Storage: ${storageKey}`);

    const { error } = await storageClient
      .from(BUCKET_NAME)
      .remove([storageKey]);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(`Storage delete failed: ${error.message}`);
    }

    console.log('✅ File deleted successfully');
  } catch (error) {
    console.error('Supabase Storage delete error:', error);
    throw new Error('Failed to delete file from cloud storage');
  }
}

/**
 * Generate a signed URL for a file
 * @param storageKey - The storage key of the file
 * @param expiresIn - URL expiry time in seconds (default: 1 hour)
 * @returns Signed URL string
 */
export async function getSignedUrlForFile(
  storageKey: string,
  expiresIn: number = 3600
): Promise<string> {
  if (!isStorageConfigured) {
    throw new Error('Supabase Storage not configured');
  }

  try {
    const { data, error } = await storageClient
      .from(BUCKET_NAME)
      .createSignedUrl(storageKey, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    if (!data?.signedUrl) {
      throw new Error('No signed URL returned');
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    throw new Error('Failed to generate file access URL');
  }
}

export { storageClient };
