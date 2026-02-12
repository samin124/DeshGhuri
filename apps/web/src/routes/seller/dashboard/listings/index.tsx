import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Package, Eye, Edit, Play } from 'lucide-react';
import { useState } from 'react';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export const Route = createFileRoute('/seller/dashboard/listings/')({
  component: ListingsPage,
});

interface Listing {
  id: string;
  title: string;
  category: string;
  status: string;
  basePrice: number;
  createdAt: string;
  viewCount: number;
  images: string[];
}

function ListingsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch all listings (without filter) to calculate accurate stats
  const { data, isLoading, error } = useQuery({
    queryKey: ['seller-listings'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/seller/listings`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch listings');
      return res.json();
    },
  });

  // Filter listings on the frontend based on selected status
  const filteredListings =
    data?.data?.filter(
      (listing: Listing) => statusFilter === 'all' || listing.status === statusFilter
    ) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
    > = {
      draft: { variant: 'secondary', label: 'Draft' },
      'pending-review': { variant: 'outline', label: 'Pending Review' },
      active: { variant: 'default', label: 'Active' },
      paused: { variant: 'secondary', label: 'Paused' },
      rejected: { variant: 'destructive', label: 'Rejected' },
    };
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryDisplay = (category: string) => {
    const map: Record<string, string> = {
      hotel: 'Hotel',
      'tour-package': 'Tour Package',
      experience: 'Experience',
      transport: 'Transportation',
    };
    return map[category] || category;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Listings</h1>
          <p className="text-muted-foreground">Manage your property and tour listings</p>
        </div>
        <Button asChild>
          <Link to="/seller/dashboard/listings/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Listing
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.data?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.data?.filter((l: Listing) => l.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Eye className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.data?.filter((l: Listing) => l.status === 'pending-review').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.data?.filter((l: Listing) => l.status === 'draft').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'active', 'pending-review', 'draft', 'paused', 'rejected'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status === 'all'
              ? 'All'
              : status
                  .split('-')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')}
          </Button>
        ))}
      </div>

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Listings</CardTitle>
          <CardDescription>View and manage all your listings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">Loading listings...</div>
          )}

          {error && (
            <div className="text-center py-8 text-destructive">
              Failed to load listings. Please try again.
            </div>
          )}

          {data && data.data && data.data.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first listing to start receiving bookings
              </p>
              <Button asChild>
                <Link to="/seller/dashboard/listings/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Listing
                </Link>
              </Button>
            </div>
          )}

          {data && data.data && data.data.length > 0 && filteredListings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No listings found with status: {statusFilter}
            </div>
          )}

          {data && data.data && data.data.length > 0 && filteredListings.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((listing: Listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">{listing.title}</TableCell>
                    <TableCell>{getCategoryDisplay(listing.category)}</TableCell>
                    <TableCell>{getStatusBadge(listing.status)}</TableCell>
                    <TableCell>৳{listing.basePrice.toLocaleString()}</TableCell>
                    <TableCell>{listing.viewCount || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/seller/dashboard/listings/${listing.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
