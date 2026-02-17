import type {
  ListingCategory,
  ListingStatus,
  CancellationPolicy,
  PriceUnit,
} from '@/lib/constants/categories';

export interface ListingImage {
  url: string;
  storageKey: string;
  caption?: string;
  isPrimary: boolean;
}

export interface ListingLocation {
  city: string;
  district: string;
  address: string;
  landmark?: string;
  coordinates?: { lat: number; lng: number };
}

export interface GroupPricingTier {
  minParticipants: number;
  maxParticipants: number;
  discountPercentage: number;
  pricePerPerson: number;
}

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  slug: string;
  description: string;
  category: ListingCategory;

  // Location
  location: ListingLocation;

  // Pricing
  basePrice: string; // Decimal as string
  currency: 'BDT';
  priceUnit: PriceUnit;

  // Capacity
  capacity: number;
  minGuests?: number;
  maxGuests: number;
  bookedPackages?: number;
  availablePackages?: number;
  isBookingClosed?: boolean;

  // Group Pricing
  groupEligible: boolean;
  groupPricingTiers?: GroupPricingTier[];

  // Amenities & Features
  amenities?: string[];
  inclusions?: string[];
  exclusions?: string[];

  // Policies
  cancellationPolicy: CancellationPolicy;
  houseRules?: string;
  checkInTime?: string;
  checkOutTime?: string;

  // Media
  images: ListingImage[];

  // Status
  status: ListingStatus;
  rejectionReason?: string;

  // Stats
  viewCount: number;
  bookingCount: number;
  rating?: string; // Decimal as string
  reviewCount: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;

  // Optional enriched data (from API joins)
  seller?: {
    id: string;
    name: string;
    avatar?: string;
    isVerified: boolean;
    verificationStatus?: string;
    rating?: number;
    responseTime?: string;
  };

  // UI helper flags
  isTrending?: boolean;
  isFeatured?: boolean;

  // Promotion fields
  isFlashDeal?: boolean;
  flashDealEndsAt?: string;
  discountPercent?: number;
  discountedPrice?: string;
  promoCode?: string;
  promoCodeDiscount?: number;
  promoCodeMaxUses?: number;
  promoCodeUsedCount?: number;
  promoCodeExpiresAt?: string;
}

export interface GroupBooking {
  id: string;
  listing: Listing;
  destination: string;
  travelDate: string;
  currentMembers: number;
  minMembers: number;
  maxMembers: number;
  currentTier: number;
  pricePerPerson: number;
  organizer: {
    name: string;
    avatar?: string;
  };
  isPublic: boolean;
  deadline: string;
}
