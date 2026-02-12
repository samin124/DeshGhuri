import { db } from '../../../../packages/db/src/index.js';
import { account } from '../../../../packages/db/src/schema/auth.js';
import { seller } from '../../../../packages/db/src/schema/seller.js';
import { eq, and } from 'drizzle-orm';
import { auth } from '@DeshGhuri/auth';

// Set password using Better Auth's hashing method
const sellerEmail = 'shadmanyaser959@gmail.com';
const correctPassword = 'Samin@12345';

console.log(`Setting Better Auth compatible password for ${sellerEmail}...`);

// Find the seller
const sellerRecord = await db.query.seller.findFirst({
  where: eq(seller.email, sellerEmail),
});

if (!sellerRecord || !sellerRecord.userId) {
  console.error('Seller not found or has no userId!');
  process.exit(1);
}

console.log(`Found seller: ${sellerRecord.businessName}`);
console.log(`User ID: ${sellerRecord.userId}`);

// Hash password using Better Auth's method
const hashedPassword = await auth.api.hashPassword({ body: { password: correctPassword } });

console.log(`Hashed password: ${hashedPassword}`);

// Update the account password
const result = await db
  .update(account)
  .set({ password: hashedPassword })
  .where(and(eq(account.userId, sellerRecord.userId), eq(account.providerId, 'credential')))
  .returning();

console.log(`Updated ${result.length} account(s)`);
console.log('✅ Password updated with Better Auth format!');
console.log(`Email: ${sellerEmail}`);
console.log(`Password: ${correctPassword}`);

process.exit(0);
