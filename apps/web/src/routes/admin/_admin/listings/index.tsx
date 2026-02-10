import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Package,
  Search,
  Star,
  Eye,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Building,
} from 'lucide-react';
import type { Listing } from '@/types/listing';
import {
  useAdminReviewQueue,
  useAdminListings,
  useReviewListing,
  useToggleFeatured,
} from '@/lib/api/admin-listings';
import {
  CATEGORY_DISPLAY_NAMES,
  STATUS_DISPLAY_NAMES,
  STATUS_BADGE_VARIANTS,
} from '@/lib/constants/categories';

export const Route = createFileRoute('/admin/_admin/listings/')({
  component: AdminListings,
});

interface ReviewDialogState {
  open: boolean;
  listing: any | null;
}

function AdminListings() {
  const [activeTab, setActiveTab] = useState('review-queue');
  const [reviewDialog, setReviewDialog] = useState<ReviewDialogState>({
    open: false,
    listing: null,
  });
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [featured, setFeatured] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Listing Management</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage seller listings across the platform
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="review-queue">
            <AlertCircle className="h-4 w-4 mr-2" />
            Review Queue
          </TabsTrigger>
          <TabsTrigger value="all-listings">
            <Package className="h-4 w-4 mr-2" />
            All Listings
          </TabsTrigger>
          <TabsTrigger value="featured">
            <Star className="h-4 w-4 mr-2" />
            Featured
          </TabsTrigger>
        </TabsList>

        <TabsContent value="review-queue">
          <ReviewQueueTab
            onReview={(listing) => setReviewDialog({ open: true, listing })}
          />
        </TabsContent>

        <TabsContent value="all-listings">
          <AllListingsTab />
        </TabsContent>

        <TabsContent value="featured">
          <FeaturedListingsTab />
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <ReviewDialog
        open={reviewDialog.open}
        listing={reviewDialog.listing}
        reviewAction={reviewAction}
        rejectionReason={rejectionReason}
        feedback={feedback}
        featured={featured}
        onReviewActionChange={setReviewAction}
        onRejectionReasonChange={setRejectionReason}
        onFeedbackChange={setFeedback}
        onFeaturedChange={setFeatured}
        onClose={() => {
          setReviewDialog({ open: false, listing: null });
          setReviewAction(null);
          setRejectionReason('');
          setFeedback('');
          setFeatured(false);
        }}
      />
    </div>
  );
}

