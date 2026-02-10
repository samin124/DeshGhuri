# Epic 12: Listing Management - Implementation Status

**Date:** 2026-02-09
**Status:** ✅ Core Backend Complete | 🚧 Frontend Integration In Progress
**Branch:** `epic-12-listing-management`

---

## 🎯 What's Been Completed

### ✅ Phase 1: Foundation & APIs (100% Complete)

#### 1. Category Standardization
- ✅ Added enums to `packages/db/src/schema/marketplace.ts`
  - `LISTING_CATEGORIES`, `LISTING_STATUSES`, `CANCELLATION_POLICIES`, `PRICE_UNITS`
- ✅ Created `apps/web/src/lib/constants/categories.ts` with display mappings
- ✅ Updated `apps/web/src/types/listing.ts` with complete Listing interface
- ✅ Added `isFeatured` and `isTrending` boolean fields to listing table

#### 2. Database Migration
- ✅ Generated migration: `0001_sturdy_wrecker.sql`
- ✅ Applied successfully - adds `is_featured` and `is_trending` columns
- ✅ All 45 seeded listings have proper flags set

#### 3. Public Listing APIs
**File:** `apps/server/src/routes/listings.ts`

✅ **6 Endpoints Implemented:**
1. `GET /api/listings` - Browse with filters, pagination, sorting
2. `GET /api/listings/:id` - Get listing detail with seller info, reviews, similar listings
3. `GET /api/listings/featured` - Get admin-marked featured listings (limit 12)
4. `GET /api/listings/trending` - Get trending by views+bookings score (limit 8)
5. `POST /api/listings/search` - Advanced search with keyword and amenities
6. `POST /api/listings/:id/view` - Track listing views

**Features:**
- Only returns `status: 'active'` listings to public
- Includes seller verification status
- Server-side filtering, sorting, pagination
- Available filters metadata returned

#### 4. Seed Data Generator
**File:** `apps/server/src/scripts/seed-listings.ts`

✅ **Generated 45 Realistic Listings:**
- 15 Hotels (13 active, 1 pending-review, 1 draft)
- 15 Tour Packages (all active)
- 10 Experiences (all active)
- 5 Transport options (all active)
- 5 Verified test sellers

**Includes:**
- Realistic titles, descriptions, pricing
- Group pricing tiers (60% of listings)
- Images (Unsplash placeholder URLs)
- Mix of categories, locations across Bangladesh
- Varied stats (views, bookings, ratings)
- Featured (30%) and trending (20%) flags set randomly

### ✅ Phase 2: Admin Listing APIs (100% Complete)

**File:** `apps/server/src/routes/admin/listings.ts`

✅ **6 Endpoints Implemented:**
1. `GET /api/admin/listings/review-queue` - Pending listings with seller info, days waiting, priority
2. `GET /api/admin/listings` - All listings with filters, search, pagination
3. `GET /api/admin/listings/:id` - Get listing details with full seller info
4. `PATCH /api/admin/listings/:id/review` - Approve/reject listings
5. `PATCH /api/admin/listings/:id/featured` - Toggle featured status
6. `PATCH /api/admin/listings/:id/force-pause` - Admin pause for policy violations

**Features:**
- ✅ Review queue sorted by oldest first
- ✅ Priority calculation (high if seller rating > 4.5)
- ✅ Days waiting calculation
- ✅ Approve sets status to `active`, publishes listing
- ✅ Reject sets status to `rejected`, stores reason
- ✅ Audit logging for all admin actions
- ✅ Email notification TODOs marked (easy to add)

### ✅ Phase 3: TanStack Query Hooks (100% Complete)

**File:** `apps/web/src/lib/api/listings.ts`

✅ **6 Hooks Created:**
1. `useListings(filters)` - Browse with filters (5-min stale time)
2. `useListing(id)` - Get detail (10-min stale time)
3. `useFeaturedListings()` - Featured listings (30-min stale time)
4. `useTrendingListings()` - Trending listings (1-hour stale time)
5. `useListingsByCategory(category, limit)` - Convenience wrapper
6. `trackListingView(listingId)` - Fire-and-forget view tracking

**Features:**
- ✅ Proper cache keys for invalidation
- ✅ Configurable stale/cache times
- ✅ TypeScript types exported
- ✅ Error handling built-in

---

## 🧪 Testing the APIs

### Quick API Tests

```bash
# Start the backend server (if not running)
cd E:/Learn-Typescript/DeshGhuri
bun run dev:server

# Browse all active listings
curl http://localhost:3000/api/listings?limit=5

# Filter by category
curl "http://localhost:3000/api/listings?category=hotel&limit=3"

# Filter by location
curl "http://localhost:3000/api/listings?location=Dhaka&limit=5"

# Get featured listings
curl http://localhost:3000/api/listings/featured

# Get trending listings
curl http://localhost:3000/api/listings/trending

# Get specific listing (replace with actual ID from above)
curl http://localhost:3000/api/listings/YOUR_LISTING_ID

# Search with keyword
curl -X POST http://localhost:3000/api/listings/search \
  -H "Content-Type: application/json" \
  -d '{"keyword":"Sundarbans","filters":{"category":"tour-package"}}'
```

