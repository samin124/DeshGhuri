import { db, listing } from '@DeshGhuri/db';
import { eq, and, sql } from 'drizzle-orm';

/**
 * Verification script to check promotional data
 */

async function verifyPromotions() {
  console.log('🔍 Verifying promotional setup...\n');

  try {
    // Check flash deals
    const flashDeals = await db
      .select()
      .from(listing)
      .where(and(eq(listing.status, 'active'), eq(listing.isFlashDeal, true)));

    console.log('⚡ FLASH DEALS:');
    console.log(`Found ${flashDeals.length} flash deals\n`);

    flashDeals.forEach((deal, index) => {
      console.log(`${index + 1}. ${deal.title}`);
      console.log(`   - Original: ৳${deal.basePrice}`);
      console.log(`   - Discounted: ৳${deal.discountedPrice} (${deal.discountPercent}% OFF)`);
      console.log(`   - Ends: ${deal.flashDealEndsAt?.toLocaleString() || 'N/A'}`);
      console.log(
        `   - Active: ${deal.flashDealEndsAt ? new Date(deal.flashDealEndsAt) > new Date() : false}`
      );
      console.log('');
    });

    // Check promo codes
    const promoListings = await db
      .select()
      .from(listing)
      .where(and(eq(listing.status, 'active'), sql`${listing.promoCode} IS NOT NULL`));

    console.log('🏷️  PROMO CODES:');
    console.log(`Found ${promoListings.length} listings with promo codes\n`);

    promoListings.forEach((item, index) => {
      const isActive = item.promoCodeExpiresAt
        ? new Date(item.promoCodeExpiresAt) > new Date()
        : false;
      const usesLeft = (item.promoCodeMaxUses || 0) - (item.promoCodeUsedCount || 0);

      console.log(`${index + 1}. ${item.title}`);
      console.log(`   - Code: ${item.promoCode}`);
      console.log(`   - Discount: ${item.promoCodeDiscount}%`);
      console.log(
        `   - Uses: ${item.promoCodeUsedCount}/${item.promoCodeMaxUses} (${usesLeft} left)`
      );
      console.log(`   - Expires: ${item.promoCodeExpiresAt?.toLocaleDateString() || 'N/A'}`);
      console.log(`   - Active: ${isActive}`);
      console.log('');
    });

    // Check regular discounts
    const discountedListings = await db
      .select()
      .from(listing)
      .where(
        and(
          eq(listing.status, 'active'),
          sql`${listing.discountPercent} IS NOT NULL`,
          sql`${listing.isFlashDeal} = false`
        )
      );

    console.log('💰 REGULAR DISCOUNTS:');
    console.log(`Found ${discountedListings.length} listings with regular discounts\n`);

    discountedListings.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   - Original: ৳${item.basePrice}`);
      console.log(`   - Discounted: ৳${item.discountedPrice} (${item.discountPercent}% OFF)`);
      console.log('');
    });

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`  ⚡ Flash Deals: ${flashDeals.length}`);
    console.log(`  🏷️  Promo Codes: ${promoListings.length}`);
    console.log(`  💰 Regular Discounts: ${discountedListings.length}`);
    console.log(
      `  📦 Total Promoted: ${flashDeals.length + promoListings.length + discountedListings.length}`
    );

    console.log('\n✅ Verification complete!');
    console.log(
      '💡 Tip: Visit http://localhost:5173 to see the promotional badges on the homepage'
    );
  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  }
}

// Run the script
verifyPromotions()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
