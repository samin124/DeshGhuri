-- Rename cloudinary_public_id column to storage_key
ALTER TABLE "seller_document" RENAME COLUMN "cloudinary_public_id" TO "storage_key";
