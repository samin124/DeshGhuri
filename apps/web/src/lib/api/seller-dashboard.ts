import { hc } from 'hono/client';
import type { AppType } from '@DeshGhuri/server';
import type {
  DashboardStats,
  GetBookingsParams,
  GetBookingsResponse,
  EarningsSummary,
  Payout,
  GetReviewsParams,
  GetReviewsResponse,
  RespondToReviewRequest,
  AnalyticsOverview,
} from '@/types/dashboard';

const client = hc<AppType>(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
  fetch: (input, init) => {
    return fetch(input, {
      ...init,
      credentials: 'include', // Include cookies in requests
    });
  },
});

/**
 * Get current authenticated seller info
 */
export async function getCurrentSeller(): Promise<{
  sellerId: string;
  businessName: string;
  email: string;
  userId: string;
}> {
  const res = await client.api.seller.auth.me.$get();

  if (!res.ok) {
    throw new Error('Failed to fetch seller info');
  }

  const data = await res.json();
  return data.data;
}

/**
 * Logout seller and clear session
 */
export async function logoutSeller(): Promise<void> {
  const res = await client.api.seller.auth.logout.$post();

  if (!res.ok) {
    throw new Error('Failed to logout');
  }
}

/**
 * Get dashboard overview statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await client.api.seller.dashboard.stats.$get();

  if (!res.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }

  return res.json();
}

/**
 * Get seller's bookings with filtering and pagination
 */
export async function getBookings(params?: GetBookingsParams): Promise<GetBookingsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.status) {
    if (Array.isArray(params.status)) {
      params.status.forEach((s) => queryParams.append('status', s));
    } else {
      queryParams.append('status', params.status);
    }
  }

  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const res = await client.api.seller.dashboard.bookings.$get({
    query: Object.fromEntries(queryParams),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch bookings');
  }

  return res.json();
}

/**
 * Get earnings summary and breakdown
 */
export async function getEarnings(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<EarningsSummary> {
  const queryParams = new URLSearchParams();

  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const res = await client.api.seller.dashboard.earnings.$get({
    query: Object.fromEntries(queryParams),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch earnings');
  }

  return res.json();
}

/**
 * Get payout history
 */
export async function getPayouts(params?: { page?: number; limit?: number }): Promise<{
  payouts: Payout[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const res = await client.api.seller.dashboard.payouts.$get({
    query: Object.fromEntries(queryParams),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch payouts');
  }

  return res.json();
}

/**
 * Get reviews for seller's listings
 */
export async function getReviews(params?: GetReviewsParams): Promise<GetReviewsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.status) queryParams.append('status', params.status);
  if (params?.hasResponse !== undefined) {
    queryParams.append('hasResponse', params.hasResponse.toString());
  }
  if (params?.minRating) queryParams.append('minRating', params.minRating.toString());
  if (params?.maxRating) queryParams.append('maxRating', params.maxRating.toString());
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const res = await client.api.seller.dashboard.reviews.$get({
    query: Object.fromEntries(queryParams),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch reviews');
  }

  return res.json();
}

/**
 * Respond to a customer review
 */
export async function respondToReview(
  data: RespondToReviewRequest
): Promise<{ message: string; reviewId: string }> {
  const res = await client.api.seller.dashboard.reviews[':reviewId'].respond.$post({
    param: { reviewId: data.reviewId },
    json: { response: data.response },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to respond to review');
  }

  return res.json();
}

/**
 * Get analytics data for charts and trends
 */
export async function getAnalytics(params?: {
  period?: 'today' | 'week' | 'month' | 'year';
}): Promise<AnalyticsOverview> {
  const queryParams = new URLSearchParams();

  if (params?.period) queryParams.append('period', params.period);

  const res = await client.api.seller.dashboard.analytics.$get({
    query: Object.fromEntries(queryParams),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch analytics');
  }

  return res.json();
}
