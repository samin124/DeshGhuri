import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { nanoid } from 'nanoid';
import { db, booking, listing, seller } from '@DeshGhuri/db';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@DeshGhuri/auth';
import { HTTPException } from 'hono/http-exception';
import { generateTicketPDF, generateReceiptPDF } from '../../lib/pdf-generator';

const app = new Hono();

// Validation schemas
const createBookingSchema = z.object({
  listingId: z.string(),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  serviceDate: z.string().optional(),
  guestDetails: z.object({
    primaryGuest: z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string(),
    }),
    adults: z.number().int().min(1),
    children: z.number().int().min(0).default(0),
    totalGuests: z.number().int().min(1),
  }),
  specialRequests: z.string().optional(),
  priceLockEnabled: z.boolean().default(false),
  promoCode: z.string().optional(),
});

const submitPaymentSchema = z.object({
  bookingId: z.string(),
  paymentMethod: z.enum(['bkash', 'nagad', 'card', 'bank-transfer']),
  transactionId: z.string(),
  paymentDetails: z.object({
    accountNumber: z.string().optional(),
    accountHolderName: z.string().optional(),
    transactionDate: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});

// Middleware to require authentication
async function requireAuth(c: any, next: () => Promise<void>) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw new HTTPException(401, {
      message: 'Unauthorized: Please log in to make a booking',
    });
  }

  c.set('userId', session.user.id);
  c.set('userEmail', session.user.email);
  await next();
}

app.use('*', requireAuth);

// Helper function to generate booking ID
function generateBookingId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = nanoid(5).toUpperCase();
  return `DG-${dateStr}-${random}`;
}

// Helper function to calculate pricing
function calculatePricing(
  basePrice: string,
  guests: number,
  promoDiscount?: string
) {
  const base = parseFloat(basePrice) * guests;
  const discount = promoDiscount ? parseFloat(promoDiscount) : 0;
  const tax = base * 0.05; // 5% tax
  const platformFee = base * 0.03; // 3% platform fee
  const total = base - discount + tax + platformFee;

  return {
    baseAmount: base.toFixed(2),
    discountAmount: discount.toFixed(2),
    taxAmount: tax.toFixed(2),
    platformFee: platformFee.toFixed(2),
    totalAmount: total.toFixed(2),
  };
}

/**
 * POST /api/customer/bookings
 * Create a new booking (draft/hold state)
 */
