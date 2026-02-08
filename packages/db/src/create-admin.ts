import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { customAlphabet } from 'nanoid';
import * as schema from './schema';

// Load environment variables
dotenv.config({
  path: '../../apps/server/.env',
});

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 32);

function generateId(prefix: string): string {
  return nanoid();
}

// Define user_role table inline since it might not exist yet
const userRole = pgTable('user_role', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  role: text('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: text('created_by'),
});

const db = drizzle(process.env.DATABASE_URL!, { schema });

async function createAdmin() {
  console.log('🚀 Creating admin account...\n');

  const email = 'admin@deshghuri.com';
  const password = 'Admin@123456';
  const name = 'Admin User';

  try {
    // First, create the user_role table if it doesn't exist
    console.log('📋 Creating user_role table if not exists...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_role (
        id text PRIMARY KEY,
        user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        role text NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL,
        created_by text REFERENCES "user"(id)
      );

      CREATE INDEX IF NOT EXISTS userRole_userId_idx ON user_role(user_id);
      CREATE INDEX IF NOT EXISTS userRole_role_idx ON user_role(role);
    `);
    console.log('✅ Table created/verified\n');

    // Hash password using Argon2
    const { hash } = await import('@node-rs/argon2');
    const hashedPassword = await hash(password);

    // Create user
    console.log('👤 Creating user account...');
    const userId = generateId('');

    await db.insert(schema.user).values({
      id: userId,
      name,
      email,
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`✅ User created: ${email}`);

    // Create account entry for password login
    console.log('🔐 Creating account credentials...');
    await db.insert(schema.account).values({
      id: generateId(''),
      accountId: email,
      providerId: 'credential',
      userId,
      password: hashedPassword,
      accessToken: null,
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Credentials created\n');

    // Add super_admin role
    console.log('👑 Adding super_admin role...');
    await db.execute(`
      INSERT INTO user_role (id, user_id, role, created_at, created_by)
      VALUES ('${generateId('')}', '${userId}', 'super_admin', NOW(), NULL)
    `);
    console.log('✅ Super admin role added\n');

    // Add customer role (default)
    console.log('🛍️  Adding customer role...');
    await db.execute(`
      INSERT INTO user_role (id, user_id, role, created_at, created_by)
      VALUES ('${generateId('')}', '${userId}', 'customer', NOW(), NULL)
    `);
    console.log('✅ Customer role added\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ADMIN ACCOUNT CREATED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📧 Email:    ' + email);
    console.log('🔑 Password: ' + password);
    console.log('\n✨ You can now log in at: http://127.0.0.1:3001/login');
    console.log('🎯 Admin Dashboard: http://127.0.0.1:3001/admin/dashboard\n');

  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    process.exit(1);
  }

  process.exit(0);
}

createAdmin();
