import { db } from './src';
import { sql } from 'drizzle-orm';

async function runMigration() {
  try {
    console.log('Running migration...');

    // Add banned column
    await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banned" boolean DEFAULT false NOT NULL`);
    console.log('Added banned column');

    // Add ban_reason column
    await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ban_reason" text`);
    console.log('Added ban_reason column');

    // Add ban_expires column
    await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ban_expires" timestamp`);
    console.log('Added ban_expires column');

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
