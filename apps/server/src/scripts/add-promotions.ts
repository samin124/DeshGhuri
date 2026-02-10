import { db, listing } from '@DeshGhuri/db';
import { eq } from 'drizzle-orm';

/**
 * Script to add promotional data to existing listings
 * This will add flash deals and promo codes to some listings for demonstration
 */

async function addPromotions() {
  console.log('🎯 Starting promotion setup...');

  try {
    // Get all active listings
    const allListings = await db
      .select()
      .from(listing)
      .where(eq(listing.status, 'active'));

    console.log(`Found ${allListings.length} active listings`);

    if (allListings.length === 0) {
      console.log('No active listings found. Please create some listings first.');
      return;
    }

    // Add flash deals to first 3 listings
    const flashDealListings = allListings.slice(0, 3);
    console.log(`\n⚡ Adding flash deals to ${flashDealListings.length} listings...`);

    for (const item of flashDealListings) {
      const basePrice = parseFloat(item.basePrice);
      const discountPercent = 30 + Math.floor(Math.random() * 20); // 30-50% off
      const discountedPrice = (basePrice * (1 - discountPercent / 100)).toFixed(2);
      const flashDealEndsAt = new Date();
      flashDealEndsAt.setHours(flashDealEndsAt.getHours() + 24); // 24 hours from now

      await db
        .update(listing)
        .set({
          isFlashDeal: true,
          flashDealEndsAt,
          discountPercent,
          discountedPrice,
        })
        .where(eq(listing.id, item.id));

      console.log(`  ✓ ${item.title}`);
      console.log(`    - ${discountPercent}% OFF (৳${basePrice} → ৳${discountedPrice})`);
      console.log(`    - Ends: ${flashDealEndsAt.toLocaleString()}`);
    }

    // Add promo codes to next 3 listings (or overlap if not enough listings)
    const promoCodeListings = allListings.slice(2, 5);
    console.log(`\n🏷️  Adding promo codes to ${promoCodeListings.length} listings...`);

    const promoCodes = [
      { code: 'SAVE20', discount: 20, maxUses: 100 },
      { code: 'WINTER25', discount: 25, maxUses: 50 },
      { code: 'FLASH15', discount: 15, maxUses: 150 },
    ];

    for (let i = 0; i < promoCodeListings.length; i++) {
      const item = promoCodeListings[i];
      const promo = promoCodes[i % promoCodes.length];
      const promoCodeExpiresAt = new Date();
      promoCodeExpiresAt.setDate(promoCodeExpiresAt.getDate() + 7); // 7 days from now

      await db
        .update(listing)
        .set({
          promoCode: promo.code,
          promoCodeDiscount: promo.discount,
          promoCodeMaxUses: promo.maxUses,
          promoCodeUsedCount: 0,
          promoCodeExpiresAt,
        })
        .where(eq(listing.id, item.id));

      console.log(`  ✓ ${item.title}`);
      console.log(`    - Code: ${promo.code} (${promo.discount}% off)`);
      console.log(`    - Max uses: ${promo.maxUses}`);
      console.log(`    - Expires: ${promoCodeExpiresAt.toLocaleDateString()}`);
    }

    // Add regular discounts to next 2 listings
    const discountListings = allListings.slice(5, 7);
    if (discountListings.length > 0) {
      console.log(`\n💰 Adding regular discounts to ${discountListings.length} listings...`);

      for (const item of discountListings) {
        const basePrice = parseFloat(item.basePrice);
        const discountPercent = 10 + Math.floor(Math.random() * 15); // 10-25% off
        const discountedPrice = (basePrice * (1 - discountPercent / 100)).toFixed(2);

        await db
          .update(listing)
          .set({
            discountPercent,
            discountedPrice,
          })
          .where(eq(listing.id, item.id));

        console.log(`  ✓ ${item.title}`);
        console.log(`    - ${discountPercent}% OFF (৳${basePrice} → ৳${discountedPrice})`);
      }
    }

    console.log('\n✅ Promotions added successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Flash Deals: ${flashDealListings.length} listings`);
    console.log(`  - Promo Codes: ${promoCodeListings.length} listings`);
    console.log(`  - Regular Discounts: ${discountListings.length} listings`);
    console.log('\n🎉 Visit the homepage to see the promotional badges!');

  } catch (error) {
    console.error('❌ Error adding promotions:', error);
    throw error;
  }
}

// Run the script
addPromotions()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
