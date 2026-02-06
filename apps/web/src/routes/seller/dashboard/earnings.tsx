import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getEarnings } from '@/lib/api/seller-dashboard';

export const Route = createFileRoute('/seller/dashboard/earnings')({
  component: SellerEarnings,
});
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import type { EscrowStatus } from '@/types/dashboard';

const statusColors: Record<EscrowStatus, string> = {
  created: 'bg-blue-500',
  'pending-proof': 'bg-yellow-500',
  'proof-submitted': 'bg-orange-500',
  'proof-verified': 'bg-green-500',
  'proof-rejected': 'bg-red-500',
  'on-hold': 'bg-gray-500',
  released: 'bg-green-600',
  refunded: 'bg-purple-500',
};

function SellerEarnings() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['seller-earnings'],
    queryFn: () => getEarnings(),
  });

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load earnings data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
        <p className="text-muted-foreground">
          Track your revenue and earnings breakdown
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Earnings
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ৳{parseFloat(data?.pending.amount || '0').toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data?.pending.count || 0} transactions in escrow
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Released Earnings
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ৳{parseFloat(data?.released.amount || '0').toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ready for payout
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Withdrawn
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ৳{parseFloat(data?.withdrawn.amount || '0').toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data?.withdrawn.count || 0} completed payouts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Earnings
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ৳{parseFloat(data?.total.amount || '0').toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Pending Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : data?.pending.transactions && data.pending.transactions.length > 0 ? (
            <div className="space-y-4">
              {data.pending.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {transaction.booking?.listing?.title || 'Unknown Listing'}
                      </h4>
                      <Badge
                        variant="secondary"
                        className={statusColors[transaction.status]}
                      >
                        {transaction.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Booking ID: {transaction.bookingId}
                    </p>
                    {transaction.booking?.serviceDate && (
                      <p className="text-sm text-muted-foreground">
                        Service Date:{' '}
                        {format(
                          new Date(transaction.booking.serviceDate),
                          'MMM dd, yyyy'
                        )}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Created:{' '}
                      {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      ৳{parseFloat(transaction.sellerAmount).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Platform Fee: ৳{parseFloat(transaction.platformFee).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No pending transactions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
