# Role-Based Access Control Implementation

**Date:** 2026-02-09
**Status:** ✅ Complete

## Overview

This document describes the implementation of strict role-based access control (RBAC) for DeshGhuri, ensuring complete separation of concerns between Users, Sellers, and Admins.

---

## Implementation Goals

### Access Control Matrix

| Role | Allowed Access | Restricted From |
|------|----------------|-----------------|
| **Customer** | Homepage, search, listings, bookings, seller profiles | Seller dashboard, admin panel |
| **Seller** | Seller dashboard, own listings only | Homepage, customer features, admin panel |
| **Admin** | Admin panel, system management | Homepage, customer features, seller dashboard |

### Key Principles

1. **Role Segregation**: Each role operates in its own domain
2. **Frontend Protection**: Route guards prevent unauthorized navigation
3. **Backend Validation**: API endpoints enforce role requirements
4. **Ownership Verification**: Sellers can only modify their own resources

---

## Changes Made

### 1. Documentation Organization

**Moved to docs folder:**
- `AUTHENTICATION_FIX_SUMMARY.md`
- `AUTHENTICATION_UPDATES.md`
- `COMPLETE_CHANGES_SUMMARY.md`
- `PKILL_SETUP_GUIDE.md`
- `QUICK_REFERENCE.md`
- `QUICK_START.md`
- `SESSION_STATUS.md`
- `setup-local-db.md`
- `SINGLE_ROLE_ENFORCEMENT.md`

**Kept in root:**
- `README.md` - Project overview
- `CLAUDE.md` - AI assistant context

---

### 2. Frontend Route Protection

#### New Utility: `apps/web/src/lib/auth/role-guard.ts`

**Functions:**
- `getUserRoles()` - Fetches user roles from backend
- `requireCustomerAccess()` - Guards customer-only routes
- `requireSellerAccess()` - Guards seller-only routes
- `requireAdminAccess()` - Guards admin-only routes

**Protected Routes:**

| Route | Protection | Behavior |
|-------|-----------|----------|
| `/` (homepage) | `requireCustomerAccess()` | Redirects sellers to `/seller/dashboard`, admins to `/admin/dashboard` |
| `/search` | `requireCustomerAccess()` | Same as homepage |
| `/listing/:listingId` | `requireCustomerAccess()` | Same as homepage |
| `/seller/:sellerId/profile` | `requireCustomerAccess()` | Same as homepage |
| `/seller/dashboard` | `requireSellerAccess()` | Redirects to `/login` if not authenticated, to `/` if not seller |
| `/admin/_admin` | `requireAdminAccess()` | Redirects to `/admin` if not authenticated, to `/` if not admin |

**Implementation Example:**
```typescript
// apps/web/src/routes/index.tsx
export const Route = createFileRoute("/")({
  beforeLoad: async ({ location }) => {
    await requireCustomerAccess(location.pathname);
  },
  component: HomeComponent,
});
```

---

### 3. Backend API Protection

#### New Endpoints

##### Seller Listings CRUD
**File:** `apps/server/src/routes/seller/listings.ts`

**Endpoints:**
- `GET /api/seller/listings` - List all seller's listings
- `GET /api/seller/listings/:listingId` - Get specific listing (ownership check)
- `POST /api/seller/listings` - Create new listing
- `PATCH /api/seller/listings/:listingId` - Update listing (ownership check)
- `DELETE /api/seller/listings/:listingId` - Soft delete listing (ownership check)
- `PATCH /api/seller/listings/:listingId/toggle-active` - Toggle active status

**Security Features:**
- ✅ All routes protected by `requireSeller` middleware
- ✅ Seller ID automatically assigned from authenticated session
- ✅ Ownership verification on all read/update/delete operations
- ✅ Prevents modification of system-calculated fields (ratings, bookings count)
- ✅ Prevents sellers from setting `isFeatured` (admin-only)
- ✅ Checks for active bookings before deletion
- ✅ Generates unique slugs automatically

##### Customer Bookings API
**File:** `apps/server/src/routes/customer/bookings.ts`

**Endpoints:**
- `POST /api/bookings` - Create booking (customers only)
- `GET /api/bookings` - List customer's bookings
- `GET /api/bookings/:bookingId` - Get specific booking (ownership check)
- `PATCH /api/bookings/:bookingId/cancel` - Cancel booking (ownership check)

**Security Features:**
- ✅ Custom middleware `requireCustomerOnly`
- ✅ **Blocks sellers from making bookings** (403 Forbidden)
- ✅ **Blocks admins from making bookings** (403 Forbidden)
- ✅ Validates listing exists and is active
- ✅ Prevents customers from booking their own listings
- ✅ Validates guest count against listing capacity
- ✅ Ownership verification on all operations

