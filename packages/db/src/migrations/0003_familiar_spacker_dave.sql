ALTER TABLE "booking" ADD COLUMN "payment_details" json;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "promo_code" text;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "promo_code_discount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "approval_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "approved_by" text;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "rejection_reason" text;