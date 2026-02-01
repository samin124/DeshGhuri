import { v2 as cloudinary } from 'cloudinary';
import { env } from '@DeshGhuri/env/server';

// Configure Cloudinary if credentials are provided
const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('✅ Cloudinary configured successfully');
} else {
  console.warn('⚠️  Cloudinary credentials not configured. File uploads will not work.');
}

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  resourceType: string;
  bytes: number;
}

/**
 * Upload a file to Cloudinary
 * @param file - File buffer or data URI
 * @param options - Upload options
 * @returns Upload result with URL and public ID
 */
export async function uploadFile(
  file: ArrayBuffer | string,
  options: {
    folder: string;
    documentType: string;
    sellerId: string;
  }
): Promise<UploadResult> {
  console.log('☁️ Cloudinary uploadFile called with options:', options);

  if (!isCloudinaryConfigured) {
    console.error('❌ Cloudinary not configured');
    throw new Error('Cloudinary is not configured. Please add CLOUDINARY credentials to .env file.');
  }

  try {
    let dataURI: string;

    if (file instanceof ArrayBuffer) {
      console.log('📦 Converting ArrayBuffer to base64, size:', file.byteLength);
      const buffer = Buffer.from(file);
      const base64 = buffer.toString('base64');
      // Detect mime type from file header
      const mimeType = detectMimeType(buffer);
      console.log('🔍 Detected MIME type:', mimeType);
      dataURI = `data:${mimeType};base64,${base64}`;
    } else {
      console.log('📝 Using provided data URI');
      dataURI = file;
    }

    console.log('⬆️ Uploading to Cloudinary...');
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `${options.folder}/${options.sellerId}`,
      resource_type: 'auto',
      public_id: `${options.documentType}_${Date.now()}`,
      overwrite: false,
      invalidate: true,
    });

    console.log('✅ Cloudinary upload successful');
    console.log('   URL:', result.secure_url);
    console.log('   Public ID:', result.public_id);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
    throw new Error(`Failed to upload file to cloud storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 * @param resourceType - The resource type (image, video, raw). Use 'raw' for PDFs.
 */
export async function deleteFile(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> {
  if (!isCloudinaryConfigured) {
    console.warn('Cloudinary not configured, skipping file deletion');
    return;
  }

  try {
    console.log(`🗑️ Deleting file from Cloudinary: ${publicId} (type: ${resourceType})`);
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    console.log('✅ File deleted successfully');
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from cloud storage');
  }
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

export { cloudinary, isCloudinaryConfigured };
