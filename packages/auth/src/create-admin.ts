import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { customAlphabet } from 'nanoid';
import { hash } from '@node-rs/argon2';
import * as schema from '../../db/src/schema';

// Load environment variables
dotenv.config({
  path: '../../apps/server/.env',
});

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 32);

function generateId(): string {
  return nanoid();
}

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
    console.log('🔐 Hashing password...');
    const hashedPassword = await hash(password);
    console.log('✅ Password hashed\n');

    // Create user
    console.log('👤 Creating user account...');
    const userId = generateId();

    // Use raw SQL to insert only existing columns
    await db.execute(`
      INSERT INTO "user" (id, name, email, email_verified, image, created_at, updated_at)
      VALUES ('${userId}', '${name}', '${email}', true, NULL, NOW(), NOW())
    `);
    console.log(`✅ User created: ${email}`);

    // Create account entry for password login
    console.log('🔑 Creating account credentials...');
    const accountId = generateId();
    await db.execute(`
      INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at)
      VALUES ('${accountId}', '${email}', 'credential', '${userId}', '${hashedPassword}', NOW(), NOW())
    `);
    console.log('✅ Credentials created\n');

    // Add super_admin role
    console.log('👑 Adding super_admin role...');
    await db.execute(`
      INSERT INTO user_role (id, user_id, role, created_at, created_by)
      VALUES ('${generateId()}', '${userId}', 'super_admin', NOW(), NULL)
    `);
    console.log('✅ Super admin role added\n');

    // Add customer role (default)
    console.log('🛍️  Adding customer role...');
    await db.execute(`
      INSERT INTO user_role (id, user_id, role, created_at, created_by)
      VALUES ('${generateId()}', '${userId}', 'customer', NOW(), NULL)
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
