import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Clock, DollarSign, RefreshCw, TrendingUp } from 'lucide-react';

import { getEarnings } from '@/lib/api/seller-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EscrowStatus } from '@/types/dashboard';

export const Route = createFileRoute('/seller/dashboard/earnings')({
  component: SellerEarnings,
});

type EarningsRange = '7d' | '30d' | '90d' | 'all';

const statusColors: Record<EscrowStatus, string> = {
  created: 'bg-slate-700 text-white',
  'pending-proof': 'bg-amber-600 text-white',
  'proof-submitted': 'bg-orange-600 text-white',
  'proof-verified': 'bg-emerald-600 text-white',
  'proof-rejected': 'bg-red-600 text-white',
  'on-hold': 'bg-slate-500 text-white',
  released: 'bg-green-700 text-white',
  refunded: 'bg-purple-600 text-white',
};

const formatCurrency = (value?: string | number | null) => {
  const numeric = typeof value === 'number' ? value : Number(value || 0);
  if (Number.isNaN(numeric)) return 'BDT 0';
  return `BDT ${numeric.toLocaleString()}`;
};

const getRangeParams = (range: EarningsRange): { startDate?: string; endDate?: string } => {
  if (range === 'all') return {};

  const endDate = new Date();
  const startDate = new Date(endDate);
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  startDate.setDate(startDate.getDate() - (days - 1));

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

function SellerEarnings() {
  const [range, setRange] = useState<EarningsRange>('30d');

  const queryParams = useMemo(() => getRangeParams(range), [range]);

  const { data, isLoading, error, dataUpdatedAt, refetch, isFetching } = useQuery({
    queryKey: ['seller-earnings', queryParams.startDate || 'all', queryParams.endDate || 'all'],
    queryFn: () => getEarnings(queryParams),
    refetchInterval: 60_000,
  });

  if (error) {
    return (
      <div className="p-0">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load earnings data. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
          <p className="text-muted-foreground">
            Track your revenue and settlement status in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={range}
            onValueChange={(value) => {
              if (value === '7d' || value === '30d' || value === '90d' || value === 'all') {
                setRange(value);
              }
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Last updated:{' '}
        {dataUpdatedAt ? format(new Date(dataUpdatedAt), 'MMM dd, yyyy hh:mm a') : 'Not available'}
      </p>

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
                <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data?.pending.amount)}</div>
                <p className="text-xs text-muted-foreground">
                  {data?.pending.count || 0} transactions in escrow
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Earnings</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data?.released.amount)}</div>
                <p className="text-xs text-muted-foreground">Released and available balance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Withdrawn</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data?.withdrawn.amount)}</div>
                <p className="text-xs text-muted-foreground">
                  {data?.withdrawn.count || 0} completed payouts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data?.total.amount)}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

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
                      <Badge variant="secondary" className={statusColors[transaction.status]}>
                        {transaction.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Booking ID: {transaction.bookingId}
                    </p>
                    {transaction.booking?.serviceDate && (
                      <p className="text-sm text-muted-foreground">
                        Service Date:{' '}
                        {format(new Date(transaction.booking.serviceDate), 'MMM dd, yyyy')}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Created: {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {formatCurrency(transaction.sellerAmount)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Platform Fee: {formatCurrency(transaction.platformFee)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No pending transactions</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
