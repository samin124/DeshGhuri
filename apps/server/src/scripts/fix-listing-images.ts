import { db, listing } from '@DeshGhuri/db';
import { eq } from 'drizzle-orm';

/**
 * Fix listing images by updating to use proper Unsplash Source API URLs
 * that will always return valid images based on category
 */

// Category-specific Unsplash search terms for better image relevance
const CATEGORY_IMAGE_TERMS: Record<string, string[]> = {
  hotel: ['hotel', 'resort', 'luxury-hotel', 'hotel-room', 'boutique-hotel'],
  'tour-package': ['travel', 'tourism', 'vacation', 'adventure', 'landscape'],
  experience: ['adventure', 'activity', 'outdoor', 'experience', 'fun'],
  transport: ['car', 'bus', 'vehicle', 'transportation', 'travel-transport'],
};

function getUnsplashImageUrl(category: string, index: number, seed: string): string {
  const terms = CATEGORY_IMAGE_TERMS[category] || ['travel'];
  const term = terms[index % terms.length];
  // Using Unsplash Source API with seed for consistency
  return `https://source.unsplash.com/800x600/?${term}&sig=${seed}`;
}

async function fixImages() {
  console.log('🖼️  Fixing listing images...\n');

  try {
    // Get all listings
    const allListings = await db.select().from(listing);
    console.log(`📦 Found ${allListings.length} listings to update\n`);

    let updated = 0;

    for (const item of allListings) {
      const seed1 = item.id.slice(0, 8);
      const seed2 = item.id.slice(-8);

      const newImages = [
        {
          url: getUnsplashImageUrl(item.category, 0, seed1),
          storageKey: `listing-${item.id}-1.jpg`,
          isPrimary: true,
          caption: `${item.title} - Main Image`,
        },
        {
          url: getUnsplashImageUrl(item.category, 1, seed2),
          storageKey: `listing-${item.id}-2.jpg`,
          isPrimary: false,
          caption: `${item.title} - Gallery`,
        },
        {
          url: getUnsplashImageUrl(item.category, 2, seed1 + seed2),
          storageKey: `listing-${item.id}-3.jpg`,
          isPrimary: false,
          caption: `${item.title} - Gallery`,
        },
      ];

      await db.update(listing).set({ images: newImages }).where(eq(listing.id, item.id));

      updated++;

      if (updated % 50 === 0) {
        console.log(`  ✓ Updated ${updated}/${allListings.length} listings...`);
      }
    }

    console.log(`\n✅ Successfully updated ${updated} listings with working images!\n`);

    // Show sample URLs
    console.log('📸 Sample Image URLs:');
    const sampleListing = allListings[0];
    const sampleImages = [
      {
        url: getUnsplashImageUrl(sampleListing.category, 0, sampleListing.id.slice(0, 8)),
        storageKey: `listing-${sampleListing.id}-1.jpg`,
        isPrimary: true,
        caption: `${sampleListing.title} - Main Image`,
      },
    ];
    console.log(`  ${sampleListing.title}`);
    console.log(`  Category: ${sampleListing.category}`);
    console.log(`  Image URL: ${sampleImages[0].url}\n`);

    console.log('💡 Note: Unsplash Source API URLs will load different images on each request.');
    console.log('   This is normal and provides variety. Images are fetched from Unsplash.');
  } catch (error) {
    console.error('❌ Error fixing images:', error);
    throw error;
  }
}

fixImages()
  .then(() => {
    console.log('\n✨ Image fix complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