### Admin API Tests (Requires Admin Auth)

```bash
# Login as admin first and get session cookie
curl -c cookies.txt -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@deshghuri.com","password":"Admin@123456"}'

# View review queue
curl -b cookies.txt http://localhost:3000/api/admin/listings/review-queue

# Get all listings (admin view)
curl -b cookies.txt "http://localhost:3000/api/admin/listings?status=pending-review"

# Approve a listing (replace LISTING_ID)
curl -b cookies.txt -X PATCH http://localhost:3000/api/admin/listings/LISTING_ID/review \
  -H "Content-Type: application/json" \
  -d '{"action":"approve","featured":true}'

# Reject a listing
curl -b cookies.txt -X PATCH http://localhost:3000/api/admin/listings/LISTING_ID/review \
  -H "Content-Type: application/json" \
  -d '{"action":"reject","rejectionReason":"Incomplete information"}'

# Toggle featured
curl -b cookies.txt -X PATCH http://localhost:3000/api/admin/listings/LISTING_ID/featured \
  -H "Content-Type: application/json" \
  -d '{"featured":true}'
```

---

## 🚀 Frontend Integration Guide

### Using the Hooks in Components

#### Example 1: Homepage Featured Listings

**Before (Mock Data):**
```typescript
// apps/web/src/components/homepage/featured-listings.tsx
import { mockFeaturedListings } from '@/lib/mock-data';

export default function FeaturedListings() {
  return (
    <div>
      {mockFeaturedListings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
```

**After (Real API):**
```typescript
import { useFeaturedListings } from '@/lib/api/listings';
import { ListingCard } from '@/components/listing-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeaturedListings() {
  const { data, isLoading, error } = useFeaturedListings();

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div>Error loading featured listings</div>;
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {data?.data.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
```

#### Example 2: Search Page with Filters

```typescript
import { useListings } from '@/lib/api/listings';
import { useSearch } from '@tanstack/react-router';

export default function SearchPage() {
  const search = useSearch({ from: '/search' });

  const { data, isLoading } = useListings({
    category: search.category,
    location: search.location,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    page: search.page || 1,
    limit: 20,
    sort: search.sort || 'newest',
  });

  // Use data.data for listings
  // Use data.pagination for page controls
  // Use data.filters?.availableFilters for filter options
}
```

#### Example 3: Listing Detail Page

```typescript
import { useListing, trackListingView } from '@/lib/api/listings';
import { useParams } from '@tanstack/react-router';
import { useEffect } from 'react';

export default function ListingDetail() {
  const { listingId } = useParams({ from: '/listing/$listingId' });
  const { data, isLoading } = useListing(listingId);

  // Track view when component mounts
  useEffect(() => {
    if (listingId) {
      trackListingView(listingId);
    }
  }, [listingId]);

  if (isLoading) return <Skeleton />;

  const listing = data?.data;

  return (
    <div>
      <h1>{listing?.title}</h1>
      <p>{listing?.description}</p>

      {/* Recent Reviews */}
      {listing?.recentReviews?.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}

      {/* Similar Listings */}
      {listing?.similarListings?.map(similar => (
        <ListingCard key={similar.id} listing={similar} />
      ))}
    </div>
  );
}
```

---

## 📊 Database State

### Listings Overview
```sql
-- Check listing counts by status
SELECT status, COUNT(*) FROM listing GROUP BY status;

-- Results:
-- active: 43
-- pending-review: 1
-- draft: 1

-- Check featured/trending
SELECT
  COUNT(*) FILTER (WHERE is_featured = true) as featured,
  COUNT(*) FILTER (WHERE is_trending = true) as trending
FROM listing WHERE status = 'active';

-- Check category distribution
SELECT category, COUNT(*) FROM listing WHERE status = 'active' GROUP BY category;

-- Results:
-- hotel: 13
-- tour-package: 15
-- experience: 10
-- transport: 5
```

### Sellers Created
- `heritage.hotels@deshghuri.test` - Heritage Hotels Bangladesh
- `wanderlust.tours@deshghuri.test` - Wanderlust Tours & Travels
- `coxsbazar.resorts@deshghuri.test` - Cox's Bazar Beach Resorts
- `sylhet.eco@deshghuri.test` - Sylhet Eco Adventures
- `sundarbans.explorer@deshghuri.test` - Sundarbans Explorer

All sellers are `verified` with varying ratings (4-5 stars).

---

## 🚧 Remaining Work for Full Epic 12

### Phase 4: Frontend Integration (Not Started)
- [ ] Replace homepage mock data in 8 components:
  - [ ] `flash-deals.tsx`
  - [ ] `trending-listings.tsx`
  - [ ] `special-offers.tsx`
  - [ ] `seasonal-packages.tsx`
  - [ ] `featured-destinations.tsx`
  - [ ] `browse-categories.tsx`
  - [ ] Other homepage sections
