import { createFileRoute } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  User,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  MapPin,
} from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const Route = createFileRoute('/seller/dashboard/bookings/')({
  component: RouteComponent,
});

const API_URL = 'http://localhost:3000';

interface ListingLocation {
  city?: string;
  district?: string;
  address?: string;
}

interface ListingImage {
  url: string;
  storageKey?: string;
  caption?: string;
  isPrimary?: boolean;
}

interface BookingGuestDetails {
  primaryGuest?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  adults?: number;
  children?: number;
  totalGuests?: number;
}

interface BookingPaymentDetails {
  accountNumber?: string;
  accountHolderName?: string;
  transactionDate?: string;
  notes?: string;
}

interface SellerBooking {
  id: string;
  listingId: string;
  customerId: string;
  status: string;
  paymentStatus: string;
  approvalStatus: string;
  baseAmount: string;
  discountAmount: string;
  taxAmount: string;
  platformFee: string;
  totalAmount: string;
  guestDetails?: BookingGuestDetails | null;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  serviceDate?: string | null;
  specialRequests?: string | null;
  paymentMethod?: string | null;
  transactionId?: string | null;
  paymentDetails?: BookingPaymentDetails | null;
  createdAt: string;
  holdExpiresAt?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
}

interface SellerBookingListing {
  id: string;
  title?: string | null;
  category?: string | null;
  images?: ListingImage[] | null;
  location?: ListingLocation | string | null;
  description?: string | null;
  basePrice?: string | null;
  priceUnit?: string | null;
  capacity?: number | null;
  minGuests?: number | null;
  maxGuests?: number | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
}

interface SellerBookingCustomer {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  phoneNumber?: string | null;
}

interface SellerBookingItem {
  booking: SellerBooking;
  listing: SellerBookingListing | null;
  customer: SellerBookingCustomer | null;
}

interface SellerBookingsResponse {
  success: boolean;
  data: SellerBookingItem[];
  count: number;
}

interface SellerBookingDetailsResponse {
  success: boolean;
  data: SellerBookingItem;
}

// API Functions
async function getSellerBookings(statusFilter?: string): Promise<SellerBookingsResponse> {
  const url = statusFilter
    ? `${API_URL}/api/seller/bookings?approvalStatus=${statusFilter}`
    : `${API_URL}/api/seller/bookings`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }

  return response.json();
}

async function getSellerBookingDetails(bookingId: string): Promise<SellerBookingDetailsResponse> {
  const response = await fetch(`${API_URL}/api/seller/bookings/${bookingId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch booking details');
  }

  return response.json();
}

async function approvePayment(
  bookingId: string,
  action: 'approve' | 'reject',
  rejectionReason?: string
): Promise<{ success: boolean; data: SellerBooking; message: string }> {
  const response = await fetch(`${API_URL}/api/seller/bookings/${bookingId}/approve-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ action, rejectionReason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to process approval');
  }

  return response.json();
}

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString();
};

const formatDateTime = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
};

const formatCurrency = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return 'N/A';
  const amount = typeof value === 'number' ? value : Number.parseFloat(value);
  if (Number.isNaN(amount)) return 'N/A';
  return `BDT ${amount.toLocaleString()}`;
};

const formatPaymentMethod = (value?: string | null) => {
  if (!value) return 'N/A';
  if (value === 'bkash') return 'bKash';
  if (value === 'nagad') return 'Nagad';
  return value;
};

const formatLabel = (value?: string | null) => {
  if (!value) return 'N/A';
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatLocation = (location?: ListingLocation | string | null) => {
  if (!location) return 'Location not available';
  if (typeof location === 'string') return location;
  const normalizedLocation = [location.city, location.district, location.address]
    .filter(Boolean)
    .join(', ');
  return normalizedLocation || 'Location not available';
};

function DetailField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-words">{value || 'N/A'}</p>
    </div>
  );
}

