import { db, auditLog } from '@DeshGhuri/db';
import { generateId } from './id';

export interface AuditLogInput {
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
}

/**
 * Create an audit log entry
 * Records all admin actions for compliance and debugging
 */
export async function createAuditLog({
  userId,
  action,
  entityType,
  entityId,
  oldValue,
  newValue,
  metadata,
}: AuditLogInput) {
  try {
    await db.insert(auditLog).values({
      id: generateId('audit'),
      userId,
      action,
      entityType,
      entityId,
      oldValue: oldValue ? (oldValue as object) : null,
      newValue: newValue ? (newValue as object) : null,
      metadata: metadata ? (metadata as object) : null,
      createdAt: new Date(),
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break the main operation
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Helper to extract request metadata for audit logs
 */
export function getRequestMetadata(headers: Headers): Record<string, unknown> {
  return {
    userAgent: headers.get('user-agent') || 'unknown',
    ip: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
    timestamp: new Date().toISOString(),
  };
}
