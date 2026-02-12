import { db, user, userRole, account, eq } from '@DeshGhuri/db';
import { nanoid } from 'nanoid';
import { hashPassword } from 'better-auth/crypto';

const ADMIN_EMAIL = 'admin@deshghuri.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'Admin User';

async function createAdmin() {
  console.log('\n🔧 Creating Admin Account\n');
  console.log('==================================');
  console.log(`📧 Email: ${ADMIN_EMAIL}`);
  console.log(`🔐 Password: ${ADMIN_PASSWORD}`);
  console.log(`👤 Name: ${ADMIN_NAME}`);
  console.log('==================================\n');

  try {
    // Check if admin user already exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, ADMIN_EMAIL),
    });

    let userId: string;

    if (existingUser) {
      console.log('ℹ️  Admin user already exists, deleting and recreating...');

      // Delete existing accounts
      await db.delete(account).where(eq(account.userId, existingUser.id));

      // Delete existing roles
      await db.delete(userRole).where(eq(userRole.userId, existingUser.id));

      // Delete user
      await db.delete(user).where(eq(user.id, existingUser.id));

      console.log('✅ Old admin account deleted');
    }

    // Create new admin user
    console.log('✨ Creating new admin user...');

    // Hash password with Better Auth's method
    const hashedPassword = await hashPassword(ADMIN_PASSWORD);

    const newUser = await db
      .insert(user)
      .values({
        id: `user_${nanoid(16)}`,
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    userId = newUser[0].id;

    // Create account entry for email/password auth
    await db.insert(account).values({
      id: `account_${nanoid(16)}`,
      userId: userId,
      accountId: ADMIN_EMAIL,
      providerId: 'credential',
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

    console.log('✅ Admin user created successfully!');

    // Check existing roles
    const existingRoles = await db.query.userRole.findMany({
      where: eq(userRole.userId, userId),
    });

    const existingRoleNames = existingRoles.map((r) => r.role);
    console.log(`📋 Existing roles: ${existingRoleNames.join(', ') || 'none'}`);

    // Assign roles: super_admin, admin, and customer
    const rolesToAssign = ['super_admin', 'admin', 'customer'];

    for (const role of rolesToAssign) {
      if (!existingRoleNames.includes(role)) {
        await db.insert(userRole).values({
          id: `role_${nanoid(16)}`,
          userId,
          role,
          createdAt: new Date(),
          createdBy: null,
        });
        console.log(`✅ Assigned '${role}' role`);
      } else {
        console.log(`ℹ️  Role '${role}' already exists`);
      }
    }

    console.log('\n==================================');
    console.log('✨ Admin account setup complete!');
    console.log('==================================');
    console.log(`\n📝 Login credentials:`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`\n🔗 Login at: http://localhost:3001/login`);
    console.log(`🔗 Admin Panel: http://localhost:3001/admin\n`);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  }
}

createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
