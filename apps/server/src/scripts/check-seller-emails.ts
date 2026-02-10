import { db } from '../../../../packages/db/src/index.js';
import { seller } from '../../../../packages/db/src/schema/seller.js';

const sellers = await db.select().from(seller).limit(6);

console.log('Sellers in database:');
sellers.forEach((s: any) => {
  console.log(`- ${s.businessName}`);
  console.log(`  email: ${s.email}`);
  console.log(`  contactEmail: ${s.contactEmail}`);
  console.log(`  passwordHash: ${!!s.passwordHash}`);
  console.log('');
});

process.exit(0);