- [ ] Integrate search page (`apps/web/src/routes/search.tsx`)
  - [ ] Use `useListings()` with search params
  - [ ] Server-side filtering instead of client-side
  - [ ] Implement pagination controls
- [ ] Integrate listing detail page (`apps/web/src/routes/listing/$listingId.tsx`)
  - [ ] Use `useListing()` hook
  - [ ] Add view tracking
  - [ ] Display similar listings

### Phase 5: Seller Multi-Step Form (Not Started)
- [ ] Create Zustand store for form state (`listing-form-store.ts`)
- [ ] Step 1: Basic Information component
- [ ] Step 2: Pricing & Capacity (with group tiers editor)
- [ ] Step 3: Media & Amenities (image uploader with Supabase)
- [ ] Step 4: Policies & Preview
- [ ] Form navigation component
- [ ] Draft auto-save (localStorage + API)
- [ ] Submit for review flow

### Phase 6: Admin UI (Not Started)
- [ ] Review Queue UI (`apps/web/src/routes/admin/_admin/listings/index.tsx`)
  - [ ] Tabs: Review Queue, All Listings, Featured
  - [ ] Listing detail drawer
  - [ ] Approve/reject modals
  - [ ] Priority indicators
- [ ] Admin dashboard stats update
  - [ ] Add "Pending Listings" card
  - [ ] Badge in sidebar navigation

### Phase 7: Analytics & Optimization (Deferred)
- [ ] Daily analytics aggregation cron job
- [ ] Trending calculation (replace simple algorithm)
- [ ] Per-listing analytics page for sellers
- [ ] Redis caching layer (optional)

---

## 💡 Quick Integration Instructions for Teammates

### 1. Pull the Latest Code
```bash
git checkout epic-12-listing-management
git pull origin epic-12-listing-management
```

### 2. Install Dependencies (if needed)
```bash
bun install
```

### 3. Run Database Migration
```bash
cd packages/db
bun run db:migrate
```

### 4. Seed the Database
```bash
cd apps/server
bun run src/scripts/seed-listings.ts
```

Output should show:
```
✅ Seed script completed successfully!
📊 Summary:
- Sellers: 5 verified sellers
- Hotels: 15 listings (13 active, 1 pending review, 1 draft)
- Tour Packages: 15 active listings
- Experiences: 10 active listings
- Transport: 5 active listings
- TOTAL: 45 listings (43 active + 2 non-active)
```

### 5. Start Development Servers
```bash
# Terminal 1: Backend
cd E:/Learn-Typescript/DeshGhuri
bun run dev:server

# Terminal 2: Frontend (in new terminal)
cd E:/Learn-Typescript/DeshGhuri
bun run dev:web
```

### 6. Test the APIs
- Visit: http://localhost:3001/search (should still show mock data - integration pending)
- API Test: http://localhost:3000/api/listings/featured (should return real data)

### 7. Integrate Frontend (Your Turn!)
- Use the hooks from `apps/web/src/lib/api/listings.ts`
- Follow the examples in this document
- Replace mock data imports with hooks
- Add loading states (skeletons)
- Add error states

---

## 🎉 Key Achievements

✅ **Database Schema:** Complete with all PRD fields
✅ **Public APIs:** 6 endpoints returning only active listings
✅ **Admin APIs:** 6 endpoints for review queue and management
✅ **Seed Data:** 45 realistic listings across 4 categories
✅ **TanStack Query:** Hooks ready with proper caching
✅ **Type Safety:** Full TypeScript types throughout
✅ **Audit Logging:** All admin actions logged
✅ **Migration:** Applied successfully, no rollback needed

---

## 📚 File Reference

### New Files Created (10)
1. `packages/db/src/schema/marketplace.ts` - Added enums (modified)
2. `apps/web/src/lib/constants/categories.ts` - Display mappings (new)
3. `apps/web/src/types/listing.ts` - TypeScript types (modified)
4. `apps/server/src/routes/listings.ts` - Public APIs (new)
5. `apps/server/src/routes/admin/listings.ts` - Admin APIs (replaced placeholder)
6. `apps/server/src/scripts/seed-listings.ts` - Seed script (new)
7. `apps/web/src/lib/api/listings.ts` - TanStack Query hooks (new)
8. `packages/db/src/migrations/0001_sturdy_wrecker.sql` - Migration (generated)
9. `docs/EPIC_12_IMPLEMENTATION_STATUS.md` - This file (new)

### Modified Files (4)
1. `apps/server/src/index.ts` - Registered public listing routes
2. `apps/server/src/routes/customer/bookings.ts` - Fixed imports
3. `apps/server/src/routes/seller/listings.ts` - Fixed imports

---

**Next Steps:** Frontend integration using the TanStack Query hooks provided. Refer to the examples above for guidance.

**Questions?** Check the implementation files for detailed comments and types.

**Status as of 2026-02-09:** ✅ Backend 100% Complete | 🚧 Frontend 30% Complete (hooks ready, components need integration)
