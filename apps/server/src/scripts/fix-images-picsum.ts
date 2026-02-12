import { db, listing } from '@DeshGhuri/db';
import { eq } from 'drizzle-orm';

/**
 * Fix listing images using Picsum Photos - a reliable Lorem Picsum service
 * Provides consistent, high-quality placeholder images
 */

function getPicsumImageUrl(width: number, height: number, id: number): string {
  // Picsum Photos API - always returns valid images
  return `https://picsum.photos/id/${id}/${width}/${height}`;
}

async function fixImagesWithPicsum() {
  console.log('🖼️  Fixing listing images with Picsum Photos...\n');

  try {
    // Get all listings
    const allListings = await db.select().from(listing);
    console.log(`📦 Found ${allListings.length} listings to update\n`);

    let updated = 0;

    for (const item of allListings) {
      // Generate consistent image IDs based on listing ID
      // Picsum has IDs from 0 to 1000+
      const hash = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const imageId1 = (hash % 900) + 1; // 1-900
      const imageId2 = ((hash * 2) % 900) + 1;
      const imageId3 = ((hash * 3) % 900) + 1;

      const newImages = [
        {
          url: getPicsumImageUrl(800, 600, imageId1),
          storageKey: `listing-${item.id}-1.jpg`,
          isPrimary: true,
          caption: `${item.title} - Main Image`,
        },
        {
          url: getPicsumImageUrl(800, 600, imageId2),
          storageKey: `listing-${item.id}-2.jpg`,
          isPrimary: false,
          caption: `${item.title} - Gallery Image 2`,
        },
        {
          url: getPicsumImageUrl(800, 600, imageId3),
          storageKey: `listing-${item.id}-3.jpg`,
          isPrimary: false,
          caption: `${item.title} - Gallery Image 3`,
        },
      ];

      await db.update(listing).set({ images: newImages }).where(eq(listing.id, item.id));

      updated++;

      if (updated % 50 === 0) {
        console.log(`  ✓ Updated ${updated}/${allListings.length} listings...`);
      }
    }

    console.log(`\n✅ Successfully updated ${updated} listings with Picsum images!\n`);

    // Show sample URLs
    console.log('📸 Sample Image URLs:');
    const sampleListing = allListings[0];
    const hash = sampleListing.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageId1 = (hash % 900) + 1;
    console.log(`  ${sampleListing.title}`);
    console.log(`  Category: ${sampleListing.category}`);
    console.log(`  Image 1: https://picsum.photos/id/${imageId1}/800/600`);
    console.log(`  Image 2: https://picsum.photos/id/${((hash * 2) % 900) + 1}/800/600`);
    console.log(`  Image 3: https://picsum.photos/id/${((hash * 3) % 900) + 1}/800/600\n`);

    console.log('✨ Picsum Photos provides high-quality, consistent placeholder images.');
    console.log('   Each listing will have 3 different images that load reliably.');
  } catch (error) {
    console.error('❌ Error fixing images:', error);
    throw error;
  }
}

fixImagesWithPicsum()
  .then(() => {
    console.log('\n✅ Image fix complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
