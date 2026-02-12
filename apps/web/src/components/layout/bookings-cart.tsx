import {
  ShoppingCart,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useCustomerBookings } from '@/lib/api/bookings';
import { Link } from '@tanstack/react-router';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { useQueryClient } from '@tanstack/react-query';

export function BookingsCart() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading } = useCustomerBookings();
  const bookings = isAuthenticated ? data?.data || [] : [];

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        const wasAuthenticated = isAuthenticated;
        const nowAuthenticated = !!session;

        setIsAuthenticated(nowAuthenticated);

        // If user logged out, invalidate queries
        if (wasAuthenticated && !nowAuthenticated) {
          queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
          queryClient.removeQueries({ queryKey: ['customer-bookings'] });
        }
      } catch (error) {
        setIsAuthenticated(false);
        queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
        queryClient.removeQueries({ queryKey: ['customer-bookings'] });
      }
    };

    checkAuth();

    // Check auth every 5 seconds
    const interval = setInterval(checkAuth, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, queryClient]);

  // Count bookings by status
  const pendingCount = bookings.filter(
    (item: any) => item.booking?.approvalStatus === 'pending'
  ).length;

  const totalCount = bookings.length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300"
          >
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {totalCount > 9 ? '9+' : totalCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">My Bookings</h3>
            {pendingCount > 0 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                {pendingCount} Pending
              </Badge>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No bookings yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start exploring and book your next adventure!
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="h-[400px] -mx-1 px-1">
                <div className="space-y-3">
                  {bookings.slice(0, 10).map((item: any) => {
                    const booking = item.booking;
                    const listing = item.listing;

                    return (
                      <div
                        key={booking.id}
                        className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex gap-3">
                          {listing?.images?.[0] && (
                            <img
                              src={listing.images[0].url}
                              alt={listing.title}
                              className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{listing?.title}</h4>

                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {typeof listing?.location === 'string'
                                ? listing.location
                                : `${listing?.location?.city}, ${listing?.location?.district}`}
                            </p>

                            {booking.checkInDate && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(booking.checkInDate).toLocaleDateString()}
                              </p>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm font-semibold">
                                ৳{parseFloat(booking.totalAmount).toLocaleString()}
                              </span>
                              {getStatusBadge(booking.approvalStatus)}
                            </div>

                            {booking.approvalStatus === 'pending' && booking.holdExpiresAt && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Expires: {new Date(booking.holdExpiresAt).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {booking.approvalStatus === 'pending' && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                              Waiting for seller approval
                            </p>
                          </div>
                        )}

                        {booking.approvalStatus === 'approved' && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs text-green-700 dark:text-green-400 mb-2">
                              ✓ Booking confirmed! Check your email for details.
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs flex-1"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(
                                      `http://localhost:3000/api/bookings/${booking.id}/ticket`,
                                      {
                                        credentials: 'include',
                                      }
                                    );
                                    if (response.ok) {
                                      const blob = await response.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `ticket-${booking.id}.pdf`;
                                      document.body.appendChild(a);
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                      document.body.removeChild(a);
                                    }
                                  } catch (error) {
                                    console.error('Error downloading ticket:', error);
                                  }
                                }}
                              >
                                <Ticket className="h-3 w-3 mr-1" />
                                Ticket
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs flex-1"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(
                                      `http://localhost:3000/api/bookings/${booking.id}/receipt`,
                                      {
                                        credentials: 'include',
                                      }
                                    );
                                    if (response.ok) {
                                      const blob = await response.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `receipt-${booking.id}.pdf`;
                                      document.body.appendChild(a);
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                      document.body.removeChild(a);
                                    }
                                  } catch (error) {
                                    console.error('Error downloading receipt:', error);
                                  }
                                }}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Receipt
                              </Button>
                            </div>
                          </div>
                        )}

                        {booking.approvalStatus === 'rejected' && booking.rejectionReason && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs text-red-700 dark:text-red-400">
                              Rejected: {booking.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <DropdownMenuSeparator className="my-3" />

              <Button asChild className="w-full" variant="outline">
                <Link to="/customer/bookings">View All Bookings</Link>
              </Button>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
