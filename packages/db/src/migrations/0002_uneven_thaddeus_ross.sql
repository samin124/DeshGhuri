ALTER TABLE "listing" ADD COLUMN "is_flash_deal" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "listing" ADD COLUMN "flash_deal_ends_at" timestamp;--> statement-breakpoint
ALTER TABLE "listing" ADD COLUMN "discount_percent" integer;--> statement-breakpoint
ALTER TABLE "listing" ADD COLUMN "discounted_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "listing" ADD COLUMN "promo_code" text;--> statement-breakpoint
ALTER TABLE "listing" ADD COLUMN "promo_code_discount" integer;--> statement-breakpoint
ALTER TABLE "listing" ADD COLUMN "promo_code_max_uses" integer;--> statement-breakpoint
ALTER TABLE "listing" ADD COLUMN "promo_code_used_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "listing" ADD COLUMN "promo_code_expires_at" timestamp;