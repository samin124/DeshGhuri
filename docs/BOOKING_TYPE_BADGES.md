# Booking Type Badges - Implementation Complete

This document explains the Individual/Group booking badges added to all listing cards.

---

## Feature Overview

Every listing now displays a badge indicating whether it supports:
- **Individual Booking** - For solo travelers or small parties
- **Group Booking** - For larger groups with special group pricing

---

## Visual Design

### Individual Booking Badge
```
┌──────────────────────┐
│ 👤 Individual        │
└──────────────────────┘
```
- **Icon**: Single user icon (👤)
- **Text**: "Individual"
- **Colors**: Slate background with subtle border
- **Style**: Outlined badge for clean appearance

### Group Booking Badge
```
┌──────────────────────┐
│ 👥 Group Booking     │
└──────────────────────┘
```
- **Icon**: Multiple users icon (👥)
- **Text**: "Group Booking"
- **Colors**: Blue background (blue-50) with blue border and text
- **Style**: Outlined badge with blue accent to stand out

---

## Where Badges Appear

The booking type badges are displayed on **all listing cards** throughout the site:

1. ✅ **Homepage**:
   - Flash Deals section
   - Special Offers
   - Trending Listings
   - Popular Services
   - Groups Forming
   - Seasonal Packages

2. ✅ **Search Results Page**:
   - All search results
   - Filtered results
   - Category browsing

3. ✅ **Seller Dashboard**:
   - My Listings page
   - Draft listings

4. ✅ **Admin Dashboard**:
   - All listings management

---

## Badge Placement

The badges appear in the **card content area**, right below the location and next to the category badge:

```
┌─────────────────────────────────┐
│ [Image with Flash Sale Badge]  │
│                                 │
│ Listing Title                   │
│ 📍 Location, District           │
│ by Seller Name ✓                │
│                                 │
│ [hotel] [👥 Group Booking]     │  ← Badge appears here
│                                 │
│ ⭐ 4.5 (12 reviews)             │
│ ৳12,500 / per person            │
└─────────────────────────────────┘
```

---

## Data Source

### Database Field: `groupEligible`

**Schema**: `packages/db/src/schema/marketplace.ts`

```typescript
groupEligible: boolean('group_eligible').default(false).notNull(),
groupPricingTiers: json('group_pricing_tiers').$type<Array<{
  minParticipants: number;
  maxParticipants: number;
  discountPercentage: number;
  pricePerPerson: number;
}>>(),
```

### Logic
- `groupEligible = true` → Shows "Group Booking" badge
- `groupEligible = false` → Shows "Individual" badge

---

## Distribution in Database

Based on current data (350 listings):

**Tour Packages**: Mostly Group Eligible ✅
- Example: "Sajek Valley Cloud Paradise 2-Day Trip"
- Example: "Dhaka City Heritage Walk"
- Example: "Jaflong & Bichnakandi Waterfall Tour"

**Hotels**: Mixed (Individual & Group) ✅
- Individual: "Rajshahi Silk City Inn"
- Group: "Dinajpur Royal Palace Hotel"
- Individual: "Rangpur Heritage Lodge"
- Group: "Saint Martin Island Beach Cottage"

**Experiences**: Mixed based on activity type

**Transport**: Typically Individual

---

## Implementation Details

### Component: `ListingCard`

**File**: `apps/web/src/components/common/listing-card.tsx`

**Code Added**:
```typescript
{/* Booking Type Badge */}
{listing.groupEligible ? (
  <Badge
    variant="outline"
    className="text-xs flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
  >
    <Users className="h-3 w-3" />
    Group Booking
  </Badge>
) : (
  <Badge
    variant="outline"
    className="text-xs flex items-center gap-1 bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800"
  >
    <User className="h-3 w-3" />
    Individual
  </Badge>
)}
```

**Icons Used**:
- `Users` from lucide-react (for Group Booking)
- `User` from lucide-react (for Individual)

---

## Benefits

### For Customers
1. **Instant Clarity**: Know at a glance if a package is for groups
2. **Better Filtering**: Quickly identify group tour options
3. **Expectation Setting**: Understand booking type before clicking

### For Sellers
1. **Clear Communication**: Package type is immediately visible
2. **Attract Right Audience**: Group packages attract group travelers
3. **Reduce Inquiries**: Fewer questions about group availability

---

## Responsive Design

✅ **Mobile**: Badges stack properly with flex-wrap
✅ **Tablet**: Badges display inline next to category
✅ **Desktop**: Optimal spacing and visibility

---

## Dark Mode Support

Both badge variants support dark mode:
- Individual: Subtle slate colors adapt to dark theme
- Group: Blue accents remain visible and attractive

---

## Sample Listings

### Group Booking Examples
```
1. Sajek Valley Cloud Paradise 2-Day Trip
   Badge: 👥 Group Booking
   Category: tour-package

2. Dhaka City Heritage Walk
   Badge: 👥 Group Booking
   Category: tour-package

3. Dinajpur Royal Palace Hotel
   Badge: 👥 Group Booking
   Category: hotel
```

### Individual Booking Examples
```
1. Rajshahi Silk City Inn
   Badge: 👤 Individual
   Category: hotel

2. Rangpur Heritage Lodge
   Badge: 👤 Individual
   Category: hotel

3. Old Dhaka Heritage Hotel
   Badge: 👤 Individual
   Category: hotel
```

---

## Testing

### Verification Script
Created: `apps/server/src/scripts/check-group-eligible.ts`

**Usage**:
```bash
cd apps/server
bun run src/scripts/check-group-eligible.ts
```

**Output**: Shows sample listings with their groupEligible status

---

## Future Enhancements

Potential improvements:
- [ ] Filter by booking type in search
- [ ] Add "Group Discounts Available" sub-badge
- [ ] Show group pricing tiers on hover
- [ ] Group size calculator widget
- [ ] "Best for Groups" collection page

---

## API Response

The `groupEligible` field is included in all listing API responses:

```json
{
  "success": true,
  "data": [{
    "id": "listing-123",
    "title": "Sajek Valley Tour",
    "category": "tour-package",
    "groupEligible": true,
    "groupPricingTiers": [
      {
        "minParticipants": 10,
        "maxParticipants": 20,
        "discountPercentage": 15,
        "pricePerPerson": 8500
      }
    ]
    // ... other fields
  }]
}
```

---

## Summary

**What Was Added**:
- ✅ Visual badges showing Individual vs Group booking
- ✅ Applied to all listing cards throughout the site
- ✅ Uses existing `groupEligible` database field
- ✅ Responsive and dark mode compatible
- ✅ Clear iconography (👤 Individual, 👥 Group)

**Where They Appear**:
- ✅ All homepage sections
- ✅ Search and filter results
- ✅ Admin and seller dashboards

**User Benefit**:
- ✅ Instant visibility of booking type
- ✅ Better decision making
- ✅ Clear expectations

---

**Date Implemented**: 2026-02-10
**Status**: ✅ Complete and Deployed
**Component**: ListingCard
**Hot Reload**: ✅ Applied automatically
