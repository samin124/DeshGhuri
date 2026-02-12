# Seller Dashboard Quick Start Guide

## What Was Implemented

Epic 13: Seller Dashboard & Analytics is now fully functional! This includes:

✅ **6 Dashboard Pages** - Overview, Bookings, Earnings, Payouts, Analytics, Reviews
✅ **7 API Endpoints** - All with authentication and filtering
✅ **9 Database Tables** - Listings, bookings, reviews, escrow, payouts, analytics
✅ **Complete Type Safety** - TypeScript types throughout
✅ **Responsive UI** - Works on mobile, tablet, desktop

## Quick Start

### 1. Database Setup

The schema has already been pushed. Verify it worked:

```bash
cd packages/db
bun run db:studio
```

Check that these tables exist:

- `listing`, `booking`, `review`
- `escrow_transaction`, `proof_of_completion`, `payout`
- `listing_analytics`, `seller_analytics`

### 2. Start the Backend Server

```bash
cd apps/server
bun run dev
```

Server runs on `http://localhost:3000`

### 3. Start the Frontend

```bash
cd apps/web
bun run dev
```

App runs on `http://localhost:5173`

### 4. Access the Dashboard

Navigate to:

```
http://localhost:5173/seller/dashboard
```

**Note**: You need to be logged in as a user with an approved seller account.

## Creating a Test Seller

If you don't have a seller account yet:

1. Register a new user account
2. Navigate to `/seller/register`
3. Complete the onboarding process
4. Use the admin panel to approve the seller
5. Access `/seller/dashboard`

Or use the database directly:

```sql
-- Create seller
INSERT INTO seller (id, user_id, business_name, category, registration_number, address, contact_phone, contact_email, verification_status)
VALUES ('seller-1', 'your-user-id', 'Test Travel Agency', 'agency', 'REG123', '{"street":"123 Main St","city":"Dhaka","district":"Dhaka"}', '+8801712345678', 'seller@example.com', 'approved');

-- Assign seller role
INSERT INTO user_role (id, user_id, role)
VALUES ('role-1', 'your-user-id', 'seller');
```

## Dashboard Features

### Overview (`/seller/dashboard`)

- Today's bookings, revenue, views
- Pending actions (proofs, reviews, upcoming bookings)
- Overall statistics
- Earnings breakdown

### Bookings (`/seller/dashboard/bookings`)

- Filter by status
- Search by ID, listing, customer
- View detailed booking info
- Pagination

### Earnings (`/seller/dashboard/earnings`)

- Pending, released, withdrawn earnings
- Transaction list with escrow status
- Service dates and proof status

### Payouts (`/seller/dashboard/payouts`)

- Payout history
- Bank account info
- Status tracking
- Transaction references

### Analytics (`/seller/dashboard/analytics`)

- Period selection (today/week/month/year)
- Revenue & bookings trend chart
- Views trend chart
- Top performing listings
- Conversion rate

### Reviews (`/seller/dashboard/reviews`)

- All customer reviews
- Filter by response status and rating
- Respond to reviews
- Rating distribution

## API Endpoints

All endpoints require seller authentication.

```
GET  /api/seller/dashboard/stats
GET  /api/seller/dashboard/bookings?status=confirmed&page=1&limit=10
GET  /api/seller/dashboard/earnings?startDate=2024-01-01
GET  /api/seller/dashboard/payouts?page=1&limit=10
GET  /api/seller/dashboard/reviews?hasResponse=false
POST /api/seller/dashboard/reviews/:reviewId/respond
GET  /api/seller/dashboard/analytics?period=month
```

## Testing the Dashboard

### With Mock Data

For development, you can add mock data to the database:

```sql
-- Create a test listing
INSERT INTO listing (id, seller_id, title, slug, description, category, location, base_price, currency, price_unit, capacity, max_guests, images, status, created_at)
VALUES (
  'listing-1',
  'seller-1',
  'Cox''s Bazar Beach Resort',
  'coxs-bazar-beach-resort',
  'Beautiful beach resort with ocean views',
  'hotel',
  '{"city":"Cox''s Bazar","district":"Cox''s Bazar","address":"Beach Road"}',
  5000.00,
  'BDT',
  'per-night',
  20,
  4,
  '[{"url":"https://example.com/image.jpg","storageKey":"key","isPrimary":true}]',
  'active',
  NOW()
);

-- Create a test booking
INSERT INTO booking (id, listing_id, seller_id, customer_id, booking_type, guest_details, service_date, base_amount, total_amount, payment_status, status, created_at)
VALUES (
  'DG-20240101-00001',
  'listing-1',
  'seller-1',
  'customer-user-id',
  'individual',
  '{"primaryGuest":{"name":"John Doe","email":"john@example.com","phone":"+8801712345678"},"adults":2,"children":0,"totalGuests":2}',
  NOW() + INTERVAL '7 days',
  5000.00,
  5500.00,
  'completed',
  'confirmed',
  NOW()
);
```

### Without Mock Data

The dashboard handles empty states gracefully:

- Shows "No data yet" messages
- Displays onboarding tips
- Provides call-to-action buttons

## Troubleshooting

### "Unauthorized" Error

- Ensure you're logged in
- Check that your user has a seller account
- Verify seller is approved (`verification_status = 'approved'`)

### "Failed to fetch" Error

- Check backend server is running on port 3000
- Check CORS settings in backend
- Verify `VITE_API_URL` environment variable

### Empty Dashboard

- Verify seller_id matches your logged-in user's seller account
- Check database for listings/bookings associated with your seller_id
- View browser console for API errors

### Database Schema Issues

```bash
# Regenerate and push schema
cd packages/db
bun run db:generate
bun run db:push
```

## Next Steps

1. **Test all features** - Navigate through each dashboard page
2. **Add mock data** - Create test listings and bookings
3. **Implement Epic 12** - Listing Management (create/edit listings)
4. **Add file uploads** - For proof of completion
5. **Test review responses** - Try responding to a review
6. **Check analytics** - View charts with real data

## File Locations

```
Backend:
├── apps/server/src/routes/seller/dashboard.ts       # API routes
├── apps/server/src/middleware/seller-auth.ts        # Auth middleware
└── packages/db/src/schema/marketplace.ts            # Database schema

Frontend:
├── apps/web/src/routes/seller/dashboard/           # Dashboard pages
│   ├── index.tsx                                     # Overview
│   ├── bookings.tsx                                  # Bookings
│   ├── earnings.tsx                                  # Earnings
│   ├── payouts.tsx                                   # Payouts
│   ├── analytics.tsx                                 # Analytics
│   └── reviews.tsx                                   # Reviews
├── apps/web/src/components/seller/dashboard-layout.tsx
├── apps/web/src/lib/api/seller-dashboard.ts         # API client
└── apps/web/src/types/dashboard.ts                  # TypeScript types
```

## Support

For detailed implementation information, see:

- `/docs/seller-dashboard-implementation.md` - Full implementation details
- `/docs/prd.md` - Original requirements (Epic 13)

## Success Criteria ✅

From PRD Epic 13:

- ✅ Dashboard overview with key metrics
- ✅ Bookings list with filtering
- ✅ Earnings breakdown
- ✅ Payout history
- ✅ Analytics with charts
- ✅ Review management with responses

**All user stories completed! (24 SP)**
