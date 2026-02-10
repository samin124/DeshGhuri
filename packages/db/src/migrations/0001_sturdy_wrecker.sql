ALTER TABLE "listing" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "listing" ADD COLUMN "is_trending" boolean DEFAULT false NOT NULL;