**Middleware Logic:**
```typescript
async function requireCustomerOnly(c: any, next: () => Promise<void>) {
  // Verify sellers cannot book
  if (roles.includes("seller")) {
    throw new HTTPException(403, {
      message: "Forbidden: Sellers cannot make bookings. Please use a customer account.",
    });
  }

  // Verify admins cannot book
  if (roles.includes("admin") || roles.includes("super_admin")) {
    throw new HTTPException(403, {
      message: "Forbidden: Admins cannot make bookings. Please use a customer account.",
    });
  }
}
```

---

### 4. Route Registration

**Updated:** `apps/server/src/index.ts`

```typescript
// Seller routes
app.route("/api/seller/listings", sellerListings);

// Customer routes
app.route("/api/bookings", customerBookings);
```

---

## Security Model

### Frontend (UX Layer)

```
┌─────────────────────────────────────────────┐
│  User navigates to /                        │
├─────────────────────────────────────────────┤
│  beforeLoad: requireCustomerAccess()        │
│  ├─ Check session                           │
│  ├─ Fetch roles from /api/auth/roles        │
│  ├─ If seller → redirect to /seller/dash    │
│  ├─ If admin  → redirect to /admin/dash     │
│  └─ If customer/none → allow access         │
└─────────────────────────────────────────────┘
```

### Backend (Security Layer)

```
┌─────────────────────────────────────────────┐
│  Request to /api/seller/listings            │
├─────────────────────────────────────────────┤
│  Middleware: requireSeller                  │
│  ├─ Verify Better Auth session              │
│  ├─ Check seller role in database           │
│  ├─ Verify seller account is APPROVED       │
│  ├─ Verify email is verified                │
│  └─ Set sellerId in context                 │
├─────────────────────────────────────────────┤
│  Route Handler                              │
│  ├─ Get sellerId from context               │
│  ├─ Filter queries by sellerId              │
│  └─ Verify ownership for updates/deletes    │
└─────────────────────────────────────────────┘
```

---

## Ownership Validation Pattern

### Example: Update Listing

```typescript
app.patch("/:listingId", async (c) => {
  const sellerId = c.get("sellerId") as string; // From middleware
  const listingId = c.req.param("listingId");

  // Step 1: Verify ownership
  const existingListing = await db.query.listing.findFirst({
    where: and(
      eq(listing.id, listingId),
      eq(listing.sellerId, sellerId) // CRITICAL CHECK
    ),
  });

  if (!existingListing) {
    throw new HTTPException(404, {
      message: "Listing not found or you don't have permission to modify it",
    });
  }

  // Step 2: Sanitize input
  delete body.sellerId; // Prevent seller ID tampering
  delete body.isFeatured; // Only admins can set featured

  // Step 3: Update
  await db.update(listing).set(body).where(eq(listing.id, listingId));
});
```

---

## Testing Guide

### Manual Testing Checklist

#### ✅ Frontend Route Protection

1. **As Customer:**
   - [ ] Can access `/` (homepage)
   - [ ] Can access `/search`
   - [ ] Can access `/listing/:id`
   - [ ] Cannot access `/seller/dashboard` (redirects to `/login`)
   - [ ] Cannot access `/admin/dashboard` (redirects to `/admin`)

2. **As Seller:**
   - [ ] Cannot access `/` (redirects to `/seller/dashboard`)
   - [ ] Cannot access `/search` (redirects to `/seller/dashboard`)
   - [ ] Cannot access `/listing/:id` (redirects to `/seller/dashboard`)
   - [ ] Can access `/seller/dashboard`
   - [ ] Cannot access `/admin/dashboard` (redirects to `/`)

3. **As Admin:**
   - [ ] Cannot access `/` (redirects to `/admin/dashboard`)
   - [ ] Cannot access `/search` (redirects to `/admin/dashboard`)
   - [ ] Can access `/admin/dashboard`
   - [ ] Cannot access `/seller/dashboard` (redirects to `/`)

#### ✅ Backend API Protection

4. **Seller Listing Endpoints:**
   ```bash
   # As Seller A (sellerId: seller-1)
   POST /api/seller/listings
   # Should create listing with sellerId = seller-1

   PATCH /api/seller/listings/listing-1
   # Should succeed if listing-1.sellerId === seller-1
   # Should return 404 if listing belongs to seller-2

   DELETE /api/seller/listings/listing-2
   # Should return 404 if listing belongs to seller-2
   ```

