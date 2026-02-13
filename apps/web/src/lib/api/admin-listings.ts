import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Listing } from '@/types/listing';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

// Types
interface ReviewQueueFilters {
  page?: number;
  limit?: number;
  category?: string;
  sellerId?: string;
}

interface ReviewQueueResponse {
  success: boolean;
  data: Array<
    Listing & {
      seller: {
        name: string;
        verificationStatus: string;
        rating: number;
        totalListings: number;
      };
      submittedAt: string;
      priority: 'high' | 'normal';
      daysWaiting: number;
    }
  >;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface AdminListingsFilters {
  page?: number;
  limit?: number;
  status?: 'all' | 'draft' | 'pending-review' | 'active' | 'paused' | 'rejected';
  featured?: boolean;
  flashDeals?: boolean;
  groupEligible?: boolean;
  sellerId?: string;
  search?: string;
}

interface ReviewListingInput {
  listingId: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
  feedback?: string;
  featured?: boolean;
}

interface UpdateFlashDealInput {
  listingId: string;
  enabled: boolean;
  discountPercent?: number;
  flashDealEndsAt?: string;
  reason?: string;
}

interface ToggleGroupEligibleInput {
  listingId: string;
  enabled: boolean;
  reason?: string;
}

// Query Keys
export const adminListingKeys = {
  all: ['admin-listings'] as const,
  reviewQueue: (filters?: ReviewQueueFilters) =>
    [...adminListingKeys.all, 'review-queue', filters] as const,
  lists: () => [...adminListingKeys.all, 'list'] as const,
  list: (filters?: AdminListingsFilters) => [...adminListingKeys.lists(), filters] as const,
  details: () => [...adminListingKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminListingKeys.details(), id] as const,
};

// Fetch functions
async function fetchReviewQueue(filters: ReviewQueueFilters = {}): Promise<ReviewQueueResponse> {
  const query = new URLSearchParams();
  if (filters.page) query.append('page', filters.page.toString());
  if (filters.limit) query.append('limit', filters.limit.toString());
  if (filters.category) query.append('category', filters.category);
  if (filters.sellerId) query.append('sellerId', filters.sellerId);

  const res = await fetch(`${API_URL}/api/admin/listings/review-queue?${query}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch review queue');
  }

  return res.json();
}

async function fetchAdminListings(filters: AdminListingsFilters = {}) {
  const query = new URLSearchParams();
  if (filters.page) query.append('page', filters.page.toString());
  if (filters.limit) query.append('limit', filters.limit.toString());
  if (filters.status && filters.status !== 'all') query.append('status', filters.status);
  if (filters.featured !== undefined) query.append('featured', filters.featured.toString());
  if (filters.flashDeals !== undefined) query.append('flashDeals', filters.flashDeals.toString());
  if (filters.groupEligible !== undefined) {
    query.append('groupEligible', filters.groupEligible.toString());
  }
  if (filters.sellerId) query.append('sellerId', filters.sellerId);
  if (filters.search) query.append('search', filters.search);

  const res = await fetch(`${API_URL}/api/admin/listings?${query}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch admin listings');
  }

  return res.json();
}

async function fetchAdminListing(id: string) {
  const res = await fetch(`${API_URL}/api/admin/listings/${id}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch listing');
  }

  return res.json();
}

async function reviewListing(input: ReviewListingInput) {
  const res = await fetch(`${API_URL}/api/admin/listings/${input.listingId}/review`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      action: input.action,
      rejectionReason: input.rejectionReason,
      feedback: input.feedback,
      featured: input.featured,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to review listing');
  }

  return res.json();
}

async function toggleFeatured(listingId: string, featured: boolean) {
  const res = await fetch(`${API_URL}/api/admin/listings/${listingId}/featured`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ featured }),
  });

  if (!res.ok) {
    throw new Error('Failed to toggle featured status');
  }

  return res.json();
}

async function updateFlashDeal(input: UpdateFlashDealInput) {
  const res = await fetch(`${API_URL}/api/admin/listings/${input.listingId}/flash-deal`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      enabled: input.enabled,
      discountPercent: input.discountPercent,
      flashDealEndsAt: input.flashDealEndsAt,
      reason: input.reason,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || 'Failed to update flash deal');
  }

  return res.json();
}

async function toggleGroupEligible(input: ToggleGroupEligibleInput) {
  const res = await fetch(`${API_URL}/api/admin/listings/${input.listingId}/group-eligible`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      enabled: input.enabled,
      reason: input.reason,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || 'Failed to update special offers placement');
  }

  return res.json();
}

// Hooks
export function useAdminReviewQueue(filters: ReviewQueueFilters = {}) {
  return useQuery({
    queryKey: adminListingKeys.reviewQueue(filters),
    queryFn: () => fetchReviewQueue(filters),
    staleTime: 1 * 60 * 1000, // 1 minute (frequent updates for review queue)
  });
}

export function useAdminListings(filters: AdminListingsFilters = {}) {
  return useQuery({
    queryKey: adminListingKeys.list(filters),
    queryFn: () => fetchAdminListings(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAdminListing(id: string) {
  return useQuery({
    queryKey: adminListingKeys.detail(id),
    queryFn: () => fetchAdminListing(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useReviewListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewListing,
    onSuccess: () => {
      // Invalidate review queue and all listings
      queryClient.invalidateQueries({ queryKey: adminListingKeys.reviewQueue() });
      queryClient.invalidateQueries({ queryKey: adminListingKeys.lists() });
    },
  });
}

export function useToggleFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, featured }: { listingId: string; featured: boolean }) =>
      toggleFeatured(listingId, featured),
    onSuccess: () => {
      // Invalidate all listings queries
      queryClient.invalidateQueries({ queryKey: adminListingKeys.lists() });
    },
  });
}

export function useUpdateFlashDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFlashDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminListingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminListingKeys.reviewQueue() });
    },
  });
}

export function useToggleGroupEligible() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleGroupEligible,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminListingKeys.lists() });
    },
  });
}

// Get pending listing count
export function usePendingListingsCount() {
  return useQuery({
    queryKey: ['admin-pending-listings-count'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/listings/review-queue?page=1&limit=1`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch pending count');
      }

      const data = await res.json();
      return {
        count: data.pagination?.total || 0,
        highPriority: data.data?.filter((l: any) => l.priority === 'high').length || 0,
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}
