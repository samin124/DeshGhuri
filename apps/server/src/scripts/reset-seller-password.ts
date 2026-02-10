import { db } from '../../../../packages/db/src/index.js';
import { seller } from '../../../../packages/db/src/schema/seller.js';
import { account } from '../../../../packages/db/src/schema/auth.js';
import { hash } from '@node-rs/argon2';
import { eq, and } from 'drizzle-orm';

// Reset password for Shadman Travel Agency
const sellerEmail = 'shadmanyaser959@gmail.com';
const newPassword = 'Seller@123';

console.log(`Finding seller with email: ${sellerEmail}...`);

// Find the seller
const sellerRecord = await db.query.seller.findFirst({
  where: eq(seller.email, sellerEmail),
});

if (!sellerRecord) {
  console.error('Seller not found!');
  process.exit(1);
}

if (!sellerRecord.userId) {
  console.error('Seller has no linked userId!');
  process.exit(1);
}

console.log(`Found seller: ${sellerRecord.businessName}`);
console.log(`UserId: ${sellerRecord.userId}`);

// Hash the new password
console.log('Hashing new password...');
const hashedPassword = await hash(newPassword, {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
});

// Update the account password
console.log('Updating account password...');
await db
  .update(account)
  .set({ password: hashedPassword })
  .where(
    and(
      eq(account.userId, sellerRecord.userId),
      eq(account.providerId, 'credential')
    )
  );

console.log('✅ Password reset successfully!');
console.log(`Email: ${sellerEmail}`);
console.log(`Password: ${newPassword}`);
console.log(`\nYou can now login as seller with these credentials.`);

process.exit(0);
