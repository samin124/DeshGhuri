import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, sql } from 'drizzle-orm';
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

async function seedRoles() {
  console.log('🌱 Seeding user roles...');

  try {
    // Get all users
    const users = await db.query.user.findMany();
    console.log(`Found ${users.length} users`);

    // Get all sellers
    const sellers = await db.query.seller.findMany();
    console.log(`Found ${sellers.length} sellers`);

    // Create a set of seller user IDs for quick lookup
    const sellerUserIds = new Set(sellers.map((s) => s.userId));

    let customerRolesAdded = 0;
    let sellerRolesAdded = 0;

    // Assign roles to all users
    for (const user of users) {
      // Check if user already has roles
      const existingRoles = await db.query.userRole.findMany({
        where: eq(schema.userRole.userId, user.id),
      });

      const existingRoleTypes = existingRoles.map((r) => r.role);

      // Add customer role if not exists
      if (!existingRoleTypes.includes('customer')) {
        await db.insert(schema.userRole).values({
          id: generateId('role'),
          userId: user.id,
          role: 'customer',
          createdAt: new Date(),
          createdBy: null,
        });
        customerRolesAdded++;
      }

      // Add seller role if user is a seller and doesn't have it
      if (sellerUserIds.has(user.id) && !existingRoleTypes.includes('seller')) {
        await db.insert(schema.userRole).values({
          id: generateId('role'),
          userId: user.id,
          role: 'seller',
          createdAt: new Date(),
          createdBy: null,
        });
        sellerRolesAdded++;
      }
    }

    console.log(`✅ Added ${customerRolesAdded} customer roles`);
    console.log(`✅ Added ${sellerRolesAdded} seller roles`);

    // Check if we need to create an admin user
    const adminRoles = await db.query.userRole.findMany({
      where: sql`${schema.userRole.role} IN ('admin', 'super_admin')`,
    });

    if (adminRoles.length === 0 && users.length > 0) {
      // Make the first user a super_admin
      const firstUser = users[0];
      await db.insert(schema.userRole).values({
        id: generateId('role'),
        userId: firstUser.id,
        role: 'super_admin',
        createdAt: new Date(),
        createdBy: null,
      });
      console.log(`✅ Made user ${firstUser.email} a super_admin`);
    } else if (adminRoles.length > 0) {
      console.log(`ℹ️  Admin users already exist, skipping admin creation`);
    } else {
      console.log(`⚠️  No users found, cannot create admin`);
    }

    console.log('🎉 Role seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    process.exit(1);
  }

  process.exit(0);
}

seedRoles();
