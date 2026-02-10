import { db } from '../../../../packages/db/src/index.js';
import { listing } from '../../../../packages/db/src/schema/marketplace.js';
import { eq } from 'drizzle-orm';

const listingId = 'listing_HcFhoTbI5YXeol8SWM6dG';

console.log(`Checking status of listing ${listingId}...`);

const listingRecord = await db.query.listing.findFirst({
  where: eq(listing.id, listingId),
});

if (!listingRecord) {
  console.error('Listing not found!');
  process.exit(1);
}

console.log('✅ Listing found!');
console.log(`Title: ${listingRecord.title}`);
console.log(`Status: ${listingRecord.status}`);
console.log(`Is Active: ${listingRecord.isActive}`);
console.log(`Published At: ${listingRecord.publishedAt}`);
console.log(`Created At: ${listingRecord.createdAt}`);
console.log(`Updated At: ${listingRecord.updatedAt}`);

process.exit(0);
