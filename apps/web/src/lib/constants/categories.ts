// Category constants and display mappings

export const LISTING_CATEGORIES = {
  HOTEL: 'hotel',
  TOUR_PACKAGE: 'tour-package',
  EXPERIENCE: 'experience',
  TRANSPORT: 'transport',
} as const;

export type ListingCategory = typeof LISTING_CATEGORIES[keyof typeof LISTING_CATEGORIES];

// Display names for UI
export const CATEGORY_DISPLAY_NAMES: Record<ListingCategory, string> = {
  [LISTING_CATEGORIES.HOTEL]: 'Hotels & Resorts',
  [LISTING_CATEGORIES.TOUR_PACKAGE]: 'Tour Packages',
  [LISTING_CATEGORIES.EXPERIENCE]: 'Experiences',
  [LISTING_CATEGORIES.TRANSPORT]: 'Transportation',
};

// Plural forms for browse sections
export const CATEGORY_PLURAL_NAMES: Record<ListingCategory, string> = {
  [LISTING_CATEGORIES.HOTEL]: 'Hotels',
  [LISTING_CATEGORIES.TOUR_PACKAGE]: 'Tours',
  [LISTING_CATEGORIES.EXPERIENCE]: 'Experiences',
  [LISTING_CATEGORIES.TRANSPORT]: 'Transport',
};

// Icons mapping (for UI components)
export const CATEGORY_ICONS: Record<ListingCategory, string> = {
  [LISTING_CATEGORIES.HOTEL]: 'Building2',
  [LISTING_CATEGORIES.TOUR_PACKAGE]: 'MapPin',
  [LISTING_CATEGORIES.EXPERIENCE]: 'Sparkles',
  [LISTING_CATEGORIES.TRANSPORT]: 'Car',
};

// Helper function to get display name
export function getCategoryDisplayName(category: ListingCategory): string {
  return CATEGORY_DISPLAY_NAMES[category] || category;
}

// Helper function to get plural name
export function getCategoryPluralName(category: ListingCategory): string {
  return CATEGORY_PLURAL_NAMES[category] || category;
}

// Listing statuses
export const LISTING_STATUSES = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending-review',
  ACTIVE: 'active',
  PAUSED: 'paused',
  REJECTED: 'rejected',
} as const;

export type ListingStatus = typeof LISTING_STATUSES[keyof typeof LISTING_STATUSES];

// Status display names
export const STATUS_DISPLAY_NAMES: Record<ListingStatus, string> = {
  [LISTING_STATUSES.DRAFT]: 'Draft',
  [LISTING_STATUSES.PENDING_REVIEW]: 'Pending Review',
  [LISTING_STATUSES.ACTIVE]: 'Active',
  [LISTING_STATUSES.PAUSED]: 'Paused',
  [LISTING_STATUSES.REJECTED]: 'Rejected',
};

// Status badge variants (for UI)
export const STATUS_BADGE_VARIANTS: Record<ListingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [LISTING_STATUSES.DRAFT]: 'secondary',
  [LISTING_STATUSES.PENDING_REVIEW]: 'outline',
  [LISTING_STATUSES.ACTIVE]: 'default',
  [LISTING_STATUSES.PAUSED]: 'secondary',
  [LISTING_STATUSES.REJECTED]: 'destructive',
};

// Cancellation policies
export const CANCELLATION_POLICIES = {
  FLEXIBLE: 'flexible',
  MODERATE: 'moderate',
  STRICT: 'strict',
  NON_REFUNDABLE: 'non-refundable',
} as const;

export type CancellationPolicy = typeof CANCELLATION_POLICIES[keyof typeof CANCELLATION_POLICIES];

export const CANCELLATION_POLICY_DISPLAY_NAMES: Record<CancellationPolicy, string> = {
  [CANCELLATION_POLICIES.FLEXIBLE]: 'Flexible - Free cancellation up to 24 hours before',
  [CANCELLATION_POLICIES.MODERATE]: 'Moderate - Free cancellation up to 5 days before',
  [CANCELLATION_POLICIES.STRICT]: 'Strict - Free cancellation up to 7 days before',
  [CANCELLATION_POLICIES.NON_REFUNDABLE]: 'Non-Refundable - No refunds',
};

export const CANCELLATION_POLICY_DESCRIPTIONS: Record<CancellationPolicy, string> = {
  [CANCELLATION_POLICIES.FLEXIBLE]: 'Customers can cancel up to 24 hours before check-in and get a full refund.',
  [CANCELLATION_POLICIES.MODERATE]: 'Customers can cancel up to 5 days before check-in and get a full refund.',
  [CANCELLATION_POLICIES.STRICT]: 'Customers can cancel up to 7 days before check-in and get a 50% refund.',
  [CANCELLATION_POLICIES.NON_REFUNDABLE]: 'This booking is non-refundable. Customers cannot cancel and get a refund.',
};

// Price units
export const PRICE_UNITS = {
  PER_PERSON: 'per-person',
  PER_NIGHT: 'per-night',
  PER_BOOKING: 'per-booking',
} as const;

export type PriceUnit = typeof PRICE_UNITS[keyof typeof PRICE_UNITS];

export const PRICE_UNIT_DISPLAY_NAMES: Record<PriceUnit, string> = {
  [PRICE_UNITS.PER_PERSON]: 'per person',
  [PRICE_UNITS.PER_NIGHT]: 'per night',
  [PRICE_UNITS.PER_BOOKING]: 'per booking',
};
