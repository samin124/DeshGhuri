import { env } from '@DeshGhuri/env/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
export const db = drizzle(env.DATABASE_URL, { schema });
export * from './schema';
// Re-export commonly used drizzle-orm utilities
export { eq, and, or, like, desc, asc, sql, count, sum, gte, lte } from 'drizzle-orm';
