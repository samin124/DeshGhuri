import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from './schema';
import { customAlphabet } from 'nanoid';

// Load environment variables
dotenv.config({
  path: '../../apps/server/.env',
});

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);

function generateId(prefix: string): string {
  return `${prefix}_${nanoid()}`;
}

const db = drizzle(process.env.DATABASE_URL!, { schema });

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: bun run src/make-admin.ts user@example.com');
    process.exit(1);
  }

  try {
    // Find user by email
    const user = await db.query.user.findFirst({
      where: eq(schema.user.email, email),
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    // Check if user already has super_admin role
    const existingRoles = await db.query.userRole.findMany({
      where: eq(schema.userRole.userId, user.id),
    });

    const hasSuperAdmin = existingRoles.some((r) => r.role === 'super_admin');

    if (hasSuperAdmin) {
      console.log(`ℹ️  User ${email} already has super_admin role`);
      process.exit(0);
    }

    // Add super_admin role
    await db.insert(schema.userRole).values({
      id: generateId('role'),
      userId: user.id,
      role: 'super_admin',
      createdAt: new Date(),
      createdBy: null,
    });

    console.log(`✅ Successfully made ${email} a super_admin!`);
    console.log(`\n🎉 User can now access the admin panel at /admin/dashboard`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

makeAdmin();
