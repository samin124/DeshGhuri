import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Listing } from '@/types/listing';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ListingFilters {
  page?: number;
  limit?: number;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  groupEligible?: boolean;
  verifiedOnly?: boolean;
  flashDeals?: boolean;
  sort?: 'price-asc' | 'price-desc' | 'rating' | 'popular' | 'newest';
}

export interface ListingsResponse {
  success: boolean;
  data: Listing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: {
    appliedFilters: Record<string, unknown>;
    availableFilters: {
      categories: Array<{ value: string; count: number }>;
      priceRange: { min: number; max: number };
      locations: string[];
    };
  };
}

export interface ListingDetailResponse {
  success: boolean;
  data: Listing & {
    recentReviews?: Array<Record<string, unknown>>;
    similarListings?: Listing[];
  };
}

export interface HomepageSectionVisibility {
  hero: boolean;
  flashDeals: boolean;
  specialOffers: boolean;
  trendingListings: boolean;
  browseCategories: boolean;
  featuredDestinations: boolean;
  popularServices: boolean;
  seasonalPackages: boolean;
  testimonials: boolean;
  blogPreview: boolean;
  faq: boolean;
  newsletter: boolean;
}

export interface HomepageConfigResponse {
  success: boolean;
  data: {
    heroTitle: string;
    heroSubtitle: string;
    sectionVisibility: HomepageSectionVisibility;
    updatedAt: string;
    updatedBy: string | null;
  };
}

export interface ListingReview {
  id: string;
  overallRating: number;
  title?: string | null;
  comment: string;
  sellerResponse?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  customer?: {
    id: string;
    name?: string | null;
    image?: string | null;
  } | null;
}

export interface ListingReviewsResponse {
  success: boolean;
  data: {
    averageRating: number;
    reviewCount: number;
    reviews: ListingReview[];
    canReview: boolean;
    eligibilityMessage: string;
  };
}

export interface CreateListingReviewRequest {
  overallRating: number;
  title?: string;
  comment: string;
  ratings?: {
    cleanliness?: number;
    communication?: number;
    accuracy?: number;
    value?: number;
    location?: number;
  };
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const listingKeys = {
  all: ['listings'] as const,
  lists: () => [...listingKeys.all, 'list'] as const,
  list: (filters: ListingFilters) => [...listingKeys.lists(), filters] as const,
  details: () => [...listingKeys.all, 'detail'] as const,
  detail: (id: string) => [...listingKeys.details(), id] as const,
  homepageConfig: () => [...listingKeys.all, 'homepage-config'] as const,
  reviews: () => [...listingKeys.all, 'reviews'] as const,
  review: (id: string, limit: number) => [...listingKeys.reviews(), id, limit] as const,
  featured: () => [...listingKeys.all, 'featured'] as const,
  trending: () => [...listingKeys.all, 'trending'] as const,
  flashDeals: () => [...listingKeys.all, 'flash-deals'] as const,
  seller: () => [...listingKeys.all, 'seller'] as const,
  sellerList: (sellerId: string) => [...listingKeys.seller(), sellerId] as const,
};

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

async function fetchListings(filters: ListingFilters = {}): Promise<ListingsResponse> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const res = await fetch(`${API_URL}/api/listings?${params}`);

  if (!res.ok) {
    throw new Error('Failed to fetch listings');
  }

  return res.json();
}

async function fetchListingDetail(id: string): Promise<ListingDetailResponse> {
  const res = await fetch(`${API_URL}/api/listings/${id}`);

  if (!res.ok) {
    throw new Error('Failed to fetch listing');
  }

  return res.json();
}

async function fetchHomepageConfig(): Promise<HomepageConfigResponse> {
  const res = await fetch(`${API_URL}/api/listings/homepage-config`);

  if (!res.ok) {
    throw new Error('Failed to fetch homepage config');
  }

  return res.json();
}

async function fetchFeaturedListings(): Promise<{ success: boolean; data: Listing[] }> {
  const res = await fetch(`${API_URL}/api/listings/featured`);

  if (!res.ok) {
    throw new Error('Failed to fetch featured listings');
  }

  return res.json();
}

async function fetchTrendingListings(): Promise<{ success: boolean; data: Listing[] }> {
  const res = await fetch(`${API_URL}/api/listings/trending`);

  if (!res.ok) {
    throw new Error('Failed to fetch trending listings');
  }

  return res.json();
}

async function fetchFlashDeals(): Promise<{ success: boolean; data: Listing[] }> {
  const res = await fetch(`${API_URL}/api/listings/flash-deals`);

  if (!res.ok) {
    throw new Error('Failed to fetch flash deals');
  }

  return res.json();
}

async function fetchListingReviews(id: string, limit = 5): Promise<ListingReviewsResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  const res = await fetch(`${API_URL}/api/listings/${id}/reviews?${params}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch listing reviews');
  }

  return res.json();
}

async function createListingReview(
  id: string,
  payload: CreateListingReviewRequest
): Promise<{ success: boolean; message: string; data: ListingReview }> {
  const res = await fetch(`${API_URL}/api/listings/${id}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || 'Failed to submit review');
  }

  return res.json();
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * Browse listings with filters and pagination
 */
export function useListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: listingKeys.list(filters),
    queryFn: () => fetchListings(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Get single listing with full details
 */
export function useListing(id: string) {
  return useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: () => fetchListingDetail(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!id, // Only run if id is provided
  });
}

/**
 * Get public homepage configuration (hero text + section visibility)
 */
export function useHomepageConfig() {
  return useQuery({
    queryKey: listingKeys.homepageConfig(),
    queryFn: fetchHomepageConfig,
    staleTime: 60 * 1000,
  });
}

/**
 * Get featured listings (admin-marked)
 */
export function useFeaturedListings() {
  return useQuery({
    queryKey: listingKeys.featured(),
    queryFn: fetchFeaturedListings,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Get trending listings based on views + bookings
 */
export function useTrendingListings() {
  return useQuery({
    queryKey: listingKeys.trending(),
    queryFn: fetchTrendingListings,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}

/**
 * Get active flash deals only
 */
export function useFlashDeals() {
  return useQuery({
    queryKey: listingKeys.flashDeals(),
    queryFn: fetchFlashDeals,
    staleTime: 5 * 60 * 1000, // 5 minutes (shorter because deals expire)
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get latest listing reviews, rating summary, and current user review eligibility
 */
export function useListingReviews(id: string, limit = 5) {
  return useQuery({
    queryKey: listingKeys.review(id, limit),
    queryFn: () => fetchListingReviews(id, limit),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

/**
 * Submit a new review for the listing
 */
export function useCreateListingReview(listingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateListingReviewRequest) => createListingReview(listingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(listingId) });
      queryClient.invalidateQueries({ queryKey: listingKeys.reviews() });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: listingKeys.flashDeals() });
      queryClient.invalidateQueries({ queryKey: listingKeys.featured() });
      queryClient.invalidateQueries({ queryKey: listingKeys.trending() });
    },
  });
}

/**
 * Get listings by category (convenience wrapper)
 */
export function useListingsByCategory(category: string, limit = 20) {
  return useListings({
    category,
    limit,
    sort: 'popular',
  });
}

/**
 * Track listing view (fire-and-forget)
 */
export async function trackListingView(listingId: string): Promise<void> {
  try {
    await fetch(`${API_URL}/api/listings/${listingId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Silent fail - view tracking is non-critical
    console.warn('Failed to track listing view:', error);
  }
}