app.post('/', zValidator('json', createBookingSchema), async (c) => {
  try {
    const userId = c.get('userId') as string;
    const data = c.req.valid('json');

    // Get listing details
    const [listingData] = await db
      .select()
      .from(listing)
      .where(eq(listing.id, data.listingId))
      .limit(1);

    if (!listingData) {
      throw new HTTPException(404, { message: 'Listing not found' });
    }

    // Check if listing is active
    if (listingData.status !== 'active') {
      throw new HTTPException(400, { message: 'Listing is not available' });
    }

    // Validate guest count
    if (data.guestDetails.totalGuests > listingData.maxGuests) {
      throw new HTTPException(400, {
        message: `Number of guests exceeds maximum capacity of ${listingData.maxGuests}`,
      });
    }

    // Validate promo code if provided
    let promoDiscount = '0';
    if (data.promoCode) {
      // Check if promo code matches listing's promo code
      if (
        listingData.promoCode === data.promoCode &&
        listingData.promoCodeExpiresAt &&
        new Date(listingData.promoCodeExpiresAt) > new Date() &&
        (listingData.promoCodeUsedCount || 0) < (listingData.promoCodeMaxUses || Infinity)
      ) {
        // Calculate discount based on promo code discount percentage
        const discountPercent = listingData.promoCodeDiscount || 0;
        const basePrice = parseFloat(listingData.basePrice);
        promoDiscount = ((basePrice * discountPercent) / 100).toFixed(2);
      } else {
        throw new HTTPException(400, { message: 'Invalid or expired promo code' });
      }
    }

    // Calculate pricing
    const pricing = calculatePricing(
      listingData.basePrice,
      data.guestDetails.totalGuests,
      promoDiscount
    );

    // Create booking with hold status
    const bookingId = generateBookingId();
    const holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('📝 Creating booking:', {
      bookingId,
      listingId: data.listingId,
      sellerId: listingData.sellerId,
      customerId: userId,
      listingTitle: listingData.title
    });

    const [newBooking] = await db
      .insert(booking)
      .values({
        id: bookingId,
        listingId: data.listingId,
        sellerId: listingData.sellerId,
        customerId: userId,
        bookingType: 'individual',
        guestDetails: data.guestDetails,
        checkInDate: data.checkInDate ? new Date(data.checkInDate) : null,
        checkOutDate: data.checkOutDate ? new Date(data.checkOutDate) : null,
        serviceDate: data.serviceDate ? new Date(data.serviceDate) : null,
        baseAmount: pricing.baseAmount,
        discountAmount: pricing.discountAmount,
        taxAmount: pricing.taxAmount,
        platformFee: pricing.platformFee,
        totalAmount: pricing.totalAmount,
        promoCode: data.promoCode || null,
        promoCodeDiscount: promoDiscount !== '0' ? promoDiscount : null,
        paymentStatus: 'pending',
        status: 'hold',
        holdExpiresAt,
        priceLockEnabled: data.priceLockEnabled,
        splitPaymentEnabled: false,
        specialRequests: data.specialRequests || null,
        approvalStatus: 'pending',
      })
      .returning();

    console.log('✅ Booking created successfully:', {
      bookingId: newBooking.id,
      sellerId: newBooking.sellerId,
      approvalStatus: newBooking.approvalStatus
    });

    return c.json({
      success: true,
      data: {
        booking: newBooking,
        listing: {
          id: listingData.id,
          title: listingData.title,
          category: listingData.category,
          images: listingData.images,
        },
      },
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Error creating booking:', error);
    throw new HTTPException(500, { message: 'Failed to create booking' });
  }
});

/**
 * POST /api/customer/bookings/:bookingId/submit-payment
 * Submit payment details for seller approval
 */
app.post(
  '/:bookingId/submit-payment',
  zValidator('json', submitPaymentSchema),
  async (c) => {
    try {
      const userId = c.get('userId') as string;
      const { bookingId } = c.req.param();
      const data = c.req.valid('json');

      // Verify booking ID matches
      if (data.bookingId !== bookingId) {
        throw new HTTPException(400, { message: 'Booking ID mismatch' });
      }

      // Get booking
      const [bookingData] = await db
        .select()
        .from(booking)
        .where(
          and(
            eq(booking.id, bookingId),
            eq(booking.customerId, userId)
          )
        )
        .limit(1);

      if (!bookingData) {
        throw new HTTPException(404, { message: 'Booking not found' });
      }

      // Check if booking is in hold status
      if (bookingData.status !== 'hold') {
        throw new HTTPException(400, { message: 'Booking is not in hold status' });
      }

      // Check if hold has expired
      if (bookingData.holdExpiresAt && new Date(bookingData.holdExpiresAt) < new Date()) {
        // Update booking to expired
        await db
          .update(booking)
          .set({ status: 'expired' })
          .where(eq(booking.id, bookingId));

        throw new HTTPException(400, { message: 'Booking hold has expired' });
      }

      // Update booking with payment details
      const [updatedBooking] = await db
        .update(booking)
        .set({
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId,
          paymentDetails: data.paymentDetails || null,
          paymentStatus: 'pending',
          approvalStatus: 'pending',
          status: 'hold', // Keep in hold until seller approves
        })
        .where(eq(booking.id, bookingId))
        .returning();

      return c.json({
        success: true,
        data: updatedBooking,
        message: 'Payment details submitted. Waiting for seller approval.',
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error('Error submitting payment:', error);
      throw new HTTPException(500, { message: 'Failed to submit payment' });
    }
  }
);

/**
 * GET /api/customer/bookings
 * Get all bookings for the logged-in customer
 */
app.get('/', async (c) => {
  try {
    const userId = c.get('userId') as string;

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
        seller: {
          id: seller.id,
          businessName: seller.businessName,
          contactEmail: seller.contactEmail,
          verificationStatus: seller.verificationStatus,
        },
      })
      .from(booking)
      .leftJoin(listing, eq(booking.listingId, listing.id))
      .leftJoin(seller, eq(booking.sellerId, seller.id))
      .where(eq(booking.customerId, userId))
      .orderBy(desc(booking.createdAt));

    return c.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw new HTTPException(500, { message: 'Failed to fetch bookings' });
  }
});

/**
 * GET /api/customer/bookings/:bookingId
 * Get booking details
 */
app.get('/:bookingId', async (c) => {
  try {
    const userId = c.get('userId') as string;
    const { bookingId } = c.req.param();

    const [bookingData] = await db
      .select({
        booking: booking,
        listing: listing,
        seller: seller,
      })
      .from(booking)
      .leftJoin(listing, eq(booking.listingId, listing.id))
      .leftJoin(seller, eq(booking.sellerId, seller.id))
      .where(
        and(
          eq(booking.id, bookingId),
          eq(booking.customerId, userId)
        )
      )
      .limit(1);

    if (!bookingData) {
      throw new HTTPException(404, { message: 'Booking not found' });
    }

    return c.json({ success: true, data: bookingData });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Error fetching booking:', error);
    throw new HTTPException(500, { message: 'Failed to fetch booking' });
  }
});

/**
 * POST /api/customer/bookings/:bookingId/cancel
 * Cancel a booking
 */
app.post('/:bookingId/cancel', async (c) => {
  try {
    const userId = c.get('userId') as string;
    const { bookingId } = c.req.param();

    // Get booking
    const [bookingData] = await db
      .select()
      .from(booking)
      .where(
        and(
          eq(booking.id, bookingId),
          eq(booking.customerId, userId)
        )
      )
      .limit(1);

    if (!bookingData) {
      throw new HTTPException(404, { message: 'Booking not found' });
    }

    // Only allow cancellation for draft, hold, or pending payment bookings
    if (!['draft', 'hold'].includes(bookingData.status)) {
      throw new HTTPException(400, {
        message: 'Booking cannot be cancelled at this stage'
      });
    }

    // Cancel booking
    const [cancelledBooking] = await db
      .update(booking)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: userId,
        cancellationReason: 'Cancelled by customer',
      })
      .where(eq(booking.id, bookingId))
      .returning();

    return c.json({
      success: true,
      data: cancelledBooking,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Error cancelling booking:', error);
    throw new HTTPException(500, { message: 'Failed to cancel booking' });
  }
});

/**
 * GET /api/customer/bookings/:bookingId/ticket
 * Generate and download booking ticket (PDF)
 */
app.get('/:bookingId/ticket', async (c) => {
  try {
    const userId = c.get('userId') as string;
    const { bookingId } = c.req.param();

    // Get booking with listing details
    const [bookingData] = await db
      .select({
        booking: booking,
        listing: listing,
      })
      .from(booking)
      .leftJoin(listing, eq(booking.listingId, listing.id))
      .where(
        and(
          eq(booking.id, bookingId),
          eq(booking.customerId, userId),
          eq(booking.approvalStatus, 'approved')
        )
      )
      .limit(1);

    if (!bookingData) {
      throw new HTTPException(404, { message: 'Approved booking not found' });
    }

    // Generate PDF ticket
    const pdfBuffer = await generateTicketPDF({
      bookingId: bookingData.booking.id,
      listingTitle: bookingData.listing?.title || 'N/A',
      listingLocation: bookingData.listing?.location || 'N/A',
      customerName: bookingData.booking.guestDetails?.primaryGuest?.name || 'N/A',
      customerEmail: bookingData.booking.guestDetails?.primaryGuest?.email || 'N/A',
      serviceDate: bookingData.booking.serviceDate || undefined,
      checkInDate: bookingData.booking.checkInDate || undefined,
      checkOutDate: bookingData.booking.checkOutDate || undefined,
      totalGuests: bookingData.booking.guestDetails?.totalGuests || 0,
      adults: bookingData.booking.guestDetails?.adults || 0,
      children: bookingData.booking.guestDetails?.children || 0,
      approvedAt: bookingData.booking.approvedAt!,
    });

    // Set headers for PDF download
    c.header('Content-Type', 'application/pdf');
    c.header('Content-Disposition', `attachment; filename="ticket-${bookingId}.pdf"`);
    c.header('Content-Length', pdfBuffer.length.toString());

    return c.body(pdfBuffer);
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Error generating ticket:', error);
    throw new HTTPException(500, { message: 'Failed to generate ticket' });
  }
});

/**
 * GET /api/customer/bookings/:bookingId/receipt
 * Generate and download money receipt (PDF)
 */
app.get('/:bookingId/receipt', async (c) => {
  try {
    const userId = c.get('userId') as string;
    const { bookingId } = c.req.param();

    // Get booking with listing details
    const [bookingData] = await db
      .select({
        booking: booking,
        listing: listing,
      })
      .from(booking)
      .leftJoin(listing, eq(booking.listingId, listing.id))
      .where(
        and(
          eq(booking.id, bookingId),
          eq(booking.customerId, userId),
          eq(booking.approvalStatus, 'approved')
        )
      )
      .limit(1);

    if (!bookingData) {
      throw new HTTPException(404, { message: 'Approved booking not found' });
    }

    // Generate PDF receipt
    const pdfBuffer = await generateReceiptPDF({
      bookingId: bookingData.booking.id,
      listingTitle: bookingData.listing?.title || 'N/A',
      customerName: bookingData.booking.guestDetails?.primaryGuest?.name || 'N/A',
      customerEmail: bookingData.booking.guestDetails?.primaryGuest?.email || 'N/A',
      baseAmount: bookingData.booking.baseAmount,
      tax: bookingData.booking.taxAmount,
      platformFee: bookingData.booking.platformFee,
      discount: bookingData.booking.discountAmount || '0',
      totalAmount: bookingData.booking.totalAmount,
      paymentMethod: bookingData.booking.paymentMethod || 'N/A',
      transactionId: bookingData.booking.transactionId || 'N/A',
      paidAt: bookingData.booking.approvedAt!,
      createdAt: bookingData.booking.createdAt,
    });

    // Set headers for PDF download
    c.header('Content-Type', 'application/pdf');
    c.header('Content-Disposition', `attachment; filename="receipt-${bookingId}.pdf"`);
    c.header('Content-Length', pdfBuffer.length.toString());

    return c.body(pdfBuffer);
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Error generating receipt:', error);
    throw new HTTPException(500, { message: 'Failed to generate receipt' });
  }
});

export default app;
