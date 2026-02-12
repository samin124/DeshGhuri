import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/lib/api/seller-dashboard';

export const Route = createFileRoute('/seller/dashboard/')({
  component: SellerDashboardOverview,
});
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  ShoppingCart,
  Eye,
  AlertCircle,
  MessageSquare,
  Calendar,
  Package,
  Star,
  TrendingUp,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  linkTo,
  linkText,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: { value: number; label: string };
  linkTo?: string;
  linkText?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && (
          <div className="mt-2 flex items-center text-xs">
            <TrendingUp
              className={`mr-1 h-3 w-3 ${trend.value >= 0 ? 'text-green-500' : 'text-red-500'}`}
            />
            <span className={trend.value >= 0 ? 'text-green-500' : 'text-red-500'}>
              {trend.value >= 0 ? '+' : ''}
              {trend.value}%
            </span>
            <span className="ml-1 text-muted-foreground">{trend.label}</span>
          </div>
        )}
        {linkTo && linkText && (
          <Button variant="link" size="sm" className="mt-2 h-auto p-0" asChild>
            <Link to={linkTo}>{linkText}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function SellerDashboardOverview() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['seller-dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 60000, // Refetch every minute
  });

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your business.</p>
      </div>

      {/* Today's Stats */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Today's Performance</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
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
              <StatCard
                title="Today's Bookings"
                value={stats?.todayBookings || 0}
                icon={ShoppingCart}
                description="New bookings today"
                linkTo="/seller/dashboard/bookings"
                linkText="View all bookings"
              />
              <StatCard
                title="Today's Revenue"
                value={`৳${parseFloat(stats?.todayRevenue || '0').toLocaleString()}`}
                icon={DollarSign}
                description="Revenue generated today"
              />
              <StatCard
                title="Today's Views"
                value={stats?.todayViews || 0}
                icon={Eye}
                description="Listing views today"
              />
            </>
          )}
        </div>
      </div>

      {/* Pending Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Pending Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
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
              <StatCard
                title="Pending Proofs"
                value={stats?.pendingProofs || 0}
                icon={AlertCircle}
                description="Service proofs to submit"
                linkTo="/seller/dashboard/proof-center"
                linkText="Submit proofs"
              />
              <StatCard
                title="Unanswered Reviews"
                value={stats?.unansweredReviews || 0}
                icon={MessageSquare}
                description="Reviews awaiting response"
                linkTo="/seller/dashboard/reviews"
                linkText="Respond to reviews"
              />
              <StatCard
                title="Upcoming Bookings"
                value={stats?.upcomingBookings || 0}
                icon={Calendar}
                description="Next 7 days"
                linkTo="/seller/dashboard/bookings"
                linkText="View bookings"
              />
            </>
          )}
        </div>
      </div>

      {/* Overall Stats */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Overall Performance</h2>
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
              <StatCard
                title="Total Listings"
                value={stats?.totalListings || 0}
                icon={Package}
                description={`${stats?.activeListings || 0} active`}
                linkTo="/seller/dashboard/listings"
                linkText="Manage listings"
              />
              <StatCard
                title="Total Bookings"
                value={stats?.totalBookings || 0}
                icon={ShoppingCart}
                description="All time"
              />
              <StatCard
                title="Total Revenue"
                value={`৳${parseFloat(stats?.totalRevenue || '0').toLocaleString()}`}
                icon={DollarSign}
                description="All time earnings"
                linkTo="/seller/dashboard/earnings"
                linkText="View earnings"
              />
              <StatCard
                title="Average Rating"
                value={stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                icon={Star}
                description={`${stats?.totalReviews || 0} reviews`}
                linkTo="/seller/dashboard/reviews"
                linkText="View reviews"
              />
            </>
          )}
        </div>
      </div>

      {/* Earnings Summary */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Earnings Breakdown</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
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
              <StatCard
                title="Pending Earnings"
                value={`৳${parseFloat(stats?.pendingEarnings || '0').toLocaleString()}`}
                icon={AlertCircle}
                description="In escrow, awaiting release"
              />
              <StatCard
                title="Released Earnings"
                value={`৳${parseFloat(stats?.releasedEarnings || '0').toLocaleString()}`}
                icon={DollarSign}
                description="Ready for payout"
                linkTo="/seller/dashboard/payouts"
                linkText="Request payout"
              />
              <StatCard
                title="Total Earnings"
                value={`৳${parseFloat(stats?.totalEarnings || '0').toLocaleString()}`}
                icon={TrendingUp}
                description="Lifetime earnings"
              />
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/seller/dashboard/listings/new">Create New Listing</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/seller/dashboard/bookings">View Bookings</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/seller/dashboard/analytics">View Analytics</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/seller/dashboard/settings">Settings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
