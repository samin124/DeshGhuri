import { db, booking, listing, user } from '@DeshGhuri/db';
import { eq } from 'drizzle-orm';

async function checkBookings() {
  const sellerId = 'seller_ros6sfmwglljzw8o';

  console.log('🔍 Checking bookings for seller:', sellerId);

  try {
    // Get all bookings for this seller
    const bookings = await db
      .select({
        booking: booking,
        listing: {
          id: listing.id,
          title: listing.title,
          sellerId: listing.sellerId,
        },
        customer: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(booking)
      .leftJoin(listing, eq(booking.listingId, listing.id))
      .leftJoin(user, eq(booking.customerId, user.id))
      .where(eq(booking.sellerId, sellerId));

    console.log('\n📊 Total bookings found:', bookings.length);

    if (bookings.length > 0) {
      console.log('\n📦 Booking details:');
      bookings.forEach((item, index) => {
        console.log(`\n${index + 1}. Booking ID: ${item.booking.id}`);
        console.log(`   Listing: ${item.listing?.title} (${item.listing?.id})`);
        console.log(`   Listing Seller ID: ${item.listing?.sellerId}`);
        console.log(`   Booking Seller ID: ${item.booking.sellerId}`);
        console.log(`   Customer: ${item.customer?.name} (${item.customer?.email})`);
        console.log(`   Status: ${item.booking.status}`);
        console.log(`   Approval Status: ${item.booking.approvalStatus}`);
        console.log(`   Total Amount: ${item.booking.totalAmount}`);
        console.log(`   Created At: ${item.booking.createdAt}`);
      });
    } else {
      console.log('\n⚠️ No bookings found for this seller');
      console.log('   Checking all bookings in database...');

      const allBookings = await db.select().from(booking).limit(5);
      console.log(`\n📊 Sample of all bookings (first 5):`);
      allBookings.forEach((b, i) => {
        console.log(`\n${i + 1}. Booking ID: ${b.id}`);
        console.log(`   Seller ID: ${b.sellerId}`);
        console.log(`   Customer ID: ${b.customerId}`);
        console.log(`   Listing ID: ${b.listingId}`);
        console.log(`   Approval Status: ${b.approvalStatus}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

checkBookings();
