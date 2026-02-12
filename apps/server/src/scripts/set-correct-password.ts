import { db } from '../../../../packages/db/src/index.js';
import { account } from '../../../../packages/db/src/schema/auth.js';
import { seller } from '../../../../packages/db/src/schema/seller.js';
import { hash } from '@node-rs/argon2';
import { eq, and } from 'drizzle-orm';

// Set correct password for Shadman Travel Agency
const sellerEmail = 'shadmanyaser959@gmail.com';
const correctPassword = 'Samin@12345';

console.log(`Setting correct password for ${sellerEmail}...`);

// Find the seller
const sellerRecord = await db.query.seller.findFirst({
  where: eq(seller.email, sellerEmail),
});

if (!sellerRecord || !sellerRecord.userId) {
  console.error('Seller not found or has no userId!');
  process.exit(1);
}

console.log(`Found seller: ${sellerRecord.businessName}`);

// Hash the password
const hashedPassword = await hash(correctPassword, {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
});

// Update the account password
await db
  .update(account)
  .set({ password: hashedPassword })
  .where(and(eq(account.userId, sellerRecord.userId), eq(account.providerId, 'credential')));

console.log('✅ Password updated successfully!');
console.log(`Email: ${sellerEmail}`);
console.log(`Password: ${correctPassword}`);

process.exit(0);
