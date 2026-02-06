import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getBookings } from '@/lib/api/seller-dashboard';

export const Route = createFileRoute('/seller/dashboard/bookings')({
  component: SellerBookings,
});
import type { BookingStatus } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const statusColors: Record<BookingStatus, string> = {
  draft: 'bg-gray-500',
  hold: 'bg-yellow-500',
  confirmed: 'bg-green-500',
  completed: 'bg-blue-500',
  cancelled: 'bg-red-500',
  expired: 'bg-gray-400',
  disputed: 'bg-orange-500',
  refunded: 'bg-purple-500',
};

const statusLabels: Record<BookingStatus, string> = {
  draft: 'Draft',
  hold: 'On Hold',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
  disputed: 'Disputed',
  refunded: 'Refunded',
};

function SellerBookings() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<BookingStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['seller-bookings', page, status],
    queryFn: () =>
      getBookings({
        page,
        limit,
        status: status === 'all' ? undefined : status,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  // Filter bookings by search term (client-side)
  const filteredBookings = data?.bookings.filter((booking) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      booking.id.toLowerCase().includes(search) ||
      booking.listing?.title.toLowerCase().includes(search) ||
      booking.customer?.name.toLowerCase().includes(search) ||
      booking.customer?.email.toLowerCase().includes(search)
    );
  });

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load bookings. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground">
          View and manage all your bookings
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by booking ID, listing, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as BookingStatus | 'all');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {data && `${data.total} Booking${data.total !== 1 ? 's' : ''}`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredBookings && filteredBookings.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Listing</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service Date</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-sm">
                          {booking.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {booking.listing?.images[0] && (
                              <img
                                src={booking.listing.images.find(img => img.isPrimary)?.url || booking.listing.images[0].url}
                                alt={booking.listing.title}
                                className="h-10 w-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">
                                {booking.listing?.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {booking.listing?.category}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {booking.customer?.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {booking.customer?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {booking.serviceDate
                            ? format(new Date(booking.serviceDate), 'MMM dd, yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {booking.guestDetails.totalGuests}
                        </TableCell>
                        <TableCell className="font-medium">
                          ৳{parseFloat(booking.totalAmount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={statusColors[booking.status]}
                          >
                            {statusLabels[booking.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {data.page} of {data.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={page === data.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'No bookings found matching your search.'
                  : 'No bookings yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
