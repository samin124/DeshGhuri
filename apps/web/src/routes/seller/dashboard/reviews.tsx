import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReviews, respondToReview } from '@/lib/api/seller-dashboard';

export const Route = createFileRoute('/seller/dashboard/reviews')({
  component: SellerReviews,
});
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, Star, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

function SellerReviews() {
  const [page, setPage] = useState(1);
  const [hasResponse, setHasResponse] = useState<'all' | 'true' | 'false'>('all');
  const [minRating, setMinRating] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const limit = 10;
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['seller-reviews', page, hasResponse, minRating],
    queryFn: () =>
      getReviews({
        page,
        limit,
        hasResponse: hasResponse === 'all' ? undefined : hasResponse === 'true',
        minRating: minRating === 'all' ? undefined : Number(minRating),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  const respondMutation = useMutation({
    mutationFn: respondToReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard-stats'] });
      setSelectedReview(null);
      setResponseText('');
      toast.success('Response added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add response');
    },
  });

  const handleRespond = () => {
    if (!selectedReview || !responseText.trim()) return;

    respondMutation.mutate({
      reviewId: selectedReview,
      response: responseText.trim(),
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-0">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load reviews. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground">View and respond to customer reviews</p>
      </div>

      {/* Rating Stats */}
      {data && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">{data.averageRating.toFixed(1)}</div>
                <div>
                  {renderStars(Math.round(data.averageRating))}
                  <p className="text-sm text-muted-foreground">Based on {data.total} reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <div className="h-2 flex-1 rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${
                            data.total > 0
                              ? (data.ratingDistribution[rating] / data.total) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm text-muted-foreground">
                      {data.ratingDistribution[rating]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Select
              value={hasResponse}
              onValueChange={(value) => {
                setHasResponse(value as 'all' | 'true' | 'false');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Response status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="false">Unanswered</SelectItem>
                <SelectItem value="true">Answered</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={minRating}
              onValueChange={(value) => {
                setMinRating(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Minimum rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="2">2+ Stars</SelectItem>
                <SelectItem value="1">1+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>{data && `${data.total} Review${data.total !== 1 ? 's' : ''}`}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : data && data.reviews.length > 0 ? (
            <>
              <div className="space-y-4">
                {data.reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border p-4 space-y-3">
                    {/* Review Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        {review.customer?.image && (
                          <img
                            src={review.customer.image}
                            alt={review.customer.name}
                            className="h-10 w-10 rounded-full"
                          />
                        )}
                        <div>
                          <h4 className="font-medium">{review.customer?.name}</h4>
                          <div className="mt-1 flex items-center gap-2">
                            {renderStars(review.overallRating)}
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!review.sellerResponse && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedReview(review.id)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Respond
                        </Button>
                      )}
                    </div>

                    {/* Listing Info */}
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{review.listing?.title}</span>
                      {' • '}
                      {review.listing?.category}
                    </div>

                    {/* Review Content */}
                    {review.title && <h5 className="font-medium">{review.title}</h5>}
                    <p className="text-sm">{review.comment}</p>

                    {/* Seller Response */}
                    {review.sellerResponse && (
                      <div className="mt-4 rounded-lg bg-muted p-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <MessageSquare className="h-4 w-4" />
                          Your Response
                        </div>
                        <p className="mt-2 text-sm">{review.sellerResponse}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Responded{' '}
                          {review.respondedAt &&
                            format(new Date(review.respondedAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              <p className="text-muted-foreground">No reviews yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Respond Dialog */}
      <Dialog
        open={selectedReview !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedReview(null);
            setResponseText('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
            <DialogDescription>
              Write a thoughtful response to this customer review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your response here..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedReview(null);
                setResponseText('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRespond}
              disabled={!responseText.trim() || respondMutation.isPending}
            >
              {respondMutation.isPending ? 'Sending...' : 'Send Response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
