import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  json,
  integer,
  decimal,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { seller } from './seller';
import { user } from './auth';

// ============================================================================
// CONSTANTS & ENUMS
// ============================================================================

export const LISTING_CATEGORIES = {
  HOTEL: 'hotel',
  TOUR_PACKAGE: 'tour-package',
  EXPERIENCE: 'experience',
  TRANSPORT: 'transport',
} as const;

export type ListingCategory = (typeof LISTING_CATEGORIES)[keyof typeof LISTING_CATEGORIES];

export const LISTING_STATUSES = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending-review',
  ACTIVE: 'active',
  PAUSED: 'paused',
  REJECTED: 'rejected',
} as const;

export type ListingStatus = (typeof LISTING_STATUSES)[keyof typeof LISTING_STATUSES];

export const CANCELLATION_POLICIES = {
  FLEXIBLE: 'flexible',
  MODERATE: 'moderate',
  STRICT: 'strict',
  NON_REFUNDABLE: 'non-refundable',
} as const;

export type CancellationPolicy = (typeof CANCELLATION_POLICIES)[keyof typeof CANCELLATION_POLICIES];

export const PRICE_UNITS = {
  PER_PERSON: 'per-person',
  PER_NIGHT: 'per-night',
  PER_BOOKING: 'per-booking',
} as const;

export type PriceUnit = (typeof PRICE_UNITS)[keyof typeof PRICE_UNITS];

// ============================================================================
// LISTINGS
// ============================================================================

export const listing = pgTable(
  'listing',
  {
    id: text('id').primaryKey(),
    sellerId: text('seller_id')
      .notNull()
      .references(() => seller.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description').notNull(),
    category: text('category').notNull(), // 'hotel' | 'tour-package' | 'experience' | 'transport'

    // Location
    location: json('location')
      .$type<{
        city: string;
        district: string;
        address: string;
        landmark?: string;
        coordinates?: { lat: number; lng: number };
      }>()
      .notNull(),

    // Pricing
    basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('BDT'),
    priceUnit: text('price_unit').notNull(), // 'per-person' | 'per-night' | 'per-booking'

    // Capacity
    capacity: integer('capacity').notNull(),
    minGuests: integer('min_guests').default(1),
    maxGuests: integer('max_guests').notNull(),

    // Group Pricing
    groupEligible: boolean('group_eligible').default(false).notNull(),
    groupPricingTiers: json('group_pricing_tiers').$type<
      Array<{
        minParticipants: number;
        maxParticipants: number;
        discountPercentage: number;
        pricePerPerson: number;
      }>
    >(),

    // Amenities & Features
    amenities: json('amenities').$type<string[]>().default([]),
    inclusions: json('inclusions').$type<string[]>().default([]),
    exclusions: json('exclusions').$type<string[]>().default([]),

    // Policies
    cancellationPolicy: text('cancellation_policy').notNull(), // 'flexible' | 'moderate' | 'strict' | 'non-refundable'
    houseRules: text('house_rules'),
    checkInTime: text('check_in_time'),
    checkOutTime: text('check_out_time'),

    // Media
    images: json('images')
      .$type<
        Array<{
          url: string;
          storageKey: string;
          caption?: string;
          isPrimary: boolean;
        }>
      >()
      .notNull(),

    // Status
    status: text('status').notNull().default('draft'), // 'draft' | 'pending-review' | 'active' | 'paused' | 'rejected'
    rejectionReason: text('rejection_reason'),

    // Stats
    viewCount: integer('view_count').default(0).notNull(),
    bookingCount: integer('booking_count').default(0).notNull(),
    rating: decimal('rating', { precision: 3, scale: 2 }),
    reviewCount: integer('review_count').default(0).notNull(),

    // Featured & Trending (admin/system managed)
    isFeatured: boolean('is_featured').default(false).notNull(),
    isTrending: boolean('is_trending').default(false).notNull(),

    // Promotions (seller/admin managed)
    isFlashDeal: boolean('is_flash_deal').default(false).notNull(),
    flashDealEndsAt: timestamp('flash_deal_ends_at'),
    discountPercent: integer('discount_percent'),
    discountedPrice: decimal('discounted_price', { precision: 10, scale: 2 }),
    promoCode: text('promo_code'),
    promoCodeDiscount: integer('promo_code_discount'),
    promoCodeMaxUses: integer('promo_code_max_uses'),
    promoCodeUsedCount: integer('promo_code_used_count').default(0),
    promoCodeExpiresAt: timestamp('promo_code_expires_at'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    publishedAt: timestamp('published_at'),
  },
  (table) => [
    index('listing_sellerId_idx').on(table.sellerId),
    index('listing_category_idx').on(table.category),
    index('listing_status_idx').on(table.status),
    index('listing_createdAt_idx').on(table.createdAt),
  ]
);

// ============================================================================
// BOOKINGS
// ============================================================================

export const booking = pgTable(
  'booking',
  {
    id: text('id').primaryKey(), // Format: DG-YYYYMMDD-XXXXX
    listingId: text('listing_id')
      .notNull()
      .references(() => listing.id, { onDelete: 'restrict' }),
    sellerId: text('seller_id')
      .notNull()
      .references(() => seller.id, { onDelete: 'restrict' }),
    customerId: text('customer_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),

    // Booking Type
    bookingType: text('booking_type').notNull(), // 'individual' | 'group'
    groupBookingId: text('group_booking_id'), // If part of a group

    // Guest Details
    guestDetails: json('guest_details')
      .$type<{
        primaryGuest: {
          name: string;
          email: string;
          phone: string;
        };
        adults: number;
        children: number;
        totalGuests: number;
      }>()
      .notNull(),

    // Dates
    checkInDate: timestamp('check_in_date'),
    checkOutDate: timestamp('check_out_date'),
    serviceDate: timestamp('service_date'),

    // Pricing
    baseAmount: decimal('base_amount', { precision: 10, scale: 2 }).notNull(),
    discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0').notNull(),
    taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0').notNull(),
    platformFee: decimal('platform_fee', { precision: 10, scale: 2 }).default('0').notNull(),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),

    // Payment
    paymentStatus: text('payment_status').notNull().default('pending'), // 'pending' | 'completed' | 'failed' | 'refunded'
    paymentMethod: text('payment_method'), // 'bkash' | 'nagad' | 'card' | 'bank-transfer'
    transactionId: text('transaction_id'),
    paymentDetails: json('payment_details').$type<{
      accountNumber?: string;
      accountHolderName?: string;
      transactionDate?: string;
      notes?: string;
    }>(),
    paidAt: timestamp('paid_at'),

    // Promo Code
    promoCode: text('promo_code'),
    promoCodeDiscount: decimal('promo_code_discount', { precision: 10, scale: 2 }),

    // Seller Approval (for manual payment methods)
    approvalStatus: text('approval_status').default('pending'), // 'pending' | 'approved' | 'rejected'
    approvedAt: timestamp('approved_at'),
    approvedBy: text('approved_by'),
    rejectionReason: text('rejection_reason'),

    // Status
    status: text('status').notNull().default('draft'), // 'draft' | 'hold' | 'confirmed' | 'completed' | 'cancelled' | 'expired' | 'disputed' | 'refunded'
    holdExpiresAt: timestamp('hold_expires_at'),

    // Features
    priceLockEnabled: boolean('price_lock_enabled').default(false).notNull(),
    splitPaymentEnabled: boolean('split_payment_enabled').default(false).notNull(),

    // Cancellation
    cancelledAt: timestamp('cancelled_at'),
    cancelledBy: text('cancelled_by'), // userId
    cancellationReason: text('cancellation_reason'),
    refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }),
    refundProcessedAt: timestamp('refund_processed_at'),

    // Special Requests
    specialRequests: text('special_requests'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('booking_listingId_idx').on(table.listingId),
    index('booking_sellerId_idx').on(table.sellerId),
    index('booking_customerId_idx').on(table.customerId),
    index('booking_status_idx').on(table.status),
    index('booking_serviceDate_idx').on(table.serviceDate),
    index('booking_createdAt_idx').on(table.createdAt),
  ]
);

// ============================================================================
// REVIEWS
// ============================================================================

export const review = pgTable(
  'review',
  {
    id: text('id').primaryKey(),
    listingId: text('listing_id')
      .notNull()
      .references(() => listing.id, { onDelete: 'cascade' }),
    bookingId: text('booking_id')
      .notNull()
      .references(() => booking.id, { onDelete: 'restrict' }),
    customerId: text('customer_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    sellerId: text('seller_id')
      .notNull()
      .references(() => seller.id, { onDelete: 'cascade' }),

    // Rating (1-5 stars)
    overallRating: integer('overall_rating').notNull(),

    // Category Ratings
    ratings: json('ratings').$type<{
      cleanliness?: number;
      communication?: number;
      accuracy?: number;
      value?: number;
      location?: number;
    }>(),

    // Review Content
    title: text('title'),
    comment: text('comment').notNull(),
    photos: json('photos')
      .$type<
        Array<{
          url: string;
          storageKey: string;
        }>
      >()
      .default([]),

    // Seller Response
    sellerResponse: text('seller_response'),
    respondedAt: timestamp('responded_at'),

    // Helpful Count
    helpfulCount: integer('helpful_count').default(0).notNull(),

    // Status
    status: text('status').notNull().default('published'), // 'published' | 'hidden' | 'flagged'

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('review_listingId_idx').on(table.listingId),
    index('review_sellerId_idx').on(table.sellerId),
    index('review_customerId_idx').on(table.customerId),
    index('review_createdAt_idx').on(table.createdAt),
  ]
);

// ============================================================================
// ESCROW & PAYMENTS
// ============================================================================

export const escrowTransaction = pgTable(
  'escrow_transaction',
  {
    id: text('id').primaryKey(),
    bookingId: text('booking_id')
      .notNull()
      .references(() => booking.id, { onDelete: 'restrict' }),
    sellerId: text('seller_id')
      .notNull()
      .references(() => seller.id, { onDelete: 'restrict' }),

    // Amount
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    platformFee: decimal('platform_fee', { precision: 10, scale: 2 }).notNull(),
    sellerAmount: decimal('seller_amount', { precision: 10, scale: 2 }).notNull(),

    // Status
    status: text('status').notNull().default('created'), // 'created' | 'pending-proof' | 'proof-submitted' | 'proof-verified' | 'proof-rejected' | 'on-hold' | 'released' | 'refunded'

    // Proof of Service
    proofSubmittedAt: timestamp('proof_submitted_at'),
    proofVerifiedAt: timestamp('proof_verified_at'),
    proofRejectedAt: timestamp('proof_rejected_at'),
    proofRejectionReason: text('proof_rejection_reason'),

    // Release
    releaseScheduledAt: timestamp('release_scheduled_at'),
    releasedAt: timestamp('released_at'),

    // Dispute
    disputeId: text('dispute_id'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('escrow_bookingId_idx').on(table.bookingId),
    index('escrow_sellerId_idx').on(table.sellerId),
    index('escrow_status_idx').on(table.status),
  ]
);

export const proofOfCompletion = pgTable(
  'proof_of_completion',
  {
    id: text('id').primaryKey(),
    escrowTransactionId: text('escrow_transaction_id')
      .notNull()
      .references(() => escrowTransaction.id, { onDelete: 'cascade' }),
    bookingId: text('booking_id')
      .notNull()
      .references(() => booking.id, { onDelete: 'restrict' }),
    sellerId: text('seller_id')
      .notNull()
      .references(() => seller.id, { onDelete: 'restrict' }),

    // Proof Files
    files: json('files')
      .$type<
        Array<{
          url: string;
          storageKey: string;
          fileName: string;
          fileType: string;
          fileSize: number;
        }>
      >()
      .notNull(),

    // Notes
    notes: text('notes'),

    // Review
    status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
    reviewedBy: text('reviewed_by').references(() => user.id),
    reviewedAt: timestamp('reviewed_at'),
    reviewNotes: text('review_notes'),

    // Resubmission
    attemptNumber: integer('attempt_number').default(1).notNull(),

    // Timestamps
    submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  },
  (table) => [
    index('proof_escrowTransactionId_idx').on(table.escrowTransactionId),
    index('proof_bookingId_idx').on(table.bookingId),
    index('proof_sellerId_idx').on(table.sellerId),
    index('proof_status_idx').on(table.status),
  ]
);

export const payout = pgTable(
  'payout',
  {
    id: text('id').primaryKey(),
    sellerId: text('seller_id')
      .notNull()
      .references(() => seller.id, { onDelete: 'restrict' }),

    // Amount
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('BDT'),

    // Bank Details (snapshot at payout time)
    bankDetails: json('bank_details')
      .$type<{
        bankName: string;
        branchName: string;
        accountHolderName: string;
        accountNumber: string;
        routingNumber?: string;
        accountType: string;
      }>()
      .notNull(),

    // Included Escrow Transactions
    escrowTransactionIds: json('escrow_transaction_ids').$type<string[]>().notNull(),

    // Status
    status: text('status').notNull().default('pending'), // 'pending' | 'processing' | 'completed' | 'failed'

    // Processing
    processedAt: timestamp('processed_at'),
    completedAt: timestamp('completed_at'),
    failedAt: timestamp('failed_at'),
    failureReason: text('failure_reason'),

    // Transaction Reference
    transactionReference: text('transaction_reference'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('payout_sellerId_idx').on(table.sellerId),
    index('payout_status_idx').on(table.status),
    index('payout_createdAt_idx').on(table.createdAt),
  ]
);

// ============================================================================
// ANALYTICS
// ============================================================================

export const listingAnalytics = pgTable(
  'listing_analytics',
  {
    id: text('id').primaryKey(),
    listingId: text('listing_id')
      .notNull()
      .references(() => listing.id, { onDelete: 'cascade' }),
    sellerId: text('seller_id')
      .notNull()
      .references(() => seller.id, { onDelete: 'cascade' }),

    // Date
    date: timestamp('date').notNull(),

    // Metrics
    views: integer('views').default(0).notNull(),
    uniqueViews: integer('unique_views').default(0).notNull(),
    bookings: integer('bookings').default(0).notNull(),
    revenue: decimal('revenue', { precision: 10, scale: 2 }).default('0').notNull(),
    wishlistAdds: integer('wishlist_adds').default(0).notNull(),
    shares: integer('shares').default(0).notNull(),

    // Conversion
    viewToBookingRate: decimal('view_to_booking_rate', { precision: 5, scale: 2 }),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('listingAnalytics_listingId_date_idx').on(table.listingId, table.date),
    index('listingAnalytics_sellerId_date_idx').on(table.sellerId, table.date),
  ]
);

export const sellerAnalytics = pgTable(
  'seller_analytics',
  {
    id: text('id').primaryKey(),
    sellerId: text('seller_id')
      .notNull()
      .references(() => seller.id, { onDelete: 'cascade' }),

    // Date
    date: timestamp('date').notNull(),

    // Metrics
    totalViews: integer('total_views').default(0).notNull(),
    totalBookings: integer('total_bookings').default(0).notNull(),
    totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0').notNull(),
    activeListings: integer('active_listings').default(0).notNull(),
    averageRating: decimal('average_rating', { precision: 3, scale: 2 }),

    // Conversion
    conversionRate: decimal('conversion_rate', { precision: 5, scale: 2 }),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('sellerAnalytics_sellerId_date_idx').on(table.sellerId, table.date)]
);

// ============================================================================
// RELATIONS
// ============================================================================

export const listingRelations = relations(listing, ({ one, many }) => ({
  seller: one(seller, {
    fields: [listing.sellerId],
    references: [seller.id],
  }),
  bookings: many(booking),
  reviews: many(review),
  analytics: many(listingAnalytics),
}));

export const bookingRelations = relations(booking, ({ one }) => ({
  listing: one(listing, {
    fields: [booking.listingId],
    references: [listing.id],
  }),
  seller: one(seller, {
    fields: [booking.sellerId],
    references: [seller.id],
  }),
  customer: one(user, {
    fields: [booking.customerId],
    references: [user.id],
  }),
  escrowTransaction: one(escrowTransaction, {
    fields: [booking.id],
    references: [escrowTransaction.bookingId],
  }),
  review: one(review, {
    fields: [booking.id],
    references: [review.bookingId],
  }),
}));

export const reviewRelations = relations(review, ({ one }) => ({
  listing: one(listing, {
    fields: [review.listingId],
    references: [listing.id],
  }),
  booking: one(booking, {
    fields: [review.bookingId],
    references: [booking.id],
  }),
  customer: one(user, {
    fields: [review.customerId],
    references: [user.id],
  }),
  seller: one(seller, {
    fields: [review.sellerId],
    references: [seller.id],
  }),
}));

export const escrowTransactionRelations = relations(escrowTransaction, ({ one, many }) => ({
  booking: one(booking, {
    fields: [escrowTransaction.bookingId],
    references: [booking.id],
  }),
  seller: one(seller, {
    fields: [escrowTransaction.sellerId],
    references: [seller.id],
  }),
  proofs: many(proofOfCompletion),
}));

export const proofOfCompletionRelations = relations(proofOfCompletion, ({ one }) => ({
  escrowTransaction: one(escrowTransaction, {
    fields: [proofOfCompletion.escrowTransactionId],
    references: [escrowTransaction.id],
  }),
  booking: one(booking, {
    fields: [proofOfCompletion.bookingId],
    references: [booking.id],
  }),
  seller: one(seller, {
    fields: [proofOfCompletion.sellerId],
    references: [seller.id],
  }),
  reviewer: one(user, {
    fields: [proofOfCompletion.reviewedBy],
    references: [user.id],
  }),
}));

export const payoutRelations = relations(payout, ({ one }) => ({
  seller: one(seller, {
    fields: [payout.sellerId],
    references: [seller.id],
  }),
}));

export const listingAnalyticsRelations = relations(listingAnalytics, ({ one }) => ({
  listing: one(listing, {
    fields: [listingAnalytics.listingId],
    references: [listing.id],
  }),
  seller: one(seller, {
    fields: [listingAnalytics.sellerId],
    references: [seller.id],
  }),
}));

export const sellerAnalyticsRelations = relations(sellerAnalytics, ({ one }) => ({
  seller: one(seller, {
    fields: [sellerAnalytics.sellerId],
    references: [seller.id],
  }),
}));
