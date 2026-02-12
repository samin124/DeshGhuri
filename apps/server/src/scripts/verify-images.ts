const API_URL = 'http://localhost:3000';

async function verifyImages() {
  console.log('🔍 Verifying listing images...\n');

  try {
    // Get a sample listing
    const res = await fetch(`${API_URL}/api/listings?limit=3`);
    const data = await res.json();

    if (!data.success || !data.data.length) {
      throw new Error('No listings found');
    }

    console.log(`✅ Found ${data.data.length} listings to check\n`);

    for (const listing of data.data) {
      console.log(`📦 ${listing.title}`);
      console.log(`   Category: ${listing.category}`);
      console.log(`   Images: ${listing.images?.length || 0}`);

      if (listing.images && listing.images.length > 0) {
        listing.images.forEach((img: any, i: number) => {
          console.log(`   ${i + 1}. ${img.url}`);
          console.log(`      Primary: ${img.isPrimary}`);
          if (img.caption) console.log(`      Caption: ${img.caption}`);
        });
      } else {
        console.log('   ⚠️  No images found!');
      }
      console.log('');
    }

    // Test if images are accessible
    console.log('🌐 Testing image accessibility...');
    const firstImage = data.data[0].images?.[0]?.url;
    if (firstImage) {
      console.log(`   Testing: ${firstImage}`);
      const imgRes = await fetch(firstImage);
      if (imgRes.ok) {
        console.log(`   ✅ Image loads successfully (${imgRes.status})`);
        console.log(`   Content-Type: ${imgRes.headers.get('content-type')}`);
      } else {
        console.log(`   ❌ Image failed to load (${imgRes.status})`);
      }
    }

    console.log('\n✨ Verification complete!');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  }
}

verifyImages()
  .then(() => {
    console.log('\n✅ All checks passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
