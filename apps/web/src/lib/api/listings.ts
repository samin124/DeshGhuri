import { useQuery } from '@tanstack/react-query';
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
    appliedFilters: Record<string, any>;
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
    recentReviews?: any[];
    similarListings?: Listing[];
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
