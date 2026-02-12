import { db, listing, seller } from '@DeshGhuri/db';
import { eq } from 'drizzle-orm';

async function checkListings() {
  const sellerEmail = 'shadmanyaser959@gmail.com';
  const sellerId = 'seller_ros6sfmwglljzw8o';

  console.log('🔍 Checking seller and listings for:', sellerEmail);

  try {
    // Get seller record
    const sellerRecord = await db
      .select()
      .from(seller)
      .where(eq(seller.email, sellerEmail))
      .limit(1);

    if (sellerRecord.length > 0) {
      console.log('\n✅ Seller found:');
      console.log('   Seller ID:', sellerRecord[0].id);
      console.log('   Business Name:', sellerRecord[0].businessName);
      console.log('   Email:', sellerRecord[0].email);
      console.log('   User ID:', sellerRecord[0].userId);
    } else {
      console.log('\n❌ No seller found with email:', sellerEmail);
    }

    // Get listings for this seller ID (from auth)
    const listingsFromAuth = await db
      .select()
      .from(listing)
      .where(eq(listing.sellerId, sellerId))
      .limit(5);

    console.log(
      '\n📦 Listings with seller ID from auth (',
      sellerId,
      '):',
      listingsFromAuth.length
    );
    if (listingsFromAuth.length > 0) {
      listingsFromAuth.forEach((l, i) => {
        console.log(`${i + 1}. ${l.title} - Seller ID: ${l.sellerId}`);
      });
    }

    // Get listings by userId if seller record exists
    if (sellerRecord.length > 0 && sellerRecord[0].userId) {
      const listingsByUserId = await db
        .select()
        .from(listing)
        .where(eq(listing.sellerId, sellerRecord[0].userId))
        .limit(5);

      console.log(
        '\n📦 Listings with seller.userId (',
        sellerRecord[0].userId,
        '):',
        listingsByUserId.length
      );
      if (listingsByUserId.length > 0) {
        listingsByUserId.forEach((l, i) => {
          console.log(`${i + 1}. ${l.title} - Seller ID: ${l.sellerId}`);
        });
      }
    }

    // Check all listings to see what seller IDs exist
    const allListings = await db
      .select({
        id: listing.id,
        title: listing.title,
        sellerId: listing.sellerId,
      })
      .from(listing)
      .limit(10);

    console.log('\n📊 Sample of all listings (first 10):');
    allListings.forEach((l, i) => {
      console.log(`${i + 1}. ${l.title}`);
      console.log(`   Listing ID: ${l.id}`);
      console.log(`   Seller ID: ${l.sellerId}`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

checkListings();
