import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import {
  MapPin,
  Users,
  User,
  Calendar,
  Heart,
  Share2,
  AlertCircle,
  Star,
  Clock,
  Shield,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { VerifiedBadge } from '@/components/seller/verified-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { requireCustomerAccess } from '@/lib/auth/role-guard';
import {
  useListing,
  useListingReviews,
  useCreateListingReview,
  trackListingView,
} from '@/lib/api/listings';
import { CATEGORY_DISPLAY_NAMES } from '@/lib/constants/categories';
import { BookingWizard } from '@/components/booking/booking-wizard';
import { BookingProvider } from '@/contexts/booking-context';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

export const Route = createFileRoute('/listing/$listingId')({
  beforeLoad: async ({ location }) => {
    await requireCustomerAccess(location.pathname);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { listingId } = Route.useParams();
  const router = useRouter();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [canScrollReviewPrev, setCanScrollReviewPrev] = useState(false);
  const [canScrollReviewNext, setCanScrollReviewNext] = useState(false);
  const { data: sessionData, isPending: isSessionPending } = authClient.useSession();
  const isAuthenticated = !!sessionData?.user;
  const [reviewsCarouselRef, reviewsCarouselApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: false,
  });

  // Fetch listing from API
  const { data, isLoading, error } = useListing(listingId);
  const { data: reviewsData, isLoading: isReviewsLoading } = useListingReviews(listingId, 5);
  const createReviewMutation = useCreateListingReview(listingId);
  const listing = data?.data;
  const reviewsSummary = reviewsData?.data;
  const latestReviews = reviewsSummary?.reviews || [];
  const averageRating =
    reviewsSummary?.averageRating ?? (listing?.rating ? parseFloat(listing.rating) : 0);
  const totalReviewCount = reviewsSummary?.reviewCount ?? listing?.reviewCount ?? 0;
  const canReview = reviewsSummary?.canReview ?? false;
  const reviewEligibilityMessage =
    reviewsSummary?.eligibilityMessage || 'Sign in to submit a rating and review.';

  // Track view when component mounts
  useEffect(() => {
    if (listingId) {
      trackListingView(listingId);
    }
  }, [listingId]);

  const updateReviewCarouselButtons = useCallback(() => {
    if (!reviewsCarouselApi) {
      return;
    }

    setCanScrollReviewPrev(reviewsCarouselApi.canScrollPrev());
    setCanScrollReviewNext(reviewsCarouselApi.canScrollNext());
  }, [reviewsCarouselApi]);

  useEffect(() => {
    if (!reviewsCarouselApi) {
      return;
    }

    updateReviewCarouselButtons();
    reviewsCarouselApi.on('select', updateReviewCarouselButtons);
    reviewsCarouselApi.on('reInit', updateReviewCarouselButtons);

    return () => {
      reviewsCarouselApi.off('select', updateReviewCarouselButtons);
      reviewsCarouselApi.off('reInit', updateReviewCarouselButtons);
    };
  }, [reviewsCarouselApi, updateReviewCarouselButtons, latestReviews.length]);

  const handleSubmitReview = () => {
    if (!canReview) {
      toast.error(reviewEligibilityMessage);
      return;
    }

    if (reviewRating < 1) {
      toast.error('Please select a rating.');
      return;
    }

    if (reviewComment.trim().length < 5) {
      toast.error('Please write at least 5 characters in your review.');
      return;
    }

    createReviewMutation.mutate(
      {
        overallRating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
      },
      {
        onSuccess: () => {
          toast.success('Thanks! Your review has been submitted.');
          setReviewRating(0);
          setReviewTitle('');
          setReviewComment('');
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to submit review.');
        },
      }
    );
  };

  // Handle reserve button click with authentication check
  const handleReserveClick = async () => {
    if (isSessionPending) return;
    if (isBookingClosed) {
      toast.error('Booking is closed for this package.');
      return;
    }

    try {
      const session = await authClient.getSession();

      if (!session.data?.user) {
        toast.error('Please sign in to reserve this package.');
        router.navigate({
          to: '/login',
          search: { return: `/listing/${listingId}`, tab: 'customer' },
        });
        return;
      }

      setWizardOpen(true);
    } catch (err) {
      console.error('Error checking authentication:', err);
      toast.error('Please sign in to reserve this package.');
      router.navigate({
        to: '/login',
        search: { return: `/listing/${listingId}`, tab: 'customer' },
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4]">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
          <Skeleton className="h-[500px] rounded-2xl mb-8" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-8">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-60 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
            <Skeleton className="h-[500px] rounded-xl lg:col-span-4" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
        <Card className="p-8 max-w-md text-center bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Failed to load listing</h2>
          <p className="text-muted-foreground mb-6">
            This listing could not be found or is no longer available.
          </p>
          <Button onClick={() => window.history.back()} className="rounded-full px-8">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  // Not found state
  if (!listing) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
        <Card className="p-8 max-w-md text-center bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Listing not found</h2>
          <p className="text-muted-foreground mb-6">
            The listing you're looking for doesn't exist.
          </p>
          <Button onClick={() => window.history.back()} className="rounded-full px-8">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  // Get images
  const images = listing.images || [];
  const primaryImage = images.find((img) => img.isPrimary) || images[0];
  const allImages = primaryImage
    ? [primaryImage, ...images.filter((img) => img !== primaryImage)]
    : images;

  const locationText =
    typeof listing.location === 'string'
      ? listing.location
      : `${listing.location.city}, ${listing.location.district}`;
  const categoryDisplay = CATEGORY_DISPLAY_NAMES[listing.category] || listing.category;
  const rating = averageRating;
  const basePrice = parseFloat(listing.basePrice);
  const discountedPrice = listing.discountedPrice ? parseFloat(listing.discountedPrice) : null;
  const displayPrice = discountedPrice || basePrice;
  const serviceFee = Math.round(displayPrice * 0.05);
  const total = displayPrice + serviceFee;
  const availablePackages =
    typeof listing.availablePackages === 'number'
      ? listing.availablePackages
      : typeof listing.capacity === 'number' && typeof listing.bookedPackages === 'number'
        ? Math.max(listing.capacity - listing.bookedPackages, 0)
        : listing.capacity;
  const isBookingClosed =
    typeof listing.isBookingClosed === 'boolean'
      ? listing.isBookingClosed
      : availablePackages !== undefined
        ? availablePackages <= 0
        : false;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <BookingProvider>
      <div className="min-h-screen bg-[#f8f7f4]">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 lg:px-6 lg:py-6">
          {/* Hero Image Gallery */}
          <div className="relative mb-6 overflow-hidden rounded-2xl shadow-lg lg:mb-7">
            <div className="aspect-[21/9] relative">
              <img
                src={allImages[currentImageIndex]?.url || '/placeholder-listing.jpg'}
                alt={listing.title}
                className="w-full h-full object-cover"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* Navigation arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Top badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                {listing.discountPercent && listing.discountPercent > 0 && (
                  <Badge className="bg-[#e85c4c] hover:bg-[#d94c3c] text-white font-semibold rounded-full px-4 py-1.5 text-sm shadow-lg">
                    {listing.discountPercent}% OFF
                  </Badge>
                )}
                <Badge className="bg-white/90 text-foreground font-medium rounded-full px-4 py-1.5 text-sm shadow-lg">
                  {categoryDisplay}
                </Badge>
              </div>

              {/* Top right actions */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 bg-white/90 hover:bg-white rounded-full shadow-lg"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 bg-white/90 hover:bg-white rounded-full shadow-lg"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Bottom info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white md:p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                      {listing.title}
                    </h1>
                    <div className="flex items-center gap-4 text-white/90">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{locationText}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{rating.toFixed(1)}</span>
                        {totalReviewCount > 0 && (
                          <span className="text-white/70">({totalReviewCount} reviews)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Image counter */}
                  {allImages.length > 1 && (
                    <div className="bg-black/50 px-3 py-1.5 rounded-full text-sm">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="absolute bottom-20 left-6 right-6 flex gap-2 overflow-x-auto pb-2">
                {allImages.slice(0, 5).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? 'border-white scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Main Content */}
            <div className="space-y-5 lg:col-span-8">
              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Card className="rounded-xl bg-white p-3.5 text-center sm:p-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    {listing.groupEligible ? (
                      <Users className="h-5 w-5 text-primary" />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Booking Type</p>
                  <p className="font-semibold text-sm">
                    {listing.groupEligible ? 'Group' : 'Individual'}
                  </p>
                </Card>

                <Card className="rounded-xl bg-white p-3.5 text-center sm:p-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="font-semibold text-sm">{rating.toFixed(1)} / 5.0</p>
                </Card>

                <Card className="rounded-xl bg-white p-3.5 text-center sm:p-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-xs text-muted-foreground">Payment</p>
                  <p className="font-semibold text-sm">Escrow Protected</p>
                </Card>

                <Card className="rounded-xl bg-white p-3.5 text-center sm:p-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      isBookingClosed ? 'bg-red-100' : 'bg-blue-100'
                    }`}
                  >
                    <Clock className={`h-5 w-5 ${isBookingClosed ? 'text-red-600' : 'text-blue-600'}`} />
                  </div>
                  <p className="text-xs text-muted-foreground">Availability</p>
                  <p className={`font-semibold text-sm ${isBookingClosed ? 'text-destructive' : ''}`}>
                    {isBookingClosed ? 'Booking Closed' : `${availablePackages} left`}
                  </p>
                </Card>
              </div>

              {/* Seller Info Card */}
              {listing.seller && (
                <Card className="rounded-xl bg-white p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src={listing.seller.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {listing.seller.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{listing.seller.name}</h3>
                        {listing.seller.isVerified && <VerifiedBadge size="sm" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Professional Tour Operator
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        {listing.seller.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium">{listing.seller.rating.toFixed(1)}</span>
                          </div>
                        )}
                        {listing.seller.responseTime && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Responds in {listing.seller.responseTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-full">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Description */}
              <Card className="rounded-xl bg-white p-5">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full"></div>
                  About This Experience
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </Card>

              {/* Amenities */}
              {listing.amenities && listing.amenities.length > 0 && (
                <Card className="rounded-xl bg-white p-5">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                    What's Included
                  </h2>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {listing.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-xl bg-[#f8f7f4] p-2.5"
                      >
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <span className="font-medium text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Policies */}
              <Card className="rounded-xl bg-white p-5">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full"></div>
                  Important Information
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {(listing.checkInTime || listing.checkOutTime) && (
                    <div className="rounded-xl bg-[#f8f7f4] p-3.5">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Check-in / Check-out</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-7">
                        {listing.checkInTime || 'Flexible'} / {listing.checkOutTime || 'Flexible'}
                      </p>
                    </div>
                  )}
                  <div className="rounded-xl bg-[#f8f7f4] p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Cancellation Policy</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-7">
                      {listing.cancellationPolicy || 'Free cancellation up to 24 hours before'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#f8f7f4] p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Secure Payment</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-7">
                      Your payment is protected with escrow
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#f8f7f4] p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Instant Confirmation</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-7">
                      Get immediate booking confirmation
                    </p>
                  </div>
                </div>
              </Card>

              {/* Reviews */}
              <Card className="rounded-xl bg-white p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      Customer Reviews
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {totalReviewCount > 0
                        ? `${totalReviewCount} review${totalReviewCount > 1 ? 's' : ''} from verified bookings`
                        : 'No reviews yet for this package'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-amber-50 border border-amber-100 px-4 py-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">/ 5.0 average</span>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="space-y-4 rounded-2xl border border-border/80 bg-[#f8f7f4] p-3.5 sm:p-4">
                    <div>
                      <h3 className="text-base font-semibold">Rate this package</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {reviewEligibilityMessage}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Your rating</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setReviewRating(value)}
                            disabled={!canReview || createReviewMutation.isPending}
                            className="rounded-md p-1 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Rate ${value} stars`}
                          >
                            <Star
                              className={`h-5 w-5 ${
                                value <= reviewRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-muted-foreground/60'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Input
                        placeholder="Review title (optional)"
                        value={reviewTitle}
                        onChange={(event) => setReviewTitle(event.target.value)}
                        maxLength={120}
                        disabled={!canReview || createReviewMutation.isPending}
                      />
                      <Textarea
                        placeholder="Share your experience..."
                        value={reviewComment}
                        onChange={(event) => setReviewComment(event.target.value)}
                        rows={4}
                        maxLength={1000}
                        disabled={!canReview || createReviewMutation.isPending}
                      />
                      <Button
                        className="w-full rounded-xl"
                        onClick={handleSubmitReview}
                        disabled={!canReview || createReviewMutation.isPending}
                      >
                        {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/80 bg-[#f8f7f4] p-3.5 sm:p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold">Latest comments</h3>
                      {latestReviews.length > 1 && (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => reviewsCarouselApi?.scrollPrev()}
                            disabled={!canScrollReviewPrev}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => reviewsCarouselApi?.scrollNext()}
                            disabled={!canScrollReviewNext}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {isReviewsLoading ? (
                      <div className="grid grid-cols-1 gap-3">
                        {[1, 2].map((item) => (
                          <Skeleton key={item} className="h-28 w-full rounded-xl" />
                        ))}
                      </div>
                    ) : latestReviews.length > 0 ? (
                      <div className="overflow-hidden" ref={reviewsCarouselRef}>
                        <div className="flex">
                          {latestReviews.map((entry) => (
                            <div key={entry.id} className="min-w-0 flex-[0_0_100%] pr-3">
                              <div className="h-full rounded-xl border border-border/70 bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-semibold truncate">
                                    {entry.customer?.name || 'Verified Customer'}
                                  </p>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    <span className="text-xs font-medium">
                                      {entry.overallRating}
                                    </span>
                                  </div>
                                </div>
                                {entry.title && (
                                  <p className="text-sm font-medium mt-2 line-clamp-1">
                                    {entry.title}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                                  {entry.comment}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-3">
                                  {new Date(entry.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border bg-white p-5 text-center text-sm text-muted-foreground">
                        No comments yet. Be the first to review this package.
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Booking Panel */}
            <div className="lg:col-span-4">
              <Card className="sticky top-24 rounded-xl bg-white p-5 shadow-lg">
                {/* Price Header */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">
                      ৳{displayPrice.toLocaleString()}
                    </span>
                    {discountedPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        ৳{basePrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {listing.priceUnit === 'per-night'
                      ? 'per night'
                      : listing.priceUnit === 'per-person'
                        ? 'per person'
                        : listing.priceUnit === 'per-booking'
                          ? 'per booking'
                          : 'per person'}
                  </p>
                </div>

                {/* Booking Type Badge */}
                <div className="mb-5">
                  {listing.groupEligible ? (
                    <Badge className="bg-primary/10 text-primary border-primary/30 rounded-full px-4 py-1.5">
                      <Users className="h-4 w-4 mr-1.5" />
                      Group Booking Available
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 rounded-full px-4 py-1.5">
                      <User className="h-4 w-4 mr-1.5" />
                      Individual Booking
                    </Badge>
                  )}
                </div>

                <div className="mb-5">
                  <p
                    className={`text-sm font-medium ${isBookingClosed ? 'text-destructive' : 'text-muted-foreground'}`}
                  >
                    {isBookingClosed
                      ? 'Booking Closed'
                      : `${availablePackages} package${availablePackages === 1 ? '' : 's'} available`}
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Booking Form */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Check-in Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-border rounded-xl bg-[#f8f7f4] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Check-out Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-border rounded-xl bg-[#f8f7f4] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Number of Guests</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="number"
                        min={listing.minGuests || 1}
                        max={listing.maxGuests}
                        defaultValue={listing.minGuests || 1}
                        step={1}
                        className="w-full pl-11 pr-4 py-3 border border-border rounded-xl bg-[#f8f7f4] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Allowed: {listing.minGuests || 1} - {listing.maxGuests} guests
                    </p>
                  </div>
                </div>

                <Separator className="my-5" />

                {/* Price Breakdown */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      ৳{displayPrice.toLocaleString()} × 1{' '}
                      {listing.priceUnit === 'per-night' ? 'night' : 'person'}
                    </span>
                    <span className="font-medium">৳{displayPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service fee</span>
                    <span className="font-medium">৳{serviceFee.toLocaleString()}</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between text-base">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">৳{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Reserve Button */}
                <Button
                  className="mt-5 h-11 w-full rounded-xl text-base font-semibold"
                  size="lg"
                  onClick={handleReserveClick}
                  disabled={isSessionPending || isBookingClosed}
                >
                  {isBookingClosed
                    ? 'Booking Closed'
                    : isAuthenticated
                      ? 'Reserve Now'
                      : 'Sign in to Reserve'}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-3">
                  {isAuthenticated
                    ? "You won't be charged yet. Review before confirming."
                    : 'Sign in first to continue with reservation.'}
                </p>

                {/* Trust Badges */}
                <div className="mt-5 border-t border-border pt-5">
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Verified</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>Instant</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Booking Wizard */}
        <BookingWizard open={wizardOpen} onOpenChange={setWizardOpen} listing={listing} />
      </div>
    </BookingProvider>
  );
}