5. **Customer Booking Endpoints:**
   ```bash
   # As Customer
   POST /api/bookings { listingId: "..." }
   # Should succeed

   # As Seller
   POST /api/bookings { listingId: "..." }
   # Should return 403: "Sellers cannot make bookings"

   # As Admin
   POST /api/bookings { listingId: "..." }
   # Should return 403: "Admins cannot make bookings"
   ```

### cURL Test Commands

```bash
# Test seller listing creation (should work)
curl -X POST http://localhost:3000/api/seller/listings \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_SELLER_TOKEN" \
  -d '{
    "title": "Test Listing",
    "description": "Test description",
    "category": "hotel",
    "location": { "city": "Dhaka", "district": "Dhaka", "address": "Test" },
    "basePrice": 5000,
    "priceUnit": "per-night",
    "capacity": 10,
    "maxGuests": 4
  }'

# Test seller trying to book (should fail)
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_SELLER_TOKEN" \
  -d '{
    "listingId": "some-listing-id",
    "checkInDate": "2026-03-01",
    "checkOutDate": "2026-03-03",
    "numberOfGuests": 2,
    "totalPrice": 10000
  }'
# Expected: 403 Forbidden
```

---

## API Response Examples

### Success: Customer Books Listing
```json
{
  "success": true,
  "data": {
    "id": "booking-abc123",
    "listingId": "listing-xyz789",
    "sellerId": "seller-1",
    "customerId": "customer-1",
    "status": "pending",
    "totalPrice": "10000",
    "currency": "BDT"
  },
  "message": "Booking created successfully. Proceeding to payment..."
}
```

### Error: Seller Tries to Book
```json
{
  "error": "Forbidden: Sellers cannot make bookings. Please use a customer account."
}
```

### Error: Update Listing Not Owned
```json
{
  "error": "Listing not found or you don't have permission to modify it"
}
```

---

## Migration Notes

### No Database Changes Required
- Uses existing schema
- No new migrations needed
- Works with current `listing`, `booking`, `userRole` tables

### Backward Compatibility
- Existing routes remain functional
- New routes are additive
- Frontend redirects are non-breaking (only add protection)

---

## Future Enhancements

1. **Rate Limiting**
   - Add per-role rate limits (e.g., sellers can create max 10 listings/day)

2. **Audit Logging**
   - Log all ownership validation failures
   - Track cross-role access attempts

3. **Admin Override**
   - Allow super admins to access all areas (with audit trail)

4. **Fine-Grained Permissions**
   - Add permissions like `listings:create`, `listings:update`, etc.

5. **Multi-Tenant Support**
   - Extend ownership checks for organizational accounts

---

## Key Files Reference

### Frontend
- `apps/web/src/lib/auth/role-guard.ts` - Route protection utilities
- `apps/web/src/routes/index.tsx` - Protected homepage
- `apps/web/src/routes/search.tsx` - Protected search
- `apps/web/src/routes/listing/$listingId.tsx` - Protected listing detail
- `apps/web/src/routes/seller/$sellerId/profile.tsx` - Protected seller profile
- `apps/web/src/routes/seller/dashboard.tsx` - Seller dashboard (updated)
- `apps/web/src/routes/admin/_admin.tsx` - Admin panel (updated)

### Backend
- `apps/server/src/routes/seller/listings.ts` - Seller listing CRUD
- `apps/server/src/routes/customer/bookings.ts` - Customer booking API
- `apps/server/src/middleware/seller-auth.ts` - Existing seller middleware
- `apps/server/src/middleware/admin-auth.ts` - Existing admin middleware
- `apps/server/src/index.ts` - Route registration

---

## Security Guarantees

✅ **Sellers cannot access customer pages** (redirected to seller dashboard)
✅ **Sellers cannot make bookings** (403 Forbidden at API level)
✅ **Sellers can only modify their own listings** (ownership verification)
✅ **Admins cannot access customer pages** (redirected to admin dashboard)
✅ **Admins cannot make bookings** (403 Forbidden at API level)
✅ **Customers cannot access seller/admin areas** (redirected to login or home)
✅ **Direct URL navigation is protected** (beforeLoad hooks)
✅ **API manipulation is prevented** (backend ownership checks)

---

**Implementation Status:** ✅ **COMPLETE**
**Next Steps:** Testing and deployment

For questions or issues, refer to:
- `/docs/IMPLEMENTATION_COMPLETE.md` - Original auth implementation
- `/docs/ARCHITECTURE.md` - System design
- `CLAUDE.md` - Project context for AI assistance
