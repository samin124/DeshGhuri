const API_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test 1: General listings
    console.log('1️⃣  Testing general listings endpoint...');
    const listingsRes = await fetch(`${API_URL}/api/listings?limit=10`);
    const listingsData = await listingsRes.json();

    console.log(`   ✅ Found ${listingsData.data.length} listings`);

    let flashCount = 0;
    let promoCount = 0;
    let discountCount = 0;

    listingsData.data.forEach((l: any) => {
      if (l.isFlashDeal) flashCount++;
      if (l.promoCode) promoCount++;
      if (l.discountPercent && !l.isFlashDeal) discountCount++;
    });

    console.log(`   ⚡ Flash Deals: ${flashCount}`);
    console.log(`   🏷️  Promo Codes: ${promoCount}`);
    console.log(`   💰 Regular Discounts: ${discountCount}\n`);

    // Test 2: Flash deals filter
    console.log('2️⃣  Testing flash deals filter...');
    const flashRes = await fetch(`${API_URL}/api/listings?flashDeals=true&limit=10`);
    const flashData = await flashRes.json();

    console.log(`   ✅ Found ${flashData.data.length} flash deals`);

    if (flashData.data.length > 0) {
      const sample = flashData.data[0];
      console.log(`   Sample: ${sample.title}`);
      console.log(`   Discount: ${sample.discountPercent}%`);
      console.log(`   Price: ${sample.basePrice} → ${sample.discountedPrice} BDT\n`);
    }

    // Test 3: Search by location
    console.log('3️⃣  Testing location filter...');
    const locationRes = await fetch(`${API_URL}/api/listings?location=Cox's Bazar&limit=5`);
    const locationData = await locationRes.json();

    console.log(`   ✅ Found ${locationData.data.length} listings in Cox's Bazar\n`);

    // Test 4: Trending listings
    console.log('4️⃣  Testing trending endpoint...');
    const trendingRes = await fetch(`${API_URL}/api/listings/trending`);
    const trendingData = await trendingRes.json();

    console.log(`   ✅ Found ${trendingData.data.length} trending listings\n`);

    // Test 5: Featured listings
    console.log('5️⃣  Testing featured endpoint...');
    const featuredRes = await fetch(`${API_URL}/api/listings/featured`);
    const featuredData = await featuredRes.json();

    console.log(`   ✅ Found ${featuredData.data.length} featured listings\n`);

    console.log('✨ All API tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

testAPI()
  .then(() => {
    console.log('\n✅ API testing complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
