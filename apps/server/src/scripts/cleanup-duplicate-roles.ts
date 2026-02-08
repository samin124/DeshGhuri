/**
 * Database Cleanup Script: Remove Duplicate Roles
 *
 * This script enforces one-role-per-user policy by:
 * 1. Finding users with multiple roles
 * 2. Keeping only the highest priority role
 * 3. Deleting duplicate role entries
 *
 * Role Priority: super_admin > admin > seller > customer
 *
 * Usage: bun run scripts/cleanup-duplicate-roles.ts
 */

import { db, userRole, user, eq } from '@DeshGhuri/db';

// Define role priority (higher number = higher priority)
const ROLE_PRIORITY: Record<string, number> = {
  super_admin: 4,
  admin: 3,
  seller: 2,
  customer: 1,
};

async function cleanupDuplicateRoles() {
  console.log('🔍 Starting duplicate roles cleanup...\n');

  try {
    // Get all user roles
    const allUserRoles = await db.query.userRole.findMany();

    // Group roles by userId
    const rolesByUser = new Map<string, typeof allUserRoles>();

    for (const role of allUserRoles) {
      if (!rolesByUser.has(role.userId)) {
        rolesByUser.set(role.userId, []);
      }
      rolesByUser.get(role.userId)!.push(role);
    }

    console.log(`📊 Total users: ${rolesByUser.size}`);
    console.log(`📊 Total role entries: ${allUserRoles.length}\n`);

    // Find users with multiple roles
    const usersWithMultipleRoles: Array<{
      userId: string;
      email: string;
      roles: typeof allUserRoles;
    }> = [];

    for (const [userId, roles] of rolesByUser.entries()) {
      if (roles.length > 1) {
        // Get user email
        const userData = await db.query.user.findFirst({
          where: eq(user.id, userId),
        });

        if (userData) {
          usersWithMultipleRoles.push({
            userId,
            email: userData.email,
            roles,
          });
        }
      }
    }

    if (usersWithMultipleRoles.length === 0) {
      console.log('✅ No users with multiple roles found. Database is clean!');
      return;
    }

    console.log(`⚠️  Found ${usersWithMultipleRoles.length} users with multiple roles:\n`);

    // Process each user with multiple roles
    for (const userData of usersWithMultipleRoles) {
      console.log(`\n👤 User: ${userData.email}`);
      console.log(`   Current roles: ${userData.roles.map(r => r.role).join(', ')}`);

      // Determine which role to keep (highest priority)
      let roleToKeep = userData.roles[0];
      let highestPriority = ROLE_PRIORITY[roleToKeep.role] || 0;

      for (const role of userData.roles) {
        const priority = ROLE_PRIORITY[role.role] || 0;
        if (priority > highestPriority) {
          roleToKeep = role;
          highestPriority = priority;
        }
      }

      console.log(`   ✅ Keeping: ${roleToKeep.role}`);

      // Delete all roles except the one to keep
      const rolesToDelete = userData.roles.filter(r => r.id !== roleToKeep.id);

      for (const role of rolesToDelete) {
        await db.delete(userRole).where(eq(userRole.id, role.id));
        console.log(`   ❌ Deleted: ${role.role}`);
      }
    }

    console.log('\n\n📋 Cleanup Summary:');
    console.log(`   - Users processed: ${usersWithMultipleRoles.length}`);
    console.log(`   - Roles kept: ${usersWithMultipleRoles.length}`);
    console.log(`   - Roles deleted: ${allUserRoles.length - rolesByUser.size}`);

    // Verify cleanup
    const remainingDuplicates = await verifyNoDuplicates();
    if (remainingDuplicates === 0) {
      console.log('\n✅ Cleanup successful! All users now have exactly one role.');
    } else {
      console.log(`\n⚠️  Warning: ${remainingDuplicates} users still have multiple roles.`);
    }
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    throw error;
  }
}

async function verifyNoDuplicates(): Promise<number> {
  const allUserRoles = await db.query.userRole.findMany();
  const rolesByUser = new Map<string, number>();

  for (const role of allUserRoles) {
    rolesByUser.set(role.userId, (rolesByUser.get(role.userId) || 0) + 1);
  }

  let duplicateCount = 0;
  for (const count of rolesByUser.values()) {
    if (count > 1) {
      duplicateCount++;
    }
  }

  return duplicateCount;
}

// Run the cleanup
cleanupDuplicateRoles()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
