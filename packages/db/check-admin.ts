import { db, eq, user, userRole, seller } from './src/index';

async function checkAdminSeller() {
  const testAdmin = await db.query.user.findFirst({
    where: eq(user.email, 'testadmin@deshghuri.com'),
  });

  if (!testAdmin) {
    console.log('❌ Test admin user not found');
    process.exit(0);
  }

  console.log('✅ Found:', testAdmin.email, '| ID:', testAdmin.id);

  const roles = await db.query.userRole.findMany({
    where: eq(userRole.userId, testAdmin.id),
  });

  console.log('📋 Roles:', roles.map(r => r.role).join(', '));

  const sellerAccount = await db.query.seller.findFirst({
    where: eq(seller.userId, testAdmin.id),
  });

  if (sellerAccount) {
    console.log('⚠️  SELLER ACCOUNT EXISTS (created before restriction)');
    console.log('   ID:', sellerAccount.id);
    console.log('   Business:', sellerAccount.businessName);
  } else {
    console.log('✅ No seller account (restriction working!)');
  }

  process.exit(0);
}

checkAdminSeller().catch(console.error);
