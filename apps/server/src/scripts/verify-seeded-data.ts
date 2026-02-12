import { db, listing, seller } from '@DeshGhuri/db';
import { eq, sql, and } from 'drizzle-orm';

async function verifyData() {
  console.log('🔍 Verifying seeded data...\n');

  try {
    // Check sellers
    const allSellers = await db.select().from(seller);
    console.log(`✅ Total Sellers: ${allSellers.length}`);

    // Check listings
    const allListings = await db.select().from(listing);
    console.log(`✅ Total Listings: ${allListings.length}`);

    // Check active listings
    const activeListings = await db.select().from(listing).where(eq(listing.status, 'active'));
    console.log(`✅ Active Listings: ${activeListings.length}`);

    // Check flash deals
    const flashDeals = await db
      .select()
      .from(listing)
      .where(and(eq(listing.isFlashDeal, true), sql`${listing.flashDealEndsAt} > NOW()`));
    console.log(`⚡ Active Flash Deals: ${flashDeals.length}`);

    // Check promo codes
    const promoCodeListings = await db
      .select()
      .from(listing)
      .where(sql`${listing.promoCode} IS NOT NULL`);
    console.log(`🏷️  Listings with Promo Codes: ${promoCodeListings.length}`);

    // Check discounts
    const discountedListings = await db
      .select()
      .from(listing)
      .where(sql`${listing.discountPercent} IS NOT NULL`);
    console.log(`💰 Listings with Discounts: ${discountedListings.length}`);

    // Check featured & trending
    const featured = await db.select().from(listing).where(eq(listing.isFeatured, true));
    const trending = await db.select().from(listing).where(eq(listing.isTrending, true));
    console.log(`⭐ Featured Listings: ${featured.length}`);
    console.log(`📈 Trending Listings: ${trending.length}`);

    // Sample listings by category
    console.log('\n📊 Listings by Category:');
    const categories = ['hotel', 'tour-package', 'experience', 'transport'];
    for (const cat of categories) {
      const catListings = await db.select().from(listing).where(eq(listing.category, cat));
      console.log(`  ${cat}: ${catListings.length}`);
    }

    // Sample flash deal details
    if (flashDeals.length > 0) {
      console.log('\n⚡ Sample Flash Deal:');
      const sample = flashDeals[0];
      console.log(`  Title: ${sample.title}`);
      console.log(`  Base Price: ${sample.basePrice} BDT`);
      console.log(`  Discount: ${sample.discountPercent}%`);
      console.log(`  Discounted Price: ${sample.discountedPrice} BDT`);
      console.log(`  Expires: ${sample.flashDealEndsAt}`);
    }

    console.log('\n✨ Data verification complete!');
  } catch (error) {
    console.error('❌ Verification error:', error);
    throw error;
  }
}

verifyData()
  .then(() => {
    console.log('\n✅ Verification passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