// Review Queue Tab Component
function ReviewQueueTab({ onReview }: { onReview: (listing: any) => void }) {
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const { data, isLoading, error } = useAdminReviewQueue({
    page,
    limit: 20,
    category: categoryFilter || undefined,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load review queue. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const listings = data?.data || [];
  const pagination = data?.pagination;

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No pending listings</h3>
          <p className="text-sm text-muted-foreground">
            All listings have been reviewed. Great work!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="category-filter">Filter by Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="hotel">Hotels & Resorts</SelectItem>
                  <SelectItem value="tour-package">Tour Packages</SelectItem>
                  <SelectItem value="experience">Experiences</SelectItem>
                  <SelectItem value="transport">Transportation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listings */}
      <div className="space-y-4">
        {listings.map((listing) => (
          <ReviewQueueCard key={listing.id} listing={listing} onReview={onReview} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total
            listings)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Review Queue Card Component
function ReviewQueueCard({ listing, onReview }: { listing: any; onReview: (listing: any) => void }) {
  const primaryImage = listing.images?.find((img: any) => img.isPrimary) || listing.images?.[0];
  const locationText =
    typeof listing.location === 'string'
      ? listing.location
      : `${listing.location?.city || ''}, ${listing.location?.district || ''}`;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Image */}
          <div className="w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            {primaryImage ? (
              <img
                src={primaryImage.url}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">{listing.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {listing.category && CATEGORY_DISPLAY_NAMES[listing.category as keyof typeof CATEGORY_DISPLAY_NAMES]}
                  </span>
                  {locationText && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {locationText}
                    </span>
                  )}
                </div>
              </div>

              {/* Priority Badge */}
              {listing.priority === 'high' && (
                <Badge variant="destructive" className="ml-4">
                  High Priority
                </Badge>
              )}
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-4 mb-3 text-sm">
              <div>
                <span className="text-muted-foreground">Seller:</span>{' '}
                <span className="font-medium">{listing.seller?.name || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Rating:</span>{' '}
                <span className="font-medium">
                  {listing.seller?.rating ? `⭐ ${listing.seller.rating.toFixed(1)}` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Listings:</span>{' '}
                <span className="font-medium">{listing.seller?.totalListings || 0}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Waiting {listing.daysWaiting} days
                </span>
                <span className="font-semibold text-foreground">
                  ৳{parseFloat(listing.basePrice).toLocaleString()}
                  {listing.priceUnit && ` / ${listing.priceUnit.replace('-', ' ')}`}
                </span>
              </div>

              <Button onClick={() => onReview(listing)}>Review Now</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// All Listings Tab Component
function AllListingsTab() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useAdminListings({
    page,
    limit: 20,
    status: statusFilter as any,
    search: search || undefined,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load listings. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const listings = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-64">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending-review">Pending Review</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No listings found
                </TableCell>
              </TableRow>
            ) : (
              listings.map((listing: any) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {listing.title}
                      {listing.isFeatured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {listing.category && CATEGORY_DISPLAY_NAMES[listing.category as keyof typeof CATEGORY_DISPLAY_NAMES]}
                  </TableCell>
                  <TableCell>{listing.seller?.businessName || 'N/A'}</TableCell>
                  <TableCell>৳{parseFloat(listing.basePrice).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANTS[listing.status as keyof typeof STATUS_BADGE_VARIANTS]}>
                      {STATUS_DISPLAY_NAMES[listing.status as keyof typeof STATUS_DISPLAY_NAMES]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Featured Listings Tab Component
function FeaturedListingsTab() {
  const { data, isLoading, error } = useAdminListings({
    featured: true,
    limit: 50,
  });

  const toggleFeaturedMutation = useToggleFeatured();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load featured listings.</AlertDescription>
      </Alert>
    );
  }

  const listings = data?.data || [];

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Star className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No featured listings</h3>
          <p className="text-sm text-muted-foreground">
            Mark listings as featured to highlight them on the homepage.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {listings.map((listing: any) => {
        const primaryImage = listing.images?.find((img: any) => img.isPrimary) || listing.images?.[0];

        return (
          <Card key={listing.id}>
            <div className="aspect-video w-full overflow-hidden rounded-t-lg">
              {primaryImage ? (
                <img
                  src={primaryImage.url}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">{listing.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {listing.category && CATEGORY_DISPLAY_NAMES[listing.category as keyof typeof CATEGORY_DISPLAY_NAMES]} •{' '}
                ৳{parseFloat(listing.basePrice).toLocaleString()}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  toggleFeaturedMutation.mutate({
                    listingId: listing.id,
                    featured: false,
                  })
                }
                disabled={toggleFeaturedMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Remove from Featured
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Review Dialog Component
function ReviewDialog({
  open,
  listing,
  reviewAction,
  rejectionReason,
  feedback,
  featured,
  onReviewActionChange,
  onRejectionReasonChange,
  onFeedbackChange,
  onFeaturedChange,
  onClose,
}: {
  open: boolean;
  listing: any;
  reviewAction: 'approve' | 'reject' | null;
  rejectionReason: string;
  feedback: string;
  featured: boolean;
  onReviewActionChange: (action: 'approve' | 'reject' | null) => void;
  onRejectionReasonChange: (reason: string) => void;
  onFeedbackChange: (feedback: string) => void;
  onFeaturedChange: (featured: boolean) => void;
  onClose: () => void;
}) {
  const reviewMutation = useReviewListing();
  const [reviewStatus, setReviewStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async () => {
    if (!listing || !reviewAction) return;

    if (reviewAction === 'reject' && !rejectionReason.trim()) {
      setReviewStatus({
        type: 'error',
        message: 'Please provide a rejection reason',
      });
      return;
    }

    setReviewStatus({ type: null, message: '' });

    try {
      await reviewMutation.mutateAsync({
        listingId: listing.id,
        action: reviewAction,
        rejectionReason: reviewAction === 'reject' ? rejectionReason : undefined,
        feedback: feedback || undefined,
        featured: reviewAction === 'approve' ? featured : undefined,
      });

      // Show success message
      setReviewStatus({
        type: 'success',
        message: `Listing ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully!`,
      });

      // Close dialog after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setReviewStatus({
        type: 'error',
        message: error.message || 'Failed to review listing',
      });
    }
  };

  const handleClose = () => {
    setReviewStatus({ type: null, message: '' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Listing</DialogTitle>
          <DialogDescription>
            Review and approve or reject this listing submission
          </DialogDescription>
        </DialogHeader>

        {/* Success/Error Message */}
        {reviewStatus.type && (
          <Alert
            variant={reviewStatus.type === 'error' ? 'destructive' : 'default'}
            className={reviewStatus.type === 'success' ? 'bg-green-50 border-green-200' : ''}
          >
            {reviewStatus.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription className={reviewStatus.type === 'success' ? 'text-green-900' : ''}>
              {reviewStatus.message}
            </AlertDescription>
          </Alert>
        )}

        {listing && !reviewStatus.type && (
          <div className="space-y-6">
            {/* Listing Preview */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">{listing.title}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>{' '}
                    {listing.category && CATEGORY_DISPLAY_NAMES[listing.category as keyof typeof CATEGORY_DISPLAY_NAMES]}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price:</span> ৳
                    {parseFloat(listing.basePrice).toLocaleString()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Seller:</span>{' '}
                    {listing.seller?.name || 'Unknown'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Waiting:</span>{' '}
                    {listing.daysWaiting} days
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review Actions */}
            <div className="space-y-4">
              <Label>Decision</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={reviewAction === 'approve' ? 'default' : 'outline'}
                  onClick={() => onReviewActionChange('approve')}
                  className="h-auto py-4"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">Approve</div>
                    <div className="text-xs opacity-80">Make listing active</div>
                  </div>
                </Button>
                <Button
                  variant={reviewAction === 'reject' ? 'destructive' : 'outline'}
                  onClick={() => onReviewActionChange('reject')}
                  className="h-auto py-4"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">Reject</div>
                    <div className="text-xs opacity-80">Send back to seller</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Approve Options */}
            {reviewAction === 'approve' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured-checkbox"
                    checked={featured}
                    onChange={(e) => onFeaturedChange(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="featured-checkbox" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span>Mark as Featured Listing</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-normal mt-1">
                      Featured listings appear on the homepage and in search results
                    </p>
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback (Optional)</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => onFeedbackChange(e.target.value)}
                    placeholder="Add any feedback or suggestions for the seller..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Reject Options */}
            {reviewAction === 'reject' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">
                    Rejection Reason <span className="text-destructive">*</span>
                  </Label>
                  <Select value={rejectionReason} onValueChange={onRejectionReasonChange}>
                    <SelectTrigger id="rejection-reason">
                      <SelectValue placeholder="Select a reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Misleading information">
                        Misleading information
                      </SelectItem>
                      <SelectItem value="Poor quality images">Poor quality images</SelectItem>
                      <SelectItem value="Inappropriate content">
                        Inappropriate content
                      </SelectItem>
                      <SelectItem value="Incomplete information">
                        Incomplete information
                      </SelectItem>
                      <SelectItem value="Pricing violation">Pricing violation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional-feedback">Additional Feedback</Label>
                  <Textarea
                    id="additional-feedback"
                    value={feedback}
                    onChange={(e) => onFeedbackChange(e.target.value)}
                    placeholder="Explain in detail why this listing is being rejected..."
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {!reviewStatus.type && (
          <DialogFooter>
            <Button variant="ghost" onClick={handleClose} disabled={reviewMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !reviewAction ||
                reviewMutation.isPending ||
                (reviewAction === 'reject' && !rejectionReason.trim())
              }
            >
              {reviewMutation.isPending
                ? 'Processing...'
                : reviewAction === 'approve'
                ? 'Approve Listing'
                : 'Reject Listing'}
            </Button>
          </DialogFooter>
        )}

        {reviewStatus.type === 'success' && (
          <DialogFooter>
            <div className="text-sm text-muted-foreground text-center w-full">
              Closing automatically...
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
