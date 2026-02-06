// ============================================================================
// SELLER DASHBOARD TYPES
// ============================================================================

export type ListingCategory = 'hotel' | 'tour-package' | 'experience' | 'transport';
export type ListingStatus = 'draft' | 'pending-review' | 'active' | 'paused' | 'rejected';
export type CancellationPolicy = 'flexible' | 'moderate' | 'strict' | 'non-refundable';
export type PriceUnit = 'per-person' | 'per-night' | 'per-booking';

export interface ListingLocation {
  city: string;
  district: string;
  address: string;
  landmark?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface GroupPricingTier {
  minParticipants: number;
  maxParticipants: number;
  discountPercentage: number;
  pricePerPerson: number;
}

export interface ListingImage {
  url: string;
  storageKey: string;
  caption?: string;
  isPrimary: boolean;
}

export interface SellerListing {
  id: string;
  sellerId: string;
  title: string;
  slug: string;
  description: string;
  category: ListingCategory;
  location: ListingLocation;
  basePrice: string;
  currency: string;
  priceUnit: PriceUnit;
  capacity: number;
  minGuests: number;
  maxGuests: number;
  groupEligible: boolean;
  groupPricingTiers?: GroupPricingTier[];
  amenities: string[];
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: CancellationPolicy;
  houseRules?: string;
  checkInTime?: string;
  checkOutTime?: string;
  images: ListingImage[];
  status: ListingStatus;
  rejectionReason?: string;
  viewCount: number;
  bookingCount: number;
  rating?: string;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// ============================================================================
// BOOKINGS
// ============================================================================

export type BookingType = 'individual' | 'group';
export type BookingStatus =
  | 'draft'
  | 'hold'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'disputed'
  | 'refunded';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'bkash' | 'nagad' | 'card' | 'bank-transfer';

export interface GuestDetails {
  primaryGuest: {
    name: string;
    email: string;
    phone: string;
  };
  adults: number;
  children: number;
  totalGuests: number;
}

export interface SellerBooking {
  id: string;
  listingId: string;
  sellerId: string;
  customerId: string;
  bookingType: BookingType;
  groupBookingId?: string;
  guestDetails: GuestDetails;
  checkInDate?: string;
  checkOutDate?: string;
  serviceDate?: string;
  baseAmount: string;
  discountAmount: string;
  taxAmount: string;
  platformFee: string;
  totalAmount: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  paidAt?: string;
  status: BookingStatus;
  holdExpiresAt?: string;
  priceLockEnabled: boolean;
  splitPaymentEnabled: boolean;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  refundAmount?: string;
  refundProcessedAt?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  listing?: {
    id: string;
    title: string;
    category: string;
    images: ListingImage[];
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

// ============================================================================
// REVIEWS
// ============================================================================

export type ReviewStatus = 'published' | 'hidden' | 'flagged';

export interface CategoryRatings {
  cleanliness?: number;
  communication?: number;
  accuracy?: number;
  value?: number;
  location?: number;
}

export interface ReviewPhoto {
  url: string;
  storageKey: string;
}

export interface SellerReview {
  id: string;
  listingId: string;
  bookingId: string;
  customerId: string;
  sellerId: string;
  overallRating: number;
  ratings?: CategoryRatings;
  title?: string;
  comment: string;
  photos: ReviewPhoto[];
  sellerResponse?: string;
  respondedAt?: string;
  helpfulCount: number;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  customer?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  listing?: {
    id: string;
    title: string;
    category: string;
  };
  booking?: {
    id: string;
    serviceDate?: string;
  };
}

// ============================================================================
// ESCROW & PAYOUTS
// ============================================================================

export type EscrowStatus =
  | 'created'
  | 'pending-proof'
  | 'proof-submitted'
  | 'proof-verified'
  | 'proof-rejected'
  | 'on-hold'
  | 'released'
  | 'refunded';

export interface EscrowTransaction {
  id: string;
  bookingId: string;
  sellerId: string;
  amount: string;
  platformFee: string;
  sellerAmount: string;
  status: EscrowStatus;
  proofSubmittedAt?: string;
  proofVerifiedAt?: string;
  proofRejectedAt?: string;
  proofRejectionReason?: string;
  releaseScheduledAt?: string;
  releasedAt?: string;
  disputeId?: string;
  createdAt: string;
  updatedAt: string;
  // Populated
  booking?: {
    id: string;
    serviceDate?: string;
    listing?: {
      title: string;
    };
  };
}

export interface ProofFile {
  url: string;
  storageKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface ProofOfCompletion {
  id: string;
  escrowTransactionId: string;
  bookingId: string;
  sellerId: string;
  files: ProofFile[];
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  attemptNumber: number;
  submittedAt: string;
}

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface BankDetails {
  bankName: string;
  branchName: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber?: string;
  accountType: string;
}

export interface Payout {
  id: string;
  sellerId: string;
  amount: string;
  currency: string;
  bankDetails: BankDetails;
  escrowTransactionIds: string[];
  status: PayoutStatus;
  processedAt?: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  transactionReference?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface ListingAnalytics {
  id: string;
  listingId: string;
  sellerId: string;
  date: string;
  views: number;
  uniqueViews: number;
  bookings: number;
  revenue: string;
  wishlistAdds: number;
  shares: number;
  viewToBookingRate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerAnalytics {
  id: string;
  sellerId: string;
  date: string;
  totalViews: number;
  totalBookings: number;
  totalRevenue: string;
  activeListings: number;
  averageRating?: string;
  conversionRate?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DASHBOARD DATA
// ============================================================================

export interface DashboardStats {
  // Today's stats
  todayBookings: number;
  todayRevenue: string;
  todayViews: number;

  // Pending actions
  pendingProofs: number;
  unansweredReviews: number;
  upcomingBookings: number;

  // Overall stats
  totalListings: number;
  activeListings: number;
  totalBookings: number;
  totalRevenue: string;
  averageRating?: number;
  totalReviews: number;

  // Earnings
  pendingEarnings: string;
  releasedEarnings: string;
  totalEarnings: string;
}

export interface EarningsSummary {
  pending: {
    amount: string;
    count: number;
    transactions: EscrowTransaction[];
  };
  released: {
    amount: string;
    count: number;
    readyForPayout: string;
  };
  withdrawn: {
    amount: string;
    count: number;
  };
  total: {
    amount: string;
    count: number;
  };
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  bookings: number;
}

export interface AnalyticsOverview {
  // Period comparison
  period: 'today' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;

  // Metrics
  totalViews: number;
  uniqueViews: number;
  totalBookings: number;
  totalRevenue: string;
  conversionRate: number;

  // Change from previous period
  viewsChange: number;
  bookingsChange: number;
  revenueChange: number;
  conversionChange: number;

  // Charts data
  revenueChart: RevenueChartData[];
  viewsChart: { date: string; views: number }[];
  topListings: Array<{
    id: string;
    title: string;
    views: number;
    bookings: number;
    revenue: string;
  }>;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface GetBookingsParams {
  status?: BookingStatus | BookingStatus[];
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'serviceDate' | 'createdAt' | 'totalAmount';
  sortOrder?: 'asc' | 'desc';
}

export interface GetBookingsResponse {
  bookings: SellerBooking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetReviewsParams {
  status?: ReviewStatus;
  hasResponse?: boolean;
  minRating?: number;
  maxRating?: number;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'overallRating';
  sortOrder?: 'asc' | 'desc';
}

export interface GetReviewsResponse {
  reviews: SellerReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

export interface GetEarningsParams {
  startDate?: string;
  endDate?: string;
  status?: EscrowStatus[];
}

export interface RespondToReviewRequest {
  reviewId: string;
  response: string;
}

export interface SubmitProofRequest {
  escrowTransactionId: string;
  files: File[];
  notes?: string;
}
