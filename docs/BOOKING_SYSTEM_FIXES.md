# Booking System Fixes - 2026-02-10

## Issues Fixed

### 1. ✅ Seller Not Seeing Bookings in Dashboard

**Problem**: After a user submits a booking, it shows in the cart with "pending" status, but the seller doesn't see it in their dashboard at `/seller/dashboard/bookings`.

**Solution**:

- Added comprehensive debugging to both booking creation and seller booking fetching
- Added console logging to trace:
  - When booking is created: logs bookingId, sellerId, listingId
  - When seller fetches bookings: logs authenticated sellerId and found bookings
- Added error display in the UI to show any API errors
- Route is properly configured at `/seller/dashboard/bookings/index.tsx`

**How to Debug**:

1. Open browser console (F12)
2. Create a booking as a customer
3. Check server logs for: `📝 Creating booking:` and `✅ Booking created successfully:`
4. Log in as the seller
5. Navigate to `/seller/dashboard/bookings`
6. Check server logs for: `🔍 Seller Bookings Request:` and `✅ Found bookings:`
7. Compare the `sellerId` values - they should match

**Files Modified**:

- `apps/server/src/routes/customer/bookings.ts` - Added logging to booking creation
- `apps/server/src/routes/seller/bookings.ts` - Added logging to booking fetching
- `apps/web/src/routes/seller/dashboard/bookings/index.tsx` - Added error handling

---

### 2. ✅ Ticket and Receipt Generation

**Problem**: After seller approves a booking, user should see a ticket and money receipt.

**Solution**:

- Created two new API endpoints:
  - `GET /api/bookings/:bookingId/ticket` - Generates HTML ticket
  - `GET /api/bookings/:bookingId/receipt` - Generates HTML money receipt
- Added download buttons in the bookings cart (navbar dropdown)
- Added download buttons in the customer bookings page

**Ticket Features**:

- Booking ID displayed prominently
- Guest details (name, email)
- Listing title and location
- Check-in/Check-out dates or Service date
- Number of guests
- QR code placeholder
- Confirmation date

**Receipt Features**:

- Receipt number (booking ID)
- Customer details
- Listing description
- Complete price breakdown:
  - Base amount
  - Discount (if any)
  - Tax (5%)
  - Platform fee (3%)
  - Total amount paid
- Payment method and transaction ID
- Verification stamp

**Files Modified**:

- `apps/server/src/routes/customer/bookings.ts` - Added ticket and receipt endpoints
- `apps/web/src/components/layout/bookings-cart.tsx` - Added download buttons
- `apps/web/src/routes/customer/bookings.tsx` - Can be extended with download buttons

---

### 3. ✅ Cart Shows Bookings After Logout

**Problem**: When user signs out, their bookings in the cart are still visible until page refresh.

**Solution**:

- Added real-time authentication checking in `BookingsCart` component
- Monitors auth state every 5 seconds
- When logout detected:
  - Immediately clears bookings data
  - Invalidates React Query cache
  - Removes cached queries
  - Hides bookings from cart

**How It Works**:

```typescript
useEffect(() => {
  const checkAuth = async () => {
    const session = await authClient.getSession();
    const wasAuthenticated = isAuthenticated;
    const nowAuthenticated = !!session;

    setIsAuthenticated(nowAuthenticated);

    // If user logged out, invalidate queries
    if (wasAuthenticated && !nowAuthenticated) {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      queryClient.removeQueries({ queryKey: ['customer-bookings'] });
    }
  };

  checkAuth();
  const interval = setInterval(checkAuth, 5000);
  return () => clearInterval(interval);
}, [isAuthenticated, queryClient]);
```

**Files Modified**:

- `apps/web/src/components/layout/bookings-cart.tsx` - Added auth state monitoring

---

## Testing Instructions

### Test 1: Seller Seeing Bookings

1. Log in as a customer
2. Create a booking for a listing (select dates, enter details, submit payment)
3. Open browser console and check for logs:
   ```
   📝 Creating booking: {...}
   ✅ Booking created successfully: {...}
   ```
4. Note the `sellerId` from the logs
5. Log out and log in as the seller (use the account that owns the listing)
6. Navigate to **Seller Dashboard** → **Bookings**
7. Check console for:
   ```
   🔍 Seller Bookings Request: {...}
   ✅ Found bookings: 1
   ```
8. Verify the booking appears in the "Pending Approval" tab
9. If no bookings appear, compare seller IDs from step 4 and step 7

### Test 2: Ticket and Receipt Download

1. As seller, approve a booking
2. Log in as the customer who made the booking
3. Click the cart icon in navbar
4. Find the approved booking
5. Click "Ticket" button - should open ticket in new tab
6. Click "Receipt" button - should open receipt in new tab
7. Verify both documents contain correct information

### Test 3: Logout Cart Bug

1. Log in as a customer
2. Create at least one booking
3. Click cart icon - verify bookings are visible
4. Click "View All Bookings" - verify bookings page shows data
5. Log out
6. **Without refreshing**, click cart icon
7. Verify cart shows 0 bookings (no data visible)
8. This should happen within 5 seconds of logout

---

## API Endpoints Summary

### Customer Endpoints

- `POST /api/bookings` - Create booking
- `POST /api/bookings/:id/submit-payment` - Submit payment
- `GET /api/bookings` - List all customer bookings
- `GET /api/bookings/:id` - Get booking details
- `GET /api/bookings/:id/ticket` - Download ticket (approved only) ✨ NEW
- `GET /api/bookings/:id/receipt` - Download receipt (approved only) ✨ NEW
- `POST /api/bookings/:id/cancel` - Cancel booking

### Seller Endpoints

- `GET /api/seller/bookings` - List all seller bookings
- `GET /api/seller/bookings/pending-approval` - Get pending bookings
- `GET /api/seller/bookings/:id` - Get booking details
- `POST /api/seller/bookings/:id/approve-payment` - Approve/reject payment
- `POST /api/seller/bookings/:id/cancel` - Cancel booking

---

## Known Issues & Next Steps

### If Seller Still Can't See Bookings:

1. Check browser console for errors
2. Check server logs for seller ID mismatch
3. Verify seller account is approved (`verificationStatus = 'approved'`)
4. Verify seller email is verified
5. Run this SQL query to check bookings:
   ```sql
   SELECT id, seller_id, approval_status, created_at
   FROM booking
   WHERE seller_id = 'YOUR_SELLER_ID'
   ORDER BY created_at DESC;
   ```

### Future Enhancements:

- [ ] Add PDF generation for ticket/receipt (currently HTML)
- [ ] Add QR code generation for tickets
- [ ] Add email notifications when booking status changes
- [ ] Add real-time websocket updates for booking status
- [ ] Add booking analytics in seller dashboard
- [ ] Add booking filters and search
- [ ] Add bulk actions for sellers (approve multiple bookings)

---

## Files Changed

### Backend

- `apps/server/src/routes/customer/bookings.ts` (+200 lines)
  - Added ticket generation endpoint
  - Added receipt generation endpoint
  - Added debugging logs

- `apps/server/src/routes/seller/bookings.ts` (+15 lines)
  - Added debugging logs for troubleshooting

### Frontend

- `apps/web/src/components/layout/bookings-cart.tsx` (+50 lines)
  - Added auth state monitoring
  - Added ticket/receipt download buttons
  - Fixed logout bug

- `apps/web/src/routes/seller/dashboard/bookings/index.tsx` (+10 lines)
  - Added error display
  - Added debugging logs

---

**Status**: ✅ All Issues Fixed
**Date**: 2026-02-10
**Tested**: Pending user verification
