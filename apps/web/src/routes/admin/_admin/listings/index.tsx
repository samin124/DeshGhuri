import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Eye, CheckCircle, XCircle, Star, Trash2 } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useListings, useReviewListing, useUpdateListing, useDeleteListing } from '@/hooks/use-admin-queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/admin/_admin/listings/')({
  component: RouteComponent,
});

interface Listing {
  id: string;
  title: string;
  category: string;
  price: number;
  status: string;
  featured: boolean;
  seller: {
    id: string;
    businessName: string;
  };
  createdAt: string;
}

function RouteComponent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; listing: Listing | null }>({
    open: false,
    listing: null,
  });
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [featured, setFeatured] = useState(false);

  const { data, isLoading, error } = useListings({
    page,
    limit: pageSize,
    search,
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    sortBy,
    sortOrder,
  });

  const reviewMutation = useReviewListing();
  const updateMutation = useUpdateListing();
  const deleteMutation = useDeleteListing();

  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortOrder('asc');
    }
  };

  const handleReview = async () => {
    if (!reviewDialog.listing || !reviewAction) return;

    if (reviewAction === 'rejected' && !rejectionReason.trim()) {
      return;
    }

    await reviewMutation.mutateAsync({
      id: reviewDialog.listing.id,
      data: {
        status: reviewAction,
        rejectionReason: reviewAction === 'rejected' ? rejectionReason.trim() : undefined,
        featured,
      },
    });

    setReviewDialog({ open: false, listing: null });
    setReviewAction(null);
    setRejectionReason('');
    setFeatured(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'paused':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    }
  };

  const columns: Column<Listing>[] = [
    {
      id: 'title',
      header: 'Title',
      accessor: (listing) => (
        <div className="flex items-center gap-2">
          <span>{listing.title || 'Untitled Listing'}</span>
          {listing.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'category',
      header: 'Category',
      accessor: (listing) => listing.category || 'N/A',
      sortable: true,
    },
    {
      id: 'seller',
      header: 'Seller',
      accessor: (listing) => listing.seller?.businessName || 'N/A',
    },
    {
      id: 'price',
      header: 'Price',
      accessor: (listing) => `BDT ${listing.price?.toLocaleString() || 0}`,
      sortable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (listing) => (
        <Badge className={getStatusColor(listing.status)}>{listing.status || 'pending'}</Badge>
      ),
      sortable: true,
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessor: (listing) => new Date(listing.createdAt).toLocaleDateString(),
      sortable: true,
    },
  ];

  const renderActions = (listing: Listing) => (
    <div className="flex gap-2">
      {listing.status === 'pending' && (
        <Button
          variant="default"
          size="sm"
          onClick={() => setReviewDialog({ open: true, listing })}
        >
          Review
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={() => alert('View listing details - requires implementation')}>
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Listing Management</h1>
        <Card className="mt-4 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error.message || 'Listing management requires database schema implementation.'}
          </p>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Required Implementation:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Create listings table in database schema</li>
              <li>Add listing status field (pending, approved, rejected, paused)</li>
              <li>Add admin review fields (reviewedBy, reviewedAt, rejectionReason)</li>
              <li>Implement listing CRUD operations in seller portal</li>
            </ul>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Listing Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and manage seller listings
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border rounded text-sm min-w-[150px]"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border rounded text-sm min-w-[150px]"
          >
            <option value="">All Categories</option>
            <option value="hotel">Hotel</option>
            <option value="tour">Tour</option>
            <option value="experience">Experience</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={data?.listings || []}
        columns={columns}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        totalItems={data?.pagination.total}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        searchable
        searchPlaceholder="Search by title..."
        onSearch={(query) => {
          setSearch(query);
          setPage(1);
        }}
        getRowId={(listing) => listing.id}
        actions={renderActions}
        emptyMessage="No listings found"
      />

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => !open && setReviewDialog({ open: false, listing: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Listing</DialogTitle>
            <DialogDescription>
              Review and approve or reject this listing
            </DialogDescription>
          </DialogHeader>

          {reviewDialog.listing && (
            <div className="space-y-4">
              <div>
                <Label>Listing</Label>
                <p className="text-sm">{reviewDialog.listing.title}</p>
              </div>

              <div>
                <Label>Action</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={reviewAction === 'approved' ? 'default' : 'outline'}
                    onClick={() => setReviewAction('approved')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant={reviewAction === 'rejected' ? 'destructive' : 'outline'}
                    onClick={() => setReviewAction('rejected')}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>

              {reviewAction === 'approved' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Feature this listing
                  </Label>
                </div>
              )}

              {reviewAction === 'rejected' && (
                <div>
                  <Label>Rejection Reason *</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this listing is being rejected..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setReviewDialog({ open: false, listing: null });
                setReviewAction(null);
                setRejectionReason('');
                setFeatured(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={
                !reviewAction ||
                reviewMutation.isPending ||
                (reviewAction === 'rejected' && !rejectionReason.trim())
              }
            >
              {reviewMutation.isPending ? 'Processing...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
