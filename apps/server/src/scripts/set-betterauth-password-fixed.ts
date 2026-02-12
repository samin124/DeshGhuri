import { db } from '../../../../packages/db/src/index.js';
import { account } from '../../../../packages/db/src/schema/auth.js';
import { seller } from '../../../../packages/db/src/schema/seller.js';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

// Helper function to generate Better Auth compatible password hash (salt:hash format)
async function generateBetterAuthHash(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate random salt
    const salt = crypto.randomBytes(16).toString('hex');

    // Generate hash using pbkdf2 (similar to Better Auth's approach)
    crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      const hash = derivedKey.toString('hex');
      resolve(`${salt}:${hash}`);
    });
  });
}

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
const hashedPassword = await generateBetterAuthHash(correctPassword);

console.log(`Hashed password (first 50 chars): ${hashedPassword.substring(0, 50)}...`);

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