function RouteComponent() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState<SellerBookingItem | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<SellerBookingsResponse, Error>({
    queryKey: ['seller-bookings', activeTab],
    queryFn: () => getSellerBookings(activeTab === 'all' ? undefined : activeTab),
    retry: 1,
  });

  const {
    data: selectedBookingDetails,
    isLoading: isBookingDetailsLoading,
    error: selectedBookingDetailsError,
  } = useQuery<SellerBookingDetailsResponse, Error>({
    queryKey: ['seller-booking-details', selectedBooking?.booking.id],
    queryFn: () => getSellerBookingDetails(selectedBooking!.booking.id),
    enabled: !!selectedBooking?.booking.id,
    retry: 1,
  });

  const approvalMutation = useMutation({
    mutationFn: ({
      bookingId,
      action,
      rejectionReason,
    }: {
      bookingId: string;
      action: 'approve' | 'reject';
      rejectionReason?: string;
    }) => approvePayment(bookingId, action, rejectionReason),
    onSuccess: (_, variables) => {
      toast.success(
        variables.action === 'approve' ? 'Booking approved successfully!' : 'Booking rejected'
      );
      queryClient.invalidateQueries({ queryKey: ['seller-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setSelectedBooking(null);
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message || 'Failed to process approval');
    },
  });

  const bookings = data?.data || [];
  const bookingDetails = selectedBookingDetails?.data ?? selectedBooking;
  const bookingDetailsBooking = bookingDetails?.booking;
  const bookingDetailsListing = bookingDetails?.listing;
  const bookingDetailsCustomer = bookingDetails?.customer;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApprove = (bookingId: string) => {
    if (confirm('Are you sure you want to approve this booking?')) {
      approvalMutation.mutate({ bookingId, action: 'approve' });
    }
  };

  const handleReject = (bookingId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      approvalMutation.mutate({ bookingId, action: 'reject', rejectionReason: reason });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Booking Management</h1>
        <p className="text-muted-foreground mt-2">Review and approve customer bookings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {error ? (
            <Card className="p-12 text-center">
              <p className="text-destructive font-semibold mb-2">Error loading bookings</p>
              <p className="text-muted-foreground text-sm">{error.message}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </Card>
          ) : isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No {activeTab !== 'all' ? activeTab : ''} bookings found
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                When customers make bookings for your listings, they will appear here.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((item) => {
                const booking = item.booking;
                const listing = item.listing;
                const customer = item.customer;

                return (
                  <Card key={booking.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{listing?.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {formatLocation(listing?.location)}
                        </p>
                      </div>
                      {getStatusBadge(booking.approvalStatus)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Customer
                        </p>
                        <p className="font-medium mt-1">{customer?.name}</p>
                        <p className="text-sm text-muted-foreground">{customer?.email}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Dates
                        </p>
                        {booking.checkInDate ? (
                          <>
                            <p className="font-medium mt-1 text-sm">
                              {formatDate(booking.checkInDate)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              to {formatDate(booking.checkOutDate)}
                            </p>
                          </>
                        ) : booking.serviceDate ? (
                          <p className="font-medium mt-1">{formatDate(booking.serviceDate)}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">N/A</p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          Payment
                        </p>
                        <p className="font-medium mt-1">
                          {formatPaymentMethod(booking.paymentMethod)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.transactionId || 'N/A'}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-semibold text-lg mt-1">
                          {formatCurrency(booking.totalAmount)}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <p className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Booked on {formatDateTime(booking.createdAt)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBooking(item)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>

                        {booking.approvalStatus === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-300 hover:bg-green-50"
                              onClick={() => handleApprove(booking.id)}
                              disabled={approvalMutation.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => handleReject(booking.id)}
                              disabled={approvalMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {booking.rejectionReason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-900">Rejection Reason:</p>
                        <p className="text-sm text-red-700 mt-1">{booking.rejectionReason}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              View full listing information and customer booking submission details.
            </DialogDescription>
          </DialogHeader>

          {isBookingDetailsLoading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
              <p className="mt-3 text-sm text-muted-foreground">Loading booking details...</p>
            </div>
          ) : selectedBookingDetailsError ? (
            <Card className="p-4 border-destructive/40">
              <p className="text-sm font-medium text-destructive">Failed to load booking details</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedBookingDetailsError.message}
              </p>
            </Card>
          ) : bookingDetailsBooking ? (
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold text-base mb-3">Listing Information</h3>
                <div className="space-y-3">
                  {bookingDetailsListing?.images?.[0]?.url && (
                    <img
                      src={bookingDetailsListing.images[0].url}
                      alt={bookingDetailsListing?.title || 'Listing'}
                      className="w-full h-52 object-cover rounded-md"
                    />
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <DetailField label="Listing Title" value={bookingDetailsListing?.title} />
                    <DetailField
                      label="Listing ID"
                      value={bookingDetailsListing?.id || bookingDetailsBooking.listingId}
                    />
                    <DetailField
                      label="Category"
                      value={formatLabel(bookingDetailsListing?.category)}
                    />
                    <DetailField
                      label="Location"
                      value={formatLocation(bookingDetailsListing?.location)}
                    />
                    {bookingDetailsListing?.basePrice && (
                      <DetailField
                        label="Base Price"
                        value={formatCurrency(bookingDetailsListing.basePrice)}
                      />
                    )}
                    {bookingDetailsListing?.priceUnit && (
                      <DetailField
                        label="Price Unit"
                        value={formatLabel(bookingDetailsListing.priceUnit)}
                      />
                    )}
                    {bookingDetailsListing?.capacity !== undefined &&
                      bookingDetailsListing?.capacity !== null && (
                        <DetailField
                          label="Capacity"
                          value={String(bookingDetailsListing.capacity)}
                        />
                      )}
                    {(bookingDetailsListing?.minGuests || bookingDetailsListing?.maxGuests) && (
                      <DetailField
                        label="Guest Range"
                        value={`${bookingDetailsListing?.minGuests || 1} - ${
                          bookingDetailsListing?.maxGuests || 'N/A'
                        }`}
                      />
                    )}
                  </div>

                  {bookingDetailsListing?.description && (
                    <div>
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="text-sm mt-1 whitespace-pre-wrap">
                        {bookingDetailsListing.description}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold text-base mb-3">Customer Details</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <DetailField label="Customer Name" value={bookingDetailsCustomer?.name} />
                  <DetailField label="Customer Email" value={bookingDetailsCustomer?.email} />
                  <DetailField
                    label="Customer ID"
                    value={bookingDetailsCustomer?.id || bookingDetailsBooking.customerId}
                  />
                  <DetailField
                    label="Customer Phone"
                    value={bookingDetailsCustomer?.phone || bookingDetailsCustomer?.phoneNumber}
                  />
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold text-base mb-3">Booking Submission Details</h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <DetailField label="Booking ID" value={bookingDetailsBooking.id} />
                  <DetailField
                    label="Approval Status"
                    value={formatLabel(bookingDetailsBooking.approvalStatus)}
                  />
                  <DetailField
                    label="Booking Status"
                    value={formatLabel(bookingDetailsBooking.status)}
                  />
                  <DetailField
                    label="Payment Status"
                    value={formatLabel(bookingDetailsBooking.paymentStatus)}
                  />
                  <DetailField
                    label="Payment Method"
                    value={formatPaymentMethod(bookingDetailsBooking.paymentMethod)}
                  />
                  <DetailField label="Transaction ID" value={bookingDetailsBooking.transactionId} />
                  <DetailField
                    label="Total Amount"
                    value={formatCurrency(bookingDetailsBooking.totalAmount)}
                  />
                  <DetailField
                    label="Base Amount"
                    value={formatCurrency(bookingDetailsBooking.baseAmount)}
                  />
                  <DetailField
                    label="Discount"
                    value={formatCurrency(bookingDetailsBooking.discountAmount)}
                  />
                  <DetailField
                    label="Tax"
                    value={formatCurrency(bookingDetailsBooking.taxAmount)}
                  />
                  <DetailField
                    label="Platform Fee"
                    value={formatCurrency(bookingDetailsBooking.platformFee)}
                  />
                  <DetailField
                    label="Booked At"
                    value={formatDateTime(bookingDetailsBooking.createdAt)}
                  />
                  {bookingDetailsBooking.checkInDate && (
                    <DetailField
                      label="Check-in Date"
                      value={formatDate(bookingDetailsBooking.checkInDate)}
                    />
                  )}
                  {bookingDetailsBooking.checkOutDate && (
                    <DetailField
                      label="Check-out Date"
                      value={formatDate(bookingDetailsBooking.checkOutDate)}
                    />
                  )}
                  {bookingDetailsBooking.serviceDate && (
                    <DetailField
                      label="Service Date"
                      value={formatDate(bookingDetailsBooking.serviceDate)}
                    />
                  )}
                  <DetailField
                    label="Total Guests"
                    value={
                      bookingDetailsBooking.guestDetails?.totalGuests !== undefined
                        ? String(bookingDetailsBooking.guestDetails.totalGuests)
                        : null
                    }
                  />
                  <DetailField
                    label="Adults"
                    value={
                      bookingDetailsBooking.guestDetails?.adults !== undefined
                        ? String(bookingDetailsBooking.guestDetails.adults)
                        : null
                    }
                  />
                  <DetailField
                    label="Children"
                    value={
                      bookingDetailsBooking.guestDetails?.children !== undefined
                        ? String(bookingDetailsBooking.guestDetails.children)
                        : null
                    }
                  />
                  <DetailField
                    label="Primary Guest Name"
                    value={bookingDetailsBooking.guestDetails?.primaryGuest?.name}
                  />
                  <DetailField
                    label="Primary Guest Email"
                    value={bookingDetailsBooking.guestDetails?.primaryGuest?.email}
                  />
                  <DetailField
                    label="Primary Guest Phone"
                    value={bookingDetailsBooking.guestDetails?.primaryGuest?.phone}
                  />
                  {bookingDetailsBooking.holdExpiresAt && (
                    <DetailField
                      label="Hold Expires At"
                      value={formatDateTime(bookingDetailsBooking.holdExpiresAt)}
                    />
                  )}
                  {bookingDetailsBooking.approvedAt && (
                    <DetailField
                      label="Approved At"
                      value={formatDateTime(bookingDetailsBooking.approvedAt)}
                    />
                  )}
                </div>

                {bookingDetailsBooking.paymentDetails && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-3">Submitted Payment Details</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <DetailField
                        label="Account Number"
                        value={bookingDetailsBooking.paymentDetails.accountNumber}
                      />
                      <DetailField
                        label="Account Holder Name"
                        value={bookingDetailsBooking.paymentDetails.accountHolderName}
                      />
                      <DetailField
                        label="Transaction Date"
                        value={bookingDetailsBooking.paymentDetails.transactionDate}
                      />
                      <DetailField
                        label="Notes"
                        value={bookingDetailsBooking.paymentDetails.notes}
                      />
                    </div>
                  </div>
                )}

                {bookingDetailsBooking.specialRequests && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">Special Requests</p>
                    <p className="text-sm mt-1 whitespace-pre-wrap">
                      {bookingDetailsBooking.specialRequests}
                    </p>
                  </div>
                )}

                {bookingDetailsBooking.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-900">Rejection Reason</p>
                    <p className="text-sm text-red-700 mt-1">
                      {bookingDetailsBooking.rejectionReason}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No booking details found.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
