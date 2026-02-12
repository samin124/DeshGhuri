import { db, booking, listing } from '@DeshGhuri/db';
import { eq } from 'drizzle-orm';

async function checkBookingListings() {
  const bookingIds = ['DG-20260210-KLDP5', 'DG-20260210-WRQCC', 'DG-20260210-W-JGZ'];

  console.log('🔍 Checking listings for bookings...\n');

  try {
    for (const bookingId of bookingIds) {
      const result = await db
        .select({
          booking: booking,
          listing: listing,
        })
        .from(booking)
        .leftJoin(listing, eq(booking.listingId, listing.id))
        .where(eq(booking.id, bookingId))
        .limit(1);

      if (result.length > 0) {
        const { booking: b, listing: l } = result[0];
        console.log(`📦 Booking: ${b.id}`);
        console.log(`   Booking Seller ID: ${b.sellerId}`);
        console.log(`   Listing: ${l?.title || 'N/A'} (${b.listingId})`);
        console.log(`   Listing Seller ID: ${l?.sellerId || 'N/A'}`);
        console.log(`   Customer ID: ${b.customerId}`);
        console.log(`   Status: ${b.status} / ${b.approvalStatus}`);
        console.log('');
      }
    }

    // Check if seller_ros6sfmwglljzw8o has any bookings
    console.log('\n🔍 Checking for bookings with seller_ros6sfmwglljzw8o...');
    const sellerBookings = await db
      .select()
      .from(booking)
      .where(eq(booking.sellerId, 'seller_ros6sfmwglljzw8o'));

    console.log(`Found ${sellerBookings.length} bookings for seller_ros6sfmwglljzw8o`);
  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

checkBookingListings();
