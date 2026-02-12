import { createFileRoute } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// API Functions
async function getSellerBookings(statusFilter?: string) {
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

async function approvePayment(
  bookingId: string,
  action: 'approve' | 'reject',
  rejectionReason?: string
) {
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

function RouteComponent() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['seller-bookings', activeTab],
    queryFn: () => getSellerBookings(activeTab === 'all' ? undefined : activeTab),
    retry: 1,
  });

  // Debug logging
  console.log('Seller Bookings Data:', data);
  console.log('Seller Bookings Error:', error);
  console.log('Seller Bookings Loading:', isLoading);

  const approvalMutation = useMutation({
    mutationFn: ({ bookingId, action, rejectionReason }: any) =>
      approvePayment(bookingId, action, rejectionReason),
    onSuccess: (_, variables) => {
      toast.success(
        variables.action === 'approve' ? 'Booking approved successfully!' : 'Booking rejected'
      );
      queryClient.invalidateQueries({ queryKey: ['seller-bookings'] });
      setSelectedBooking(null);
      setRejectionReason('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to process approval');
    },
  });

  const bookings = data?.data || [];

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
              <p className="text-muted-foreground text-sm">{(error as Error).message}</p>
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
              {bookings.map((item: any) => {
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
                          {typeof listing?.location === 'string'
                            ? listing.location
                            : `${listing?.location?.city}, ${listing?.location?.district}`}
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
                              {new Date(booking.checkInDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              to {new Date(booking.checkOutDate).toLocaleDateString()}
                            </p>
                          </>
                        ) : booking.serviceDate ? (
                          <p className="font-medium mt-1">
                            {new Date(booking.serviceDate).toLocaleDateString()}
                          </p>
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
                          {booking.paymentMethod === 'bkash'
                            ? 'bKash'
                            : booking.paymentMethod === 'nagad'
                              ? 'Nagad'
                              : booking.paymentMethod}
                        </p>
                        <p className="text-sm text-muted-foreground">{booking.transactionId}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-semibold text-lg mt-1">
                          ৳{parseFloat(booking.totalAmount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <p className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Booked on {new Date(booking.createdAt).toLocaleDateString()} at{' '}
                          {new Date(booking.createdAt).toLocaleTimeString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBooking(booking)}
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
    </div>
  );
}
