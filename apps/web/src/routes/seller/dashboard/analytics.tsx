import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  AlertCircle,
  BarChart3,
  DollarSign,
  Eye,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { getAnalytics } from '@/lib/api/seller-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { AnalyticsOverview } from '@/types/dashboard';

export const Route = createFileRoute('/seller/dashboard/analytics')({
  component: SellerAnalytics,
});

type Period = 'today' | 'week' | 'month' | 'year';

const formatCurrency = (value?: string | number | null) => {
  const numeric = typeof value === 'number' ? value : Number(value || 0);
  if (Number.isNaN(numeric)) return 'BDT 0';
  return `BDT ${numeric.toLocaleString()}`;
};

const formatChartDate = (value: string, period: Period) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  if (period === 'year') {
    return date.toLocaleDateString('en-US', { month: 'short' });
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function SellerAnalytics() {
  const [period, setPeriod] = useState<Period>('month');

  const { data, isLoading, error, dataUpdatedAt, refetch, isFetching } = useQuery<
    AnalyticsOverview,
    Error
  >({
    queryKey: ['seller-analytics', period],
    queryFn: () => getAnalytics({ period }),
    refetchInterval: 60_000,
  });

  const hasCharts = useMemo(
    () => !!data && data.revenueChart.length > 0 && data.viewsChart.length > 0,
    [data]
  );

  const renderTrend = (value: number | undefined) => {
    if (value === undefined || value === null || value === 0) return null;

    return (
      <div className={`flex items-center text-sm ${value > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {value > 0 ? (
          <TrendingUp className="mr-1 h-4 w-4" />
        ) : (
          <TrendingDown className="mr-1 h-4 w-4" />
        )}
        <span>
          {value > 0 ? '+' : ''}
          {value.toFixed(1)}%
        </span>
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-0">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load analytics data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track your performance with live trend data.</p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={period}
            onValueChange={(value) => {
              if (value === 'today' || value === 'week' || value === 'month' || value === 'year') {
                setPeriod(value);
              }
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
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
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.totalViews.toLocaleString() || 0}</div>
                {data && renderTrend(data.viewsChange)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.totalBookings.toLocaleString() || 0}
                </div>
                {data && renderTrend(data.bookingsChange)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data?.totalRevenue)}</div>
                {data && renderTrend(data.revenueChange)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.conversionRate.toFixed(1) || 0}%</div>
                {data && renderTrend(data.conversionChange)}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue and Bookings Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : hasCharts && data ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => formatChartDate(value, period)} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" allowDecimals={false} />
                <Tooltip
                  formatter={(value, name) => {
                    if (String(name).toLowerCase().includes('revenue')) {
                      return [formatCurrency(Number(value)), name];
                    }
                    return [Number(value).toLocaleString(), name];
                  }}
                  labelFormatter={(label) => formatChartDate(label, period)}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0f766e"
                  name="Revenue (BDT)"
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#1d4ed8"
                  name="Bookings"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-80 items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Views Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : hasCharts && data ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.viewsChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => formatChartDate(value, period)} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(value, name) => [Number(value).toLocaleString(), name]}
                  labelFormatter={(label) => formatChartDate(label, period)}
                />
                <Legend />
                <Bar dataKey="views" fill="#0ea5e9" name="Views" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-80 items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Listings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : data && data.topListings.length > 0 ? (
            <div className="space-y-4">
              {data.topListings.map((listing, index) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{listing.title}</h4>
                      <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                        <span>{listing.views.toLocaleString()} views</span>
                        <span>{listing.bookings.toLocaleString()} bookings</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(listing.revenue)}</div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
