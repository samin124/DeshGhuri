import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Package,
  Eye,
  Edit,
  Play,
  PauseCircle,
  MoreHorizontal,
  Clock3,
  FileText,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export const Route = createFileRoute('/seller/dashboard/listings/')({
  component: ListingsPage,
});

type ListingStatus = 'draft' | 'pending-review' | 'active' | 'paused' | 'rejected';
type StatusFilter = 'all' | ListingStatus;

interface Listing {
  id: string;
  title: string;
  category: string;
  status: ListingStatus;
  basePrice: number;
  createdAt: string;
  viewCount: number;
  bookingCount?: number;
}

interface SellerListingsResponse {
  success: boolean;
  data: Listing[];
  count: number;
}

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending-review', label: 'Pending Review' },
  { value: 'draft', label: 'Draft' },
  { value: 'paused', label: 'Paused' },
  { value: 'rejected', label: 'Rejected' },
];

async function getSellerListings(): Promise<SellerListingsResponse> {
  const res = await fetch(`${API_URL}/api/seller/listings`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch listings');
  return res.json();
}

async function updateListingStatus(
  listingId: string,
  status: Extract<ListingStatus, 'active' | 'paused'>
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/api/seller/listings/${listingId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to update listing status' }));
    throw new Error(error.message || 'Failed to update listing status');
  }

  return res.json();
}

function ListingsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<SellerListingsResponse, Error>({
    queryKey: ['seller-listings'],
    queryFn: getSellerListings,
  });

  const statusMutation = useMutation({
    mutationFn: ({
      listingId,
      status,
    }: {
      listingId: string;
      status: Extract<ListingStatus, 'active' | 'paused'>;
    }) => updateListingStatus(listingId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seller-listings'] });
      toast.success(
        variables.status === 'active'
          ? 'Listing activated successfully'
          : 'Listing paused successfully'
      );
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message || 'Failed to update listing status');
    },
  });

  const allListings = data?.data || [];

  const filteredListings = useMemo(
    () =>
      allListings.filter((listing) => statusFilter === 'all' || listing.status === statusFilter),
    [allListings, statusFilter]
  );

  const summaryStats = useMemo(
    () =>
      allListings.reduce(
        (acc, listing) => {
          acc.total += 1;
          acc[listing.status] += 1;
          return acc;
        },
        {
          total: 0,
          active: 0,
          'pending-review': 0,
          draft: 0,
          paused: 0,
          rejected: 0,
        } satisfies Record<'total' | ListingStatus, number>
      ),
    [allListings]
  );

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

  const getFilterCount = (status: StatusFilter) => {
    if (status === 'all') return summaryStats.total;
    return summaryStats[status];
  };

  const getStatusAction = (
    status: ListingStatus
  ): { label: string; nextStatus: Extract<ListingStatus, 'active' | 'paused'> } | null => {
    if (status === 'active') return { label: 'Pause Listing', nextStatus: 'paused' };
    if (status === 'paused') return { label: 'Activate Listing', nextStatus: 'active' };
    return null;
  };

  const formatCurrency = (amount: number) => `BDT ${amount.toLocaleString()}`;

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';

    return date.toLocaleDateString('en-BD', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleViewListing = (listingId: string) => {
    navigate({ to: `/listing/${listingId}` });
  };

  const handleEditListing = (listingId: string) => {
    navigate({ to: `/seller/dashboard/listings/${listingId}/edit` });
  };

  const handleStatusChange = (
    listingId: string,
    status: Extract<ListingStatus, 'active' | 'paused'>
  ) => {
    statusMutation.mutate({ listingId, status });
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Listings</h2>
          <p className="text-sm text-muted-foreground">
            Manage package visibility, pricing, and publishing status.
          </p>
        </div>
        <Link to="/seller/dashboard/listings/new">
          <Button>
            <Plus className="h-4 w-4" />
            Create New Listing
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Total Listings</CardDescription>
            <CardTitle className="text-2xl">{summaryStats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              Across all statuses
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Active Listings</CardDescription>
            <CardTitle className="text-2xl">{summaryStats.active}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Play className="h-3.5 w-3.5 text-green-600" />
              Visible to customers
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-2xl">{summaryStats['pending-review']}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5 text-amber-500" />
              Waiting for approval
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Draft Listings</CardDescription>
            <CardTitle className="text-2xl">{summaryStats.draft}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Ready to complete
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filter by Status</CardTitle>
          <CardDescription>Use filters to quickly find specific listing groups.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
              <span className="rounded-sm bg-background/80 px-1.5 py-0.5 text-xs text-muted-foreground">
                {getFilterCount(option.value)}
              </span>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Your Listings</CardTitle>
          <CardDescription>Every action below is fully functional from this table.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading listings...
            </div>
          )}

          {error && (
            <div className="py-10 text-center text-sm text-destructive">
              {error.message || 'Failed to load listings.'}
            </div>
          )}

          {!isLoading && !error && allListings.length === 0 && (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No listings yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Create your first listing to start receiving bookings.
              </p>
              <Link to="/seller/dashboard/listings/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create Listing
                </Button>
              </Link>
            </div>
          )}

          {!isLoading && !error && allListings.length > 0 && filteredListings.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No listings found for the selected status.
            </div>
          )}

          {!isLoading && !error && filteredListings.length > 0 && (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="min-w-[240px]">Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredListings.map((listing) => {
                    const statusAction = getStatusAction(listing.status);
                    const isMutatingCurrent =
                      statusMutation.isPending &&
                      statusMutation.variables?.listingId === listing.id;

                    return (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">{listing.title}</TableCell>
                        <TableCell>{getCategoryDisplay(listing.category)}</TableCell>
                        <TableCell>{getStatusBadge(listing.status)}</TableCell>
                        <TableCell>{formatCurrency(listing.basePrice)}</TableCell>
                        <TableCell>{listing.viewCount || 0}</TableCell>
                        <TableCell>{formatDate(listing.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewListing(listing.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditListing(listing.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label="More actions"
                                  />
                                }
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44 bg-card">
                                <DropdownMenuItem onClick={() => handleViewListing(listing.id)}>
                                  <Eye className="h-4 w-4" />
                                  View Listing
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditListing(listing.id)}>
                                  <Edit className="h-4 w-4" />
                                  Edit Listing
                                </DropdownMenuItem>
                                {statusAction && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      disabled={isMutatingCurrent}
                                      onClick={() =>
                                        handleStatusChange(listing.id, statusAction.nextStatus)
                                      }
                                    >
                                      {statusAction.nextStatus === 'active' ? (
                                        <Play className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <PauseCircle className="h-4 w-4 text-amber-600" />
                                      )}
                                      {isMutatingCurrent ? 'Updating...' : statusAction.label}
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
