# Promotional Features Guide

This guide explains how to use and manage the promotional features (Flash Sales, Promo Codes, and Discounts) in DeshGhuri.

---

## Overview

The platform supports three types of promotions:

1. **⚡ Flash Sales** - Time-limited deals with countdown timers
2. **🏷️ Promo Codes** - Coupon codes customers can apply
3. **💰 Regular Discounts** - Standard percentage-based discounts

---

## Database Schema

### Listing Table - Promotional Fields

```typescript
{
  // Flash Sales
  isFlashDeal: boolean,
  flashDealEndsAt: timestamp,
  discountPercent: integer,
  discountedPrice: decimal,

  // Promo Codes
  promoCode: string,
  promoCodeDiscount: integer,
  promoCodeMaxUses: integer,
  promoCodeUsedCount: integer,
  promoCodeExpiresAt: timestamp,
}
```

---

## Visual Features

### Flash Sale Badge
- **Appearance**: Orange-to-red gradient with pulse animation
- **Shows**: "FLASH SALE" + discount percentage
- **Includes**: Countdown timer showing time remaining
- **Position**: Top-left of listing card

### Promo Code Badge
- **Appearance**: Amber-to-yellow gradient with bounce animation
- **Shows**: Actual promo code (e.g., "SAVE20")
- **Includes**: Info box showing discount percentage
- **Position**: Top-right of listing card

### Regular Discount Badge
- **Appearance**: Green badge
- **Shows**: Percentage off
- **Position**: Top-left (if no flash sale)

---

## How to Add Promotions

### Method 1: Using the Script (Bulk)

Run the pre-made script to add sample promotions:

```bash
cd apps/server
bun run src/scripts/add-promotions.ts
```

### Method 2: Direct Database Update

```typescript
import { db, listing } from '@DeshGhuri/db';

// Add a flash sale
await db
  .update(listing)
  .set({
    isFlashDeal: true,
    flashDealEndsAt: new Date('2026-02-15T23:59:59'),
    discountPercent: 40,
    discountedPrice: '6000.00', // Calculated from basePrice
  })
  .where(eq(listing.id, 'listing-id'));

// Add a promo code
await db
  .update(listing)
  .set({
    promoCode: 'SUMMER30',
    promoCodeDiscount: 30,
    promoCodeMaxUses: 100,
    promoCodeUsedCount: 0,
    promoCodeExpiresAt: new Date('2026-03-01'),
  })
  .where(eq(listing.id, 'listing-id'));

// Add a regular discount
await db
  .update(listing)
  .set({
    discountPercent: 20,
    discountedPrice: '4000.00', // Calculated from basePrice
  })
  .where(eq(listing.id, 'listing-id'));
```

### Method 3: Admin Panel (Future)

An admin interface will be added to manage promotions through the UI.

---

## Best Practices

### Flash Sales
- Keep duration between 24-72 hours for urgency
- Use 30-50% discounts for maximum impact
- Limit to 3-5 active flash deals at once
- Always set an end date

### Promo Codes
- Use memorable codes (e.g., "SAVE20", "WINTER25")
- Set reasonable max uses (50-200)
- Typical discounts: 10-30%
- Set expiration dates (7-30 days)
- Track usage to prevent abuse

### Regular Discounts
- Use for seasonal promotions
- Typical range: 10-25% off
- Can be long-term or permanent
- Combine with other features (group booking discounts)

---

## Priority Order

When multiple promotions apply to the same listing:

1. **Flash Sale Badge** (highest priority - most eye-catching)
2. **Promo Code Badge** (shown simultaneously on top-right)
3. **Trending Badge** (shown only if no flash sale)
4. **Regular Discount** (shown in price, not as top badge)

---

## Verification

Check active promotions:

```bash
cd apps/server
bun run src/scripts/verify-promotions.ts
```

This will show:
- All active flash deals with time remaining
- All promo codes with usage stats
- All regular discounts
- Summary statistics

---

## API Response

The listing API automatically includes all promotional fields:

```json
{
  "id": "listing-123",
  "title": "Luxury Resort",
  "basePrice": "10000.00",
  "isFlashDeal": true,
  "flashDealEndsAt": "2026-02-11T06:45:30.000Z",
  "discountPercent": 40,
  "discountedPrice": "6000.00",
  "promoCode": "SAVE20",
  "promoCodeDiscount": 20,
  "promoCodeMaxUses": 100,
  "promoCodeUsedCount": 5,
  "promoCodeExpiresAt": "2026-02-17T00:00:00.000Z"
}
```

---

## Frontend Components

### ListingCard
- Automatically detects and displays all promotional badges
- Shows countdown timers for flash sales
- Displays promo code information
- Calculates and shows discounted prices

### Usage
```tsx
<ListingCard
  listing={listing}
  showCountdown={true} // Enable countdown for flash deals
/>
```

---

## Cleanup

Remove expired promotions:

```typescript
import { db, listing } from '@DeshGhuri/db';

// Remove expired flash deals
await db
  .update(listing)
  .set({
    isFlashDeal: false,
    flashDealEndsAt: null,
    discountPercent: null,
    discountedPrice: null,
  })
  .where(
    and(
      eq(listing.isFlashDeal, true),
      sql`${listing.flashDealEndsAt} < NOW()`
    )
  );
```

---

## Tips for Maximum Engagement

1. **Flash Sales**: Create urgency with countdown timers
2. **Promo Codes**: Make them shareable on social media
3. **Combine Offers**: Flash sale + promo code = double incentive
4. **Rotate Promotions**: Keep content fresh
5. **Track Performance**: Monitor which promotions convert best

---

## Future Enhancements

- [ ] Admin UI for managing promotions
- [ ] Automated promotion scheduling
- [ ] Email notifications for flash sale starts
- [ ] Analytics dashboard for promotion performance
- [ ] Customer-specific promo codes
- [ ] Bulk promo code generation

---

**Last Updated**: 2026-02-10
