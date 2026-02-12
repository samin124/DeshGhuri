import { db } from '../../../../packages/db/src/index.js';
import { seller } from '../../../../packages/db/src/schema/seller.js';
import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';

// Set password for Sundarbans Explorer
const email = 'info@sundarbanexplorer.bd';
const password = 'Seller@123';

console.log(`Setting password for ${email}...`);

const hashedPassword = await hash(password, {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
});

await db.update(seller).set({ passwordHash: hashedPassword }).where(eq(seller.contactEmail, email));

console.log('Password set successfully!');
console.log(`Email: ${email}`);
console.log(`Password: ${password}`);

process.exit(0);
