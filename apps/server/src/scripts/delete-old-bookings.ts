import { db, booking } from '@DeshGhuri/db';
import { inArray } from 'drizzle-orm';

async function deleteOldBookings() {
  // Old booking IDs from other sellers that need to be removed
  const oldBookingIds = [
    'DG-20260210-KLDP5',  // Seller: cnOp2iyFaqS3AIQ5ohqis
    'DG-20260210-WRQCC',  // Seller: bHWYNrUy5N3MXEgwmq0nn
    'DG-20260210-W-JGZ'   // Seller: cnOp2iyFaqS3AIQ5ohqis
  ];

  console.log('🗑️  Deleting old bookings from other sellers...\n');

  try {
    const deletedBookings = await db
      .delete(booking)
      .where(inArray(booking.id, oldBookingIds))
      .returning();

    console.log('✅ Successfully deleted', deletedBookings.length, 'old bookings');

    deletedBookings.forEach((b, i) => {
      console.log(`${i + 1}. ${b.id} - Seller: ${b.sellerId}`);
    });

    console.log('\n✨ Cleanup complete!');
  } catch (error) {
    console.error('❌ Error deleting bookings:', error);
  }

  process.exit(0);
}

deleteOldBookings();
