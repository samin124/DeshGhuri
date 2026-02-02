import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, json, index } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const auditLog = pgTable(
  'audit_log',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => user.id),
    action: text('action').notNull(), // e.g., 'user.suspend', 'seller.approve', 'document.reject'
    entityType: text('entity_type').notNull(), // e.g., 'user', 'seller', 'document'
    entityId: text('entity_id').notNull(),
    oldValue: json('old_value'),
    newValue: json('new_value'),
    metadata: json('metadata'), // Additional context like IP address, user agent, etc.
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('auditLog_userId_idx').on(table.userId),
    index('auditLog_action_idx').on(table.action),
    index('auditLog_entityType_idx').on(table.entityType),
    index('auditLog_entityId_idx').on(table.entityId),
    index('auditLog_createdAt_idx').on(table.createdAt),
  ],
);

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(user, {
    fields: [auditLog.userId],
    references: [user.id],
  }),
}));
