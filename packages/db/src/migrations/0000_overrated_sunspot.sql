CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"old_value" json,
	"new_value" json,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
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
--> statement-breakpoint
CREATE TABLE "session" (
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
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_role" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seller" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"email" text NOT NULL,
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
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "seller_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "seller_bank_account" (
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
--> statement-breakpoint
CREATE TABLE "seller_document" (
	"id" text PRIMARY KEY NOT NULL,
	"seller_id" text NOT NULL,
	"document_type" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer NOT NULL,
	"storage_key" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text
);
--> statement-breakpoint
CREATE TABLE "seller_payment_method" (
	"id" text PRIMARY KEY NOT NULL,
	"seller_id" text NOT NULL,
	"payment_type" text NOT NULL,
	"account_number" text NOT NULL,
	"account_name" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_timeline" (
	"id" text PRIMARY KEY NOT NULL,
	"seller_id" text NOT NULL,
	"status" text NOT NULL,
	"message" text NOT NULL,
	"performed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"booking_type" text NOT NULL,
	"group_booking_id" text,
	"guest_details" json NOT NULL,
	"check_in_date" timestamp,
	"check_out_date" timestamp,
	"service_date" timestamp,
	"base_amount" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"platform_fee" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text,
	"transaction_id" text,
	"paid_at" timestamp,
	"status" text DEFAULT 'draft' NOT NULL,
	"hold_expires_at" timestamp,
	"price_lock_enabled" boolean DEFAULT false NOT NULL,
	"split_payment_enabled" boolean DEFAULT false NOT NULL,
	"cancelled_at" timestamp,
	"cancelled_by" text,
	"cancellation_reason" text,
	"refund_amount" numeric(10, 2),
	"refund_processed_at" timestamp,
	"special_requests" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "escrow_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"platform_fee" numeric(10, 2) NOT NULL,
	"seller_amount" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'created' NOT NULL,
	"proof_submitted_at" timestamp,
	"proof_verified_at" timestamp,
	"proof_rejected_at" timestamp,
	"proof_rejection_reason" text,
	"release_scheduled_at" timestamp,
	"released_at" timestamp,
	"dispute_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing" (
	"id" text PRIMARY KEY NOT NULL,
	"seller_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"location" json NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'BDT' NOT NULL,
	"price_unit" text NOT NULL,
	"capacity" integer NOT NULL,
	"min_guests" integer DEFAULT 1,
	"max_guests" integer NOT NULL,
	"group_eligible" boolean DEFAULT false NOT NULL,
	"group_pricing_tiers" json,
	"amenities" json DEFAULT '[]'::json,
	"inclusions" json DEFAULT '[]'::json,
	"exclusions" json DEFAULT '[]'::json,
	"cancellation_policy" text NOT NULL,
	"house_rules" text,
	"check_in_time" text,
	"check_out_time" text,
	"images" json NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"rejection_reason" text,
	"view_count" integer DEFAULT 0 NOT NULL,
	"booking_count" integer DEFAULT 0 NOT NULL,
	"rating" numeric(3, 2),
	"review_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	CONSTRAINT "listing_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "listing_analytics" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"date" timestamp NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"unique_views" integer DEFAULT 0 NOT NULL,
	"bookings" integer DEFAULT 0 NOT NULL,
	"revenue" numeric(10, 2) DEFAULT '0' NOT NULL,
	"wishlist_adds" integer DEFAULT 0 NOT NULL,
	"shares" integer DEFAULT 0 NOT NULL,
	"view_to_booking_rate" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payout" (
	"id" text PRIMARY KEY NOT NULL,
	"seller_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'BDT' NOT NULL,
	"bank_details" json NOT NULL,
	"escrow_transaction_ids" json NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"processed_at" timestamp,
	"completed_at" timestamp,
	"failed_at" timestamp,
	"failure_reason" text,
	"transaction_reference" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proof_of_completion" (
	"id" text PRIMARY KEY NOT NULL,
	"escrow_transaction_id" text NOT NULL,
	"booking_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"files" json NOT NULL,
	"notes" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"review_notes" text,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"booking_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"overall_rating" integer NOT NULL,
	"ratings" json,
	"title" text,
	"comment" text NOT NULL,
	"photos" json DEFAULT '[]'::json,
	"seller_response" text,
	"responded_at" timestamp,
	"helpful_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seller_analytics" (
	"id" text PRIMARY KEY NOT NULL,
	"seller_id" text NOT NULL,
	"date" timestamp NOT NULL,
	"total_views" integer DEFAULT 0 NOT NULL,
	"total_bookings" integer DEFAULT 0 NOT NULL,
	"total_revenue" numeric(10, 2) DEFAULT '0' NOT NULL,
	"active_listings" integer DEFAULT 0 NOT NULL,
	"average_rating" numeric(3, 2),
	"conversion_rate" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller" ADD CONSTRAINT "seller_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_bank_account" ADD CONSTRAINT "seller_bank_account_seller_id_seller_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_document" ADD CONSTRAINT "seller_document_seller_id_seller_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_document" ADD CONSTRAINT "seller_document_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_payment_method" ADD CONSTRAINT "seller_payment_method_seller_id_seller_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_timeline" ADD CONSTRAINT "verification_timeline_seller_id_seller_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_timeline" ADD CONSTRAINT "verification_timeline_performed_by_user_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_seller_id_seller_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_transaction" ADD CONSTRAINT "escrow_transaction_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_transaction" ADD CONSTRAINT "escrow_transaction_seller_id_seller_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing" ADD CONSTRAINT "listing_seller_id_seller_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_analytics" ADD CONSTRAINT "listing_analytics_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_analytics" ADD CONSTRAINT "listing_analytics_seller_id_seller_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout" ADD CONSTRAINT "payout_seller_id_seller_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proof_of_completion" ADD CONSTRAINT "proof_of_completion_escrow_transaction_id_escrow_transaction_id_fk" FOREIGN KEY ("escrow_transaction_id") REFERENCES "public"."escrow_transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proof_of_completion" ADD CONSTRAINT "proof_of_completion_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proof_of_completion" ADD CONSTRAINT "proof_of_completion_seller_id_seller_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proof_of_completion" ADD CONSTRAINT "proof_of_completion_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_seller_id_seller_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_analytics" ADD CONSTRAINT "seller_analytics_seller_id_seller_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auditLog_userId_idx" ON "audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auditLog_action_idx" ON "audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "auditLog_entityType_idx" ON "audit_log" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "auditLog_entityId_idx" ON "audit_log" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "auditLog_createdAt_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "userRole_userId_idx" ON "user_role" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "userRole_role_idx" ON "user_role" USING btree ("role");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "seller_userId_idx" ON "seller" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "seller_email_idx" ON "seller" USING btree ("email");--> statement-breakpoint
CREATE INDEX "seller_verificationStatus_idx" ON "seller" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "sellerBankAccount_sellerId_idx" ON "seller_bank_account" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "sellerDocument_sellerId_idx" ON "seller_document" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "sellerDocument_status_idx" ON "seller_document" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sellerPaymentMethod_sellerId_idx" ON "seller_payment_method" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "sellerPaymentMethod_paymentType_idx" ON "seller_payment_method" USING btree ("payment_type");--> statement-breakpoint
CREATE INDEX "verificationTimeline_sellerId_idx" ON "verification_timeline" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "verificationTimeline_createdAt_idx" ON "verification_timeline" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "booking_listingId_idx" ON "booking" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "booking_sellerId_idx" ON "booking" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "booking_customerId_idx" ON "booking" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "booking_status_idx" ON "booking" USING btree ("status");--> statement-breakpoint
CREATE INDEX "booking_serviceDate_idx" ON "booking" USING btree ("service_date");--> statement-breakpoint
CREATE INDEX "booking_createdAt_idx" ON "booking" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "escrow_bookingId_idx" ON "escrow_transaction" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "escrow_sellerId_idx" ON "escrow_transaction" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "escrow_status_idx" ON "escrow_transaction" USING btree ("status");--> statement-breakpoint
CREATE INDEX "listing_sellerId_idx" ON "listing" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "listing_category_idx" ON "listing" USING btree ("category");--> statement-breakpoint
CREATE INDEX "listing_status_idx" ON "listing" USING btree ("status");--> statement-breakpoint
CREATE INDEX "listing_createdAt_idx" ON "listing" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "listingAnalytics_listingId_date_idx" ON "listing_analytics" USING btree ("listing_id","date");--> statement-breakpoint
CREATE INDEX "listingAnalytics_sellerId_date_idx" ON "listing_analytics" USING btree ("seller_id","date");--> statement-breakpoint
CREATE INDEX "payout_sellerId_idx" ON "payout" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "payout_status_idx" ON "payout" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payout_createdAt_idx" ON "payout" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "proof_escrowTransactionId_idx" ON "proof_of_completion" USING btree ("escrow_transaction_id");--> statement-breakpoint
CREATE INDEX "proof_bookingId_idx" ON "proof_of_completion" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "proof_sellerId_idx" ON "proof_of_completion" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "proof_status_idx" ON "proof_of_completion" USING btree ("status");--> statement-breakpoint
CREATE INDEX "review_listingId_idx" ON "review" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "review_sellerId_idx" ON "review" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "review_customerId_idx" ON "review" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "review_createdAt_idx" ON "review" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sellerAnalytics_sellerId_date_idx" ON "seller_analytics" USING btree ("seller_id","date");