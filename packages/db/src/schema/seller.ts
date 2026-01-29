import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  json,
  integer,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

export const seller = pgTable(
  'seller',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    businessName: text('business_name').notNull(),
    category: text('category').notNull(), // 'agency' | 'hotel' | 'tour-operator'
    registrationNumber: text('registration_number').notNull(),
    address: json('address').$type<{
      street: string;
      city: string;
      district: string;
      postalCode?: string;
    }>().notNull(),
    contactPhone: text('contact_phone').notNull(),
    contactEmail: text('contact_email').notNull(),
    businessDescription: text('business_description'),
    verificationStatus: text('verification_status').notNull().default('pending'), // 'pending' | 'in-review' | 'approved' | 'rejected' | 'incomplete'
    verifiedAt: timestamp('verified_at'),
    rating: integer('rating'),
    reviewCount: integer('review_count').default(0),
    totalBookings: integer('total_bookings').default(0),
    totalRevenue: integer('total_revenue').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('seller_userId_idx').on(table.userId),
    index('seller_verificationStatus_idx').on(table.verificationStatus),
  ]
);

export const sellerDocument = pgTable(
  'seller_document',
  {
    id: text('id').primaryKey(),
    sellerId: text('seller_id')
      .notNull()
      .references(() => seller.id, { onDelete: 'cascade' }),
    documentType: text('document_type').notNull(), // 'trade-license' | 'nid' | 'passport' | 'tin-certificate' | 'property-docs' | 'tour-license'
    fileName: text('file_name').notNull(),
    fileUrl: text('file_url').notNull(),
    fileSize: integer('file_size').notNull(),
    cloudinaryPublicId: text('cloudinary_public_id'),
    status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
    rejectionReason: text('rejection_reason'),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
    reviewedAt: timestamp('reviewed_at'),
    reviewedBy: text('reviewed_by').references(() => user.id),
  },
  (table) => [
    index('sellerDocument_sellerId_idx').on(table.sellerId),
    index('sellerDocument_status_idx').on(table.status),
  ]
);

export const sellerBankAccount = pgTable(
  'seller_bank_account',
  {
    id: text('id').primaryKey(),
    sellerId: text('seller_id')
      .notNull()
      .references(() => seller.id, { onDelete: 'cascade' }),
    bankName: text('bank_name').notNull(),
    branchName: text('branch_name').notNull(),
    accountHolderName: text('account_holder_name').notNull(),
    accountNumber: text('account_number').notNull(),
    routingNumber: text('routing_number'),
    accountType: text('account_type').notNull(), // 'savings' | 'current'
    verified: boolean('verified').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('sellerBankAccount_sellerId_idx').on(table.sellerId)]
);

export const verificationTimeline = pgTable(
  'verification_timeline',
  {
    id: text('id').primaryKey(),
    sellerId: text('seller_id')
      .notNull()
      .references(() => seller.id, { onDelete: 'cascade' }),
    status: text('status').notNull(), // 'pending' | 'in-review' | 'approved' | 'rejected' | 'incomplete'
    message: text('message').notNull(),
    performedBy: text('performed_by').references(() => user.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('verificationTimeline_sellerId_idx').on(table.sellerId),
    index('verificationTimeline_createdAt_idx').on(table.createdAt),
  ]
);

// Relations
export const sellerRelations = relations(seller, ({ one, many }) => ({
  user: one(user, {
    fields: [seller.userId],
    references: [user.id],
  }),
  documents: many(sellerDocument),
  bankAccount: one(sellerBankAccount),
  timeline: many(verificationTimeline),
}));

export const sellerDocumentRelations = relations(sellerDocument, ({ one }) => ({
  seller: one(seller, {
    fields: [sellerDocument.sellerId],
    references: [seller.id],
  }),
  reviewer: one(user, {
    fields: [sellerDocument.reviewedBy],
    references: [user.id],
  }),
}));

export const sellerBankAccountRelations = relations(sellerBankAccount, ({ one }) => ({
  seller: one(seller, {
    fields: [sellerBankAccount.sellerId],
    references: [seller.id],
  }),
}));

export const verificationTimelineRelations = relations(verificationTimeline, ({ one }) => ({
  seller: one(seller, {
    fields: [verificationTimeline.sellerId],
    references: [seller.id],
  }),
  performedByUser: one(user, {
    fields: [verificationTimeline.performedBy],
    references: [user.id],
  }),
}));
