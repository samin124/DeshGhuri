import { db, listing } from '@DeshGhuri/db';

async function checkGroupEligible() {
  console.log('🔍 Checking groupEligible field...\n');

  try {
    const allListings = await db.select().from(listing).limit(10);

    console.log('Sample Listings:\n');
    allListings.forEach((l, i) => {
      console.log(`${i + 1}. ${l.title}`);
      console.log(`   Group Eligible: ${l.groupEligible}`);
      console.log(`   Category: ${l.category}`);
      console.log('');
    });

    console.log('✅ Check complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

checkGroupEligible()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
