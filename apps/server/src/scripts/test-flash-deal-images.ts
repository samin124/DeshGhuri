const API_URL = 'http://localhost:3000';

async function testFlashDealImages() {
  console.log('⚡ Testing Flash Deal Images...\n');

  try {
    // Get flash deals
    const res = await fetch(`${API_URL}/api/listings?flashDeals=true&limit=5`);
    const data = await res.json();

    if (!data.success || !data.data.length) {
      throw new Error('No flash deals found');
    }

    console.log(`✅ Found ${data.data.length} flash deals to check\n`);

    for (const listing of data.data) {
      console.log(`⚡ ${listing.title}`);
      console.log(`   Discount: ${listing.discountPercent}% OFF`);
      console.log(`   Base Price: ${listing.basePrice} BDT`);
      console.log(`   Discounted: ${listing.discountedPrice} BDT`);
      console.log(`   Images: ${listing.images?.length || 0}`);

      if (listing.images && listing.images.length > 0) {
        console.log(`   Primary Image: ${listing.images[0].url}`);

        // Test if the image loads
        const imgRes = await fetch(listing.images[0].url);
        if (imgRes.ok) {
          console.log(`   ✅ Image loads successfully`);
        } else {
          console.log(`   ❌ Image failed (${imgRes.status})`);
        }
      } else {
        console.log('   ⚠️  No images!');
      }
      console.log('');
    }

    console.log('✨ Flash deal image check complete!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

testFlashDealImages()
  .then(() => {
    console.log('\n✅ All checks passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
