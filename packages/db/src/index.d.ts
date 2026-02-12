import * as schema from './schema';
export declare const db: import('drizzle-orm/node-postgres').NodePgDatabase<typeof schema> & {
  $client: import('pg').Pool;
};
export * from './schema';
export { eq, and, or, like, desc, asc, sql, count, sum, gte, lte } from 'drizzle-orm';
