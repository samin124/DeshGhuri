import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db, booking, listing, user } from '@DeshGhuri/db';
import { eq, and, desc, or } from 'drizzle-orm';
import { requireSeller } from '@/middleware/seller-auth';
import { HTTPException } from 'hono/http-exception';
import { getReservedPackageCountForListing } from '@/lib/listing-inventory';

const app = new Hono();

// Apply seller authentication to ALL routes
app.use('*', requireSeller);

// Validation schemas
const approvalSchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
});

/**
 * GET /api/seller/bookings
 * Get all bookings for the authenticated seller
 * Query params:
 * - status: Filter by booking status
 * - approvalStatus: Filter by approval status (pending, approved, rejected)
 */
app.get('/', async (c) => {
  const sellerId = c.get('sellerId') as string;
  const statusFilter = c.req.query('status');
  const approvalStatusFilter = c.req.query('approvalStatus');

  console.log('🔍 Seller Bookings Request:', {
    sellerId,
    statusFilter,
    approvalStatusFilter,
  });

  try {
    // Build WHERE conditions
    const conditions = [eq(booking.sellerId, sellerId)];

    if (statusFilter) {
      conditions.push(eq(booking.status, statusFilter));
    }

    if (approvalStatusFilter) {
      conditions.push(eq(booking.approvalStatus, approvalStatusFilter));
    }

    const bookings = await db
      .select({
        booking: booking,
        listing: {
          id: listing.id,
          title: listing.title,
          category: listing.category,
          images: listing.images,
          location: listing.location,
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
      .where(and(...conditions))
      .orderBy(desc(booking.createdAt));

    console.log('✅ Found bookings:', bookings.length);
    console.log(
      '📦 Bookings data:',
      bookings.map((b) => ({
        id: b.booking.id,
        listingId: b.booking.listingId,
        sellerId: b.booking.sellerId,
        approvalStatus: b.booking.approvalStatus,
      }))
    );

    return c.json({
      success: true,
      data: bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error('❌ Error fetching seller bookings:', error);
    throw new HTTPException(500, { message: 'Failed to fetch bookings' });
  }
});

/**
 * GET /api/seller/bookings/pending-approval
 * Get all bookings pending seller approval
 */
app.get('/pending-approval', async (c) => {
  const sellerId = c.get('sellerId') as string;

  try {
    const pendingBookings = await db
      .select({
        booking: booking,
        listing: {
          id: listing.id,
          title: listing.title,
          category: listing.category,
          images: listing.images,
          location: listing.location,
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
      .where(
        and(
          eq(booking.sellerId, sellerId),
          eq(booking.approvalStatus, 'pending'),
          or(eq(booking.status, 'hold'), eq(booking.paymentStatus, 'pending'))
        )
      )
      .orderBy(desc(booking.createdAt));

    return c.json({
      success: true,
      data: pendingBookings,
      count: pendingBookings.length,
    });
  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    throw new HTTPException(500, { message: 'Failed to fetch pending bookings' });
  }
});

/**
 * GET /api/seller/bookings/:bookingId
 * Get a specific booking (with ownership check)
 */
app.get('/:bookingId', async (c) => {
  const sellerId = c.get('sellerId') as string;
  const { bookingId } = c.req.param();

  try {
    const [bookingData] = await db
      .select({
        booking: booking,
        listing: listing,
        customer: user,
      })
      .from(booking)
      .leftJoin(listing, eq(booking.listingId, listing.id))
      .leftJoin(user, eq(booking.customerId, user.id))
      .where(and(eq(booking.id, bookingId), eq(booking.sellerId, sellerId)))
      .limit(1);

    if (!bookingData) {
      throw new HTTPException(404, {
        message: "Booking not found or you don't have permission to access it",
      });
    }

    return c.json({
      success: true,
      data: bookingData,
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Error fetching booking:', error);
    throw new HTTPException(500, { message: 'Failed to fetch booking' });
  }
});

/**
 * POST /api/seller/bookings/:bookingId/approve-payment
 * Approve or reject a booking payment
 */
app.post('/:bookingId/approve-payment', zValidator('json', approvalSchema), async (c) => {
  const sellerId = c.get('sellerId') as string;
  const { bookingId } = c.req.param();
  const { action, rejectionReason } = c.req.valid('json');

  try {
    // Get booking and verify ownership
    const [bookingData] = await db
      .select()
      .from(booking)
      .where(and(eq(booking.id, bookingId), eq(booking.sellerId, sellerId)))
      .limit(1);

    if (!bookingData) {
      throw new HTTPException(404, {
        message: "Booking not found or you don't have permission to access it",
      });
    }

    // Check if booking is pending approval
    if (bookingData.approvalStatus !== 'pending') {
      throw new HTTPException(400, {
        message: 'Booking is not pending approval',
      });
    }

    // Check if booking is still in hold status
    if (bookingData.status !== 'hold') {
      throw new HTTPException(400, {
        message: 'Booking is not in hold status',
      });
    }

    // Expire unpaid holds that have timed out
    if (
      bookingData.paymentMethod === null &&
      bookingData.holdExpiresAt &&
      new Date(bookingData.holdExpiresAt) < new Date()
    ) {
      await db
        .update(booking)
        .set({
          approvalStatus: 'rejected',
          status: 'expired',
          rejectionReason: 'Booking hold expired before seller approval',
        })
        .where(eq(booking.id, bookingId));

      throw new HTTPException(400, {
        message: 'Booking hold has expired and inventory has been released.',
      });
    }

    if (action === 'approve') {
      // Ensure approving this booking will not exceed listing capacity
      const [listingData] = await db
        .select({
          id: listing.id,
          title: listing.title,
          capacity: listing.capacity,
        })
        .from(listing)
        .where(eq(listing.id, bookingData.listingId))
        .limit(1);

      if (!listingData) {
        throw new HTTPException(404, {
          message: 'Listing not found for this booking',
        });
      }

      const bookedPackagesExcludingCurrent = await getReservedPackageCountForListing(
        bookingData.listingId,
        { excludeBookingId: bookingId }
      );

      if (bookedPackagesExcludingCurrent >= listingData.capacity) {
        throw new HTTPException(400, {
          message: 'Booking closed. This package has no remaining availability.',
        });
      }

      // Approve the booking
      const [updatedBooking] = await db
        .update(booking)
        .set({
          approvalStatus: 'approved',
          approvedAt: new Date(),
          approvedBy: sellerId,
          status: 'confirmed', // Move to confirmed status
          paymentStatus: 'completed', // Mark payment as completed
          paidAt: new Date(),
        })
        .where(eq(booking.id, bookingId))
        .returning();

      return c.json({
        success: true,
        data: updatedBooking,
        message: 'Booking approved successfully. Customer has been notified.',
      });
    } else {
      // Reject the booking
      if (!rejectionReason) {
        throw new HTTPException(400, {
          message: 'Rejection reason is required',
        });
      }

      const [updatedBooking] = await db
        .update(booking)
        .set({
          approvalStatus: 'rejected',
          rejectionReason,
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledBy: sellerId,
          cancellationReason: `Payment rejected by seller: ${rejectionReason}`,
        })
        .where(eq(booking.id, bookingId))
        .returning();

      return c.json({
        success: true,
        data: updatedBooking,
        message: 'Booking rejected. Customer has been notified.',
      });
    }
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Error processing booking approval:', error);
    throw new HTTPException(500, { message: 'Failed to process approval' });
  }
});

/**
 * POST /api/seller/bookings/:bookingId/cancel
 * Cancel a booking (seller-initiated)
 */
app.post('/:bookingId/cancel', async (c) => {
  const sellerId = c.get('sellerId') as string;
  const { bookingId } = c.req.param();

  try {
    const body = await c.req.json();
    const { reason } = body;

    if (!reason) {
      throw new HTTPException(400, {
        message: 'Cancellation reason is required',
      });
    }

    // Get booking and verify ownership
    const [bookingData] = await db
      .select()
      .from(booking)
      .where(and(eq(booking.id, bookingId), eq(booking.sellerId, sellerId)))
      .limit(1);

    if (!bookingData) {
      throw new HTTPException(404, {
        message: "Booking not found or you don't have permission to access it",
      });
    }

    // Check if booking can be cancelled
    if (['cancelled', 'completed', 'refunded'].includes(bookingData.status)) {
      throw new HTTPException(400, {
        message: `Cannot cancel booking with status: ${bookingData.status}`,
      });
    }

    // Cancel booking
    const [cancelledBooking] = await db
      .update(booking)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: sellerId,
        cancellationReason: `Seller cancellation: ${reason}`,
      })
      .where(eq(booking.id, bookingId))
      .returning();

    return c.json({
      success: true,
      data: cancelledBooking,
      message: 'Booking cancelled successfully. Customer will be refunded.',
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Error cancelling booking:', error);
    throw new HTTPException(500, { message: 'Failed to cancel booking' });
  }
});

export default app;
