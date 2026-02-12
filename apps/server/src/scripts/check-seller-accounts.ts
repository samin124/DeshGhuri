import { db } from '../../../../packages/db/src/index.js';
import { seller } from '../../../../packages/db/src/schema/seller.js';
import { user, account } from '../../../../packages/db/src/schema/auth.js';
import { eq } from 'drizzle-orm';

const sellers = await db.select().from(seller).limit(6);

console.log('Checking seller accounts and credentials:\n');

for (const s of sellers) {
  console.log(`${s.businessName}:`);
  console.log(`  email: ${s.email}`);
  console.log(`  userId: ${s.userId || 'NULL'}`);

  if (s.userId) {
    // Check if user exists
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, s.userId),
    });

    if (userRecord) {
      console.log(`  user found: ${userRecord.email}`);

      // Check if account with password exists
      const accountRecord = await db.query.account.findFirst({
        where: eq(account.userId, s.userId),
      });

      if (accountRecord) {
        console.log(
          `  account found - providerId: ${accountRecord.providerId}, hasPassword: ${!!accountRecord.password}`
        );
      } else {
        console.log(`  no account record found`);
      }
    } else {
      console.log(`  user not found!`);
    }
  } else {
    console.log(`  no userId linked - cannot authenticate`);
  }
  console.log('');
}

process.exit(0);
