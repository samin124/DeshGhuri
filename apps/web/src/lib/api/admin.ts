import { env } from '@DeshGhuri/env/web';

const API_BASE = env.VITE_SERVER_URL;

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
  heroTitle: string;
  heroSubtitle: string;
  sectionVisibility: HomepageSectionVisibility;
  updatedAt: string;
  updatedBy: string | null;
}

// Helper to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// Helper to make authenticated requests
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  return handleResponse<T>(response);
}

// Dashboard API
export const adminDashboard = {
  getStats: () =>
    apiRequest<{
      users: { total: number; newToday: number };
      sellers: { total: number; pendingVerification: number; inReview: number; approved: number };
      documents: { total: number; pending: number };
      admins: { total: number };
    }>('/api/admin/dashboard/stats'),

  getPendingActions: () =>
    apiRequest<{
      pendingSellers: any[];
      inReviewSellers: any[];
      pendingDocuments: any[];
    }>('/api/admin/dashboard/pending-actions'),
};

// Content API
export const adminContent = {
  getHomepage: () =>
    apiRequest<{
      success: boolean;
      data: HomepageConfigResponse;
    }>('/api/admin/content/homepage'),

  updateHomepage: (
    data: Partial<Pick<HomepageConfigResponse, 'heroTitle' | 'heroSubtitle'>> & {
      sectionVisibility?: Partial<HomepageSectionVisibility>;
    }
  ) =>
    apiRequest<{
      success: boolean;
      message: string;
      data: HomepageConfigResponse;
    }>('/api/admin/content/homepage', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// Users API
export const adminUsers = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.set(key, String(value));
      });
    }
    return apiRequest<{
      users: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/admin/users?${query}`);
  },

  getById: (id: string) => apiRequest<{ user: any; seller: any | null }>(`/api/admin/users/${id}`),

  update: (id: string, data: { action: string; email?: string; reason?: string }) =>
    apiRequest<{ user: any; message: string }>(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string, reason: string) =>
    apiRequest<{ message: string }>(`/api/admin/users/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    }),

  addRole: (id: string, role: string) =>
    apiRequest<{ message: string }>(`/api/admin/users/${id}/roles`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  removeRole: (id: string, roleId: string) =>
    apiRequest<{ message: string }>(`/api/admin/users/${id}/roles/${roleId}`, {
      method: 'DELETE',
    }),
};

