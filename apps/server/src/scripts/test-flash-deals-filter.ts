/**
 * Test script to verify flash deals filter works on search endpoint
 */

const API_URL = process.env.VITE_SERVER_URL || 'http://localhost:3000';

async function testFlashDealsFilter() {
  console.log('🧪 Testing Flash Deals Filter on Search Endpoint...\n');

  try {
    // Test 1: Get all listings (no filter)
    console.log('Test 1: Get all active listings (no filter)...');
    const allListingsRes = await fetch(`${API_URL}/api/listings?limit=50`);
    const allListingsData = await allListingsRes.json();
    console.log(`✅ Found ${allListingsData.data.length} total active listings\n`);

    // Test 2: Get only flash deals
    console.log('Test 2: Get only flash deals (flashDeals=true)...');
    const flashDealsRes = await fetch(`${API_URL}/api/listings?flashDeals=true&limit=50`);

    if (!flashDealsRes.ok) {
      throw new Error(`Flash deals filter failed: ${flashDealsRes.status}`);
    }

    const flashDealsData = await flashDealsRes.json();
    console.log(`✅ Filter applied successfully`);
    console.log(`   Found ${flashDealsData.data.length} flash deals\n`);

    // Verify all returned items are flash deals
    let allAreFlashDeals = true;
    let allHaveValidExpiry = true;

    console.log('Verifying returned listings:');
    flashDealsData.data.forEach((listing: any, index: number) => {
      console.log(`\n${index + 1}. ${listing.title}`);
      console.log(`   - isFlashDeal: ${listing.isFlashDeal}`);
      console.log(`   - discountPercent: ${listing.discountPercent}%`);
      console.log(`   - flashDealEndsAt: ${listing.flashDealEndsAt}`);

      const expiresAt = new Date(listing.flashDealEndsAt);
      const isExpired = expiresAt <= new Date();
      console.log(`   - Expired: ${isExpired ? '❌' : '✅'}`);

      if (!listing.isFlashDeal) {
        console.log(`   ⚠️  ERROR: Not a flash deal!`);
        allAreFlashDeals = false;
      }

      if (isExpired) {
        console.log(`   ⚠️  ERROR: Flash deal is expired!`);
        allHaveValidExpiry = false;
      }
    });

    console.log('\n📊 RESULTS:');
    console.log(`   Total active listings: ${allListingsData.data.length}`);
    console.log(`   Flash deals returned: ${flashDealsData.data.length}`);
    console.log(`   All are flash deals: ${allAreFlashDeals ? '✅' : '❌'}`);
    console.log(`   All have valid expiry: ${allHaveValidExpiry ? '✅' : '❌'}`);
    console.log(
      `   Filter working correctly: ${allAreFlashDeals && allHaveValidExpiry ? '✅' : '❌'}`
    );

    // Test 3: Verify badges display on frontend
    console.log('\n\nTest 3: Simulating frontend badge display...');
    flashDealsData.data.forEach((listing: any) => {
      const hasFlashDealBadge = listing.isFlashDeal && listing.discountPercent;
      const hasPromoBadge = listing.promoCode && listing.promoCodeExpiresAt;

      console.log(`\n${listing.title}:`);
      console.log(`   Flash Sale Badge: ${hasFlashDealBadge ? '✅ Will display' : '❌ Missing'}`);
      if (hasPromoBadge) {
        console.log(`   Promo Code Badge: ✅ Will display (${listing.promoCode})`);
      }
    });

    if (allAreFlashDeals && allHaveValidExpiry) {
      console.log('\n\n✅ All tests passed!');
      console.log('   "View All Deals" will show only flash deals with badges.');
    } else {
      console.log('\n\n⚠️  Some issues detected. Check the output above.');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test
testFlashDealsFilter()
  .then(() => {
    console.log('\n✨ Test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
