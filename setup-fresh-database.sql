-- ========================================
-- DeshGhuri Database Setup Script
-- Run this in Supabase Studio SQL Editor
-- ========================================

-- Create all tables (from migration 0000)
CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);

CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "seller" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"business_name" text NOT NULL,
	"category" text NOT NULL,
	"registration_number" text NOT NULL,
	"address" json NOT NULL,
	"contact_phone" text NOT NULL,
	"contact_email" text NOT NULL,
	"business_description" text,
	"verification_status" text DEFAULT 'pending' NOT NULL,
	"verified_at" timestamp,
	"rating" integer,
	"review_count" integer DEFAULT 0,
	"total_bookings" integer DEFAULT 0,
	"total_revenue" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "seller_bank_account" (
	"id" text PRIMARY KEY NOT NULL,
	"seller_id" text NOT NULL,
	"bank_name" text NOT NULL,
	"branch_name" text NOT NULL,
	"account_holder_name" text NOT NULL,
	"account_number" text NOT NULL,
	"routing_number" text,
	"account_type" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- seller_document table with storage_key (not cloudinary_public_id)
CREATE TABLE IF NOT EXISTS "seller_document" (
	"id" text PRIMARY KEY NOT NULL,
	"seller_id" text NOT NULL,
	"document_type" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer NOT NULL,
	"storage_key" text,  -- Using storage_key directly
	"status" text DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text
);

CREATE TABLE IF NOT EXISTS "verification_timeline" (
	"id" text PRIMARY KEY NOT NULL,
	"seller_id" text NOT NULL,
	"status" text NOT NULL,
	"message" text NOT NULL,
	"performed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'account_user_id_user_id_fk'
  ) THEN
    ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'session_user_id_user_id_fk'
  ) THEN
    ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'seller_user_id_user_id_fk'
  ) THEN
    ALTER TABLE "seller" ADD CONSTRAINT "seller_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'seller_bank_account_seller_id_seller_id_fk'
  ) THEN
    ALTER TABLE "seller_bank_account" ADD CONSTRAINT "seller_bank_account_seller_id_seller_id_fk"
    FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'seller_document_seller_id_seller_id_fk'
  ) THEN
    ALTER TABLE "seller_document" ADD CONSTRAINT "seller_document_seller_id_seller_id_fk"
    FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'seller_document_reviewed_by_user_id_fk'
  ) THEN
    ALTER TABLE "seller_document" ADD CONSTRAINT "seller_document_reviewed_by_user_id_fk"
    FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'verification_timeline_seller_id_seller_id_fk'
  ) THEN
    ALTER TABLE "verification_timeline" ADD CONSTRAINT "verification_timeline_seller_id_seller_id_fk"
    FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'verification_timeline_performed_by_user_id_fk'
  ) THEN
    ALTER TABLE "verification_timeline" ADD CONSTRAINT "verification_timeline_performed_by_user_id_fk"
    FOREIGN KEY ("performed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" USING btree ("identifier");
CREATE INDEX IF NOT EXISTS "seller_userId_idx" ON "seller" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "seller_verificationStatus_idx" ON "seller" USING btree ("verification_status");
CREATE INDEX IF NOT EXISTS "sellerBankAccount_sellerId_idx" ON "seller_bank_account" USING btree ("seller_id");
CREATE INDEX IF NOT EXISTS "sellerDocument_sellerId_idx" ON "seller_document" USING btree ("seller_id");
CREATE INDEX IF NOT EXISTS "sellerDocument_status_idx" ON "seller_document" USING btree ("status");
CREATE INDEX IF NOT EXISTS "verificationTimeline_sellerId_idx" ON "verification_timeline" USING btree ("seller_id");
CREATE INDEX IF NOT EXISTS "verificationTimeline_createdAt_idx" ON "verification_timeline" USING btree ("created_at");

-- Create storage bucket for seller documents
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('seller-documents', 'seller-documents', false, 52428800)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for seller-documents bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can upload seller documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'seller-documents');

CREATE POLICY IF NOT EXISTS "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'seller-documents');

CREATE POLICY IF NOT EXISTS "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'seller-documents');

CREATE POLICY IF NOT EXISTS "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'seller-documents');

-- Success message
SELECT 'Database setup complete! All tables and storage bucket created.' as message;