// Sellers API
export const adminSellers = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.set(key, String(value));
      });
    }
    return apiRequest<{
      sellers: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/admin/sellers?${query}`);
  },

  getVerificationQueue: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.set(key, String(value));
      });
    }
    return apiRequest<{
      sellers: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/admin/sellers/verification-queue?${query}`);
  },

  getById: (id: string) => apiRequest<{ seller: any }>(`/api/admin/sellers/${id}`),

  updateVerification: (
    id: string,
    data: {
      status: 'approved' | 'rejected' | 'in-review' | 'incomplete';
      reason?: string;
      message: string;
    }
  ) =>
    apiRequest<{ seller: any; message: string }>(`/api/admin/sellers/${id}/verification`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: {
      businessName?: string;
      contactEmail?: string;
      contactPhone?: string;
      businessDescription?: string;
      reason: string;
    }
  ) =>
    apiRequest<{ seller: any; message: string }>(`/api/admin/sellers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// Documents API
export const adminDocuments = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    documentType?: string;
    sellerId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.set(key, String(value));
      });
    }
    return apiRequest<{
      documents: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/admin/documents?${query}`);
  },

  getById: (id: string) => apiRequest<{ document: any }>(`/api/admin/documents/${id}`),

  review: (id: string, data: { status: 'approved' | 'rejected'; rejectionReason?: string }) =>
    apiRequest<{ document: any; message: string; documentsReviewStatus?: any }>(
      `/api/admin/documents/${id}/review`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    ),

  bulkReview: (
    sellerId: string,
    data: { status: 'approved' | 'rejected'; rejectionReason?: string }
  ) =>
    apiRequest<{ message: string; count: number }>(`/api/admin/documents/${sellerId}/bulk-review`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Listings API
export const adminListings = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    sellerId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.set(key, String(value));
      });
    }
    return apiRequest<{
      listings: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/admin/listings?${query}`);
  },

  getReviewQueue: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.set(key, String(value));
      });
    }
    return apiRequest<{
      listings: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/admin/listings/review-queue?${query}`);
  },

  getById: (id: string) => apiRequest<{ listing: any }>(`/api/admin/listings/${id}`),

  review: (
    id: string,
    data: {
      status: 'approved' | 'rejected';
      rejectionReason?: string;
      featured?: boolean;
    }
  ) =>
    apiRequest<{ message: string }>(`/api/admin/listings/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: {
      status?: 'approved' | 'rejected' | 'paused' | 'active';
      featured?: boolean;
      reason: string;
    }
  ) =>
    apiRequest<{ message: string }>(`/api/admin/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string, reason: string) =>
    apiRequest<{ message: string }>(`/api/admin/listings/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    }),
};

// Bookings API
export const adminBookings = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.set(key, String(value));
      });
    }
    return apiRequest<{
      bookings: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/admin/bookings?${query}`);
  },

  getStats: () =>
    apiRequest<{
      total: number;
      today: number;
      thisWeek: number;
      thisMonth: number;
      byStatus: Record<string, number>;
      revenue: Record<string, number>;
    }>('/api/admin/bookings/stats'),

  getById: (id: string) => apiRequest<{ booking: any }>(`/api/admin/bookings/${id}`),

  cancel: (
    id: string,
    data: {
      reason: string;
      refundAmount?: number;
      notifyCustomer?: boolean;
    }
  ) =>
    apiRequest<{ message: string }>(`/api/admin/bookings/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateStatus: (
    id: string,
    data: {
      status: 'confirmed' | 'completed' | 'cancelled' | 'disputed';
      reason: string;
    }
  ) =>
    apiRequest<{ message: string }>(`/api/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  addNote: (id: string, note: string) =>
    apiRequest<{ message: string; note: string }>(`/api/admin/bookings/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),
};

// Transactions API
export const adminTransactions = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.set(key, String(value));
      });
    }
    return apiRequest<{
      transactions: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/admin/transactions?${query}`);
  },

  getStats: () =>
    apiRequest<{
      total: Record<string, number>;
      thisMonth: Record<string, number>;
      volume: Record<string, number>;
    }>('/api/admin/transactions/stats'),

  getEscrowOverview: () =>
    apiRequest<{
      summary: Record<string, number>;
      escrows: any[];
    }>('/api/admin/transactions/escrow'),

  processRefund: (data: {
    bookingId: string;
    amount: number;
    reason: string;
    notifyCustomer?: boolean;
  }) =>
    apiRequest<{ message: string; refund: any }>('/api/admin/transactions/refund', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  releaseEscrow: (
    id: string,
    data: {
      reason: string;
      amount?: number;
    }
  ) =>
    apiRequest<{ message: string }>(`/api/admin/transactions/escrow/${id}/release`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  holdEscrow: (id: string, reason: string) =>
    apiRequest<{ message: string }>(`/api/admin/transactions/escrow/${id}/hold`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  getById: (id: string) => apiRequest<{ transaction: any }>(`/api/admin/transactions/${id}`),
};

// Audit Logs API
export const adminAuditLogs = {
  list: (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.set(key, String(value));
      });
    }
    return apiRequest<{
      logs: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/admin/audit-logs?${query}`);
  },

  getStats: () =>
    apiRequest<{
      total: number;
      last24h: number;
      last7days: number;
      topActions: { action: string; count: number }[];
      topEntityTypes: { entityType: string; count: number }[];
      topAdmins: { userId: string; count: number; user: any }[];
    }>('/api/admin/audit-logs/stats'),

  getById: (id: string) => apiRequest<{ log: any }>(`/api/admin/audit-logs/${id}`),

  export: (params?: { startDate?: string; endDate?: string; userId?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.set(key, String(value));
      });
    }
    return fetch(`${API_BASE}/api/admin/audit-logs/export?${query}`, {
      credentials: 'include',
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Export failed');
      }
      return response.blob();
    });
  },
};
