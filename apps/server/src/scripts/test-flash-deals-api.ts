/**
 * Test script to verify flash deals API endpoint
 */

const API_URL = process.env.VITE_SERVER_URL || 'http://localhost:3000';

async function testFlashDealsAPI() {
  console.log('🧪 Testing Flash Deals API Endpoint...\n');

  try {
    // Test flash deals endpoint
    console.log('Testing /api/listings/flash-deals...');
    const flashDealsRes = await fetch(`${API_URL}/api/listings/flash-deals`);

    if (!flashDealsRes.ok) {
      throw new Error(`Flash deals API failed: ${flashDealsRes.status}`);
    }

    const flashDealsData = await flashDealsRes.json();
    console.log(`✅ Flash Deals Endpoint Working`);
    console.log(`   Found ${flashDealsData.data.length} flash deals\n`);

    // Verify all have flash deal flags
    let allHaveFlashDealFlag = true;
    let allHaveBadgeData = true;

    flashDealsData.data.forEach((listing: any, index: number) => {
      console.log(`${index + 1}. ${listing.title}`);
      console.log(`   - isFlashDeal: ${listing.isFlashDeal}`);
      console.log(`   - discountPercent: ${listing.discountPercent}%`);
      console.log(`   - discountedPrice: ৳${listing.discountedPrice}`);
      console.log(`   - flashDealEndsAt: ${listing.flashDealEndsAt}`);

      if (!listing.isFlashDeal) {
        console.log(`   ⚠️  WARNING: Missing isFlashDeal flag!`);
        allHaveFlashDealFlag = false;
      }

      if (!listing.discountPercent || !listing.discountedPrice) {
        console.log(`   ⚠️  WARNING: Missing badge data!`);
        allHaveBadgeData = false;
      }

      console.log('');
    });

    // Test trending endpoint
    console.log('\nTesting /api/listings/trending...');
    const trendingRes = await fetch(`${API_URL}/api/listings/trending`);

    if (!trendingRes.ok) {
      throw new Error(`Trending API failed: ${trendingRes.status}`);
    }

    const trendingData = await trendingRes.json();
    console.log(`✅ Trending Endpoint Working`);
    console.log(`   Found ${trendingData.data.length} trending listings`);

    // Check if trending flag is set
    const hasTrendingFlag = trendingData.data.every((l: any) => l.isTrending === true);
    console.log(`   isTrending flag on all items: ${hasTrendingFlag ? '✅' : '❌'}\n`);

    // Summary
    console.log('📊 RESULTS:');
    console.log(`   Flash Deals Count: ${flashDealsData.data.length}`);
    console.log(`   All have isFlashDeal flag: ${allHaveFlashDealFlag ? '✅' : '❌'}`);
    console.log(`   All have badge data: ${allHaveBadgeData ? '✅' : '❌'}`);
    console.log(`   Trending Count: ${trendingData.data.length}`);
    console.log(`   All have isTrending flag: ${hasTrendingFlag ? '✅' : '❌'}`);

    if (allHaveFlashDealFlag && allHaveBadgeData && hasTrendingFlag) {
      console.log('\n✅ All tests passed! Badges should display correctly.');
    } else {
      console.log('\n⚠️  Some issues detected. Check the output above.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test
testFlashDealsAPI()
  .then(() => {
    console.log('\n✨ Test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
