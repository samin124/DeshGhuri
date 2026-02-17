import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://localhost:3000';

export interface CreateBookingRequest {
  listingId: string;
  checkInDate?: string;
  checkOutDate?: string;
  serviceDate?: string;
  guestDetails: {
    primaryGuest: {
      name: string;
      email: string;
      phone: string;
    };
    adults: number;
    children: number;
    totalGuests: number;
  };
  specialRequests?: string;
  priceLockEnabled: boolean;
  promoCode?: string;
}

export interface SubmitPaymentRequest {
  bookingId: string;
  paymentMethod: 'bkash' | 'nagad' | 'card' | 'bank-transfer';
  transactionId: string;
  paymentDetails?: {
    accountNumber?: string;
    accountHolderName?: string;
    transactionDate?: string;
    notes?: string;
  };
}

export interface Booking {
  id: string;
  listingId: string;
  sellerId: string;
  customerId: string;
  status: string;
  paymentStatus: string;
  approvalStatus: string;
  baseAmount: string;
  discountAmount: string;
  taxAmount: string;
  platformFee: string;
  totalAmount: string;
  guestDetails: any;
  checkInDate?: string;
  checkOutDate?: string;
  serviceDate?: string;
  specialRequests?: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  holdExpiresAt?: string;
}

async function createBooking(
  data: CreateBookingRequest
): Promise<{ success: boolean; data: { booking: Booking; listing: any } }> {
  const response = await fetch(`${API_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create booking');
  }

  return response.json();
}

async function submitPayment(
  data: SubmitPaymentRequest
): Promise<{ success: boolean; data: Booking; message: string }> {
  const response = await fetch(`${API_URL}/api/bookings/${data.bookingId}/submit-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit payment');
  }

  return response.json();
}

async function getCustomerBookings(): Promise<{ success: boolean; data: any[] }> {
  const response = await fetch(`${API_URL}/api/bookings`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }

  return response.json();
}

async function getBookingById(bookingId: string): Promise<{ success: boolean; data: any }> {
  const response = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch booking');
  }

  return response.json();
}

async function cancelBooking(
  bookingId: string
): Promise<{ success: boolean; data: Booking; message: string }> {
  const response = await fetch(`${API_URL}/api/bookings/${bookingId}/cancel`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel booking');
  }

  return response.json();
}

// React Query hooks
export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useSubmitPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useCustomerBookings() {
  return useQuery({
    queryKey: ['customer-bookings'],
    queryFn: getCustomerBookings,
  });
}

export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBookingById(bookingId),
    enabled: !!bookingId,
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
