import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, User, CreditCard, MapPin, Clock, CheckCircle2, XCircle, AlertCircle, Package } from 'lucide-react';
import { useState } from 'react';
import { useCustomerBookings } from '@/lib/api/bookings';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/customer/bookings')({
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession();
    if (!session) {
      throw new Error('Unauthorized');
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const { data, isLoading } = useCustomerBookings();

  const bookings = data?.data || [];

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter((item: any) => {
    if (activeTab === 'all') return true;
    return item.booking?.approvalStatus === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <Clock className="h-4 w-4 mr-1" />
            Pending Approval
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Confirmed
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            <XCircle className="h-4 w-4 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="h-4 w-4 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage all your bookings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Bookings</TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {bookings.filter((item: any) => item.booking?.approvalStatus === 'pending').length > 0 && (
                <span className="ml-2 bg-yellow-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {bookings.filter((item: any) => item.booking?.approvalStatus === 'pending').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Confirmed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === 'all'
                    ? "You haven't made any bookings yet"
                    : `No ${activeTab} bookings`}
                </p>
                <Button onClick={() => navigate({ to: '/' })}>
                  Start Exploring
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((item: any) => {
                  const booking = item.booking;
                  const listing = item.listing;
                  const seller = item.seller;

                  return (
                    <Card key={booking.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4 flex-1">
                          {listing?.images?.[0] && (
                            <img
                              src={listing.images[0].url}
                              alt={listing.title}
                              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{listing?.title}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-4 w-4" />
                              {typeof listing?.location === 'string'
                                ? listing.location
                                : `${listing?.location?.city}, ${listing?.location?.district}`}
                            </p>
                            {seller && (
                              <p className="text-sm text-muted-foreground mt-1">
                                by {seller.businessName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(booking.approvalStatus)}
                          <span className="text-lg font-bold">
                            ৳{parseFloat(booking.totalAmount).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                            <User className="h-4 w-4" />
                            Booking ID
                          </p>
                          <p className="font-mono text-sm font-medium">{booking.id}</p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                            <Calendar className="h-4 w-4" />
                            {booking.checkInDate ? 'Check-in' : 'Service Date'}
                          </p>
                          {booking.checkInDate ? (
                            <div>
                              <p className="text-sm font-medium">
                                {new Date(booking.checkInDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                to {new Date(booking.checkOutDate).toLocaleDateString()}
                              </p>
                            </div>
                          ) : booking.serviceDate ? (
                            <p className="text-sm font-medium">
                              {new Date(booking.serviceDate).toLocaleDateString()}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">N/A</p>
                          )}
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                            <CreditCard className="h-4 w-4" />
                            Payment Method
                          </p>
                          <p className="text-sm font-medium">
                            {booking.paymentMethod === 'bkash'
                              ? 'bKash'
                              : booking.paymentMethod === 'nagad'
                              ? 'Nagad'
                              : booking.paymentMethod}
                          </p>
                          <p className="text-xs text-muted-foreground">{booking.transactionId}</p>
                        </div>
                      </div>

                      {booking.approvalStatus === 'pending' && (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <p className="text-sm text-yellow-900 dark:text-yellow-100 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <strong>Waiting for seller approval.</strong>
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            The seller will review your payment within 24 hours. You'll receive an
                            email notification once approved.
                          </p>
                        </div>
                      )}

                      {booking.approvalStatus === 'approved' && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-sm text-green-900 dark:text-green-100 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <strong>Booking confirmed!</strong>
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                            Your booking has been approved. Check your email for the confirmation
                            receipt and ticket.
                          </p>
                        </div>
                      )}

                      {booking.approvalStatus === 'rejected' && booking.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-900 dark:text-red-100 flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            <strong>Booking rejected</strong>
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                            Reason: {booking.rejectionReason}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                          Booked on {new Date(booking.createdAt).toLocaleDateString()} at{' '}
                          {new Date(booking.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
