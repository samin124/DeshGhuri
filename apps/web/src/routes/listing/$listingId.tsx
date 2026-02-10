import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { MapPin, Users, Calendar, Heart, Share2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingStars } from '@/components/common/rating-stars';
import { PriceDisplay } from '@/components/common/price-display';
import { VerifiedBadge } from '@/components/seller/verified-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { requireCustomerAccess } from '@/lib/auth/role-guard';
import { useListing, trackListingView } from '@/lib/api/listings';
import { CATEGORY_DISPLAY_NAMES } from '@/lib/constants/categories';
import { BookingWizard } from '@/components/booking/booking-wizard';
import { BookingProvider } from '@/contexts/booking-context';
import { authClient } from '@/lib/auth-client';

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

  // Fetch listing from API
  const { data, isLoading, error } = useListing(listingId);
  const listing = data?.data;

  // Track view when component mounts
  useEffect(() => {
    if (listingId) {
      trackListingView(listingId);
    }
  }, [listingId]);

  // Handle reserve button click with authentication check
  const handleReserveClick = async () => {
    try {
      const session = await authClient.getSession();

      if (!session) {
        // Redirect to sign-in with return URL
        router.navigate({
          to: '/login',
          search: { return: `/listing/${listingId}` },
        });
        return;
      }

      // User is authenticated, open booking wizard
      setWizardOpen(true);
    } catch (err) {
      console.error('Error checking authentication:', err);
      // On error, redirect to login to be safe
      router.navigate({
        to: '/login',
        search: { return: `/listing/${listingId}` },
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Skeleton className="aspect-[4/3] md:aspect-[16/9] rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="aspect-square rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-64 rounded-lg" />
            </div>
            <Skeleton className="h-96 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Failed to load listing</h2>
          <p className="text-muted-foreground mb-4">
            This listing could not be found or is no longer available.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </Card>
      </div>
    );
  }

  // Not found state
  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2">Listing not found</h2>
          <p className="text-muted-foreground mb-4">
            The listing you're looking for doesn't exist.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </Card>
      </div>
    );
  }

  // Get primary image or first image
  const primaryImage = listing.images?.find((img) => img.isPrimary) || listing.images?.[0];
  const locationText = typeof listing.location === 'string'
    ? listing.location
    : `${listing.location.city}, ${listing.location.district}`;
  const categoryDisplay = CATEGORY_DISPLAY_NAMES[listing.category] || listing.category;

  return (
    <BookingProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="aspect-[4/3] md:aspect-[16/9] rounded-lg overflow-hidden">
            <img
              src={primaryImage?.url || '/placeholder-listing.jpg'}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {listing.images?.slice(1, 3).map((image, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={image.url}
                  alt={`${listing.title} ${index + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Actions */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{locationText}</span>
                    </div>
                    <Badge variant="secondary">{categoryDisplay}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <RatingStars
                rating={listing.rating ? parseFloat(listing.rating) : undefined}
                reviewCount={listing.reviewCount}
                showNumber
                size="md"
              />
            </div>

            <Separator />

            {/* Seller Info */}
            {listing.seller && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Hosted by</h2>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={listing.seller.avatar} />
                    <AvatarFallback>
                      {listing.seller.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{listing.seller.name}</h3>
                      {listing.seller.isVerified && <VerifiedBadge size="sm" />}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {listing.seller.rating && (
                        <div className="flex items-center gap-1">
                          <RatingStars
                            rating={listing.seller.rating}
                            showNumber
                            size="sm"
                          />
                        </div>
                      )}
                      {listing.seller.responseTime && (
                        <span>Responds in {listing.seller.responseTime}</span>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="mt-3">
                      Contact Seller
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">About this listing</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {listing.description}
              </p>
            </div>

            <Separator />

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">What this place offers</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {listing.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Policies */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Policies</h2>
              <div className="space-y-3">
                {(listing.checkInTime || listing.checkOutTime) && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Check-in / Check-out</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {listing.checkInTime || 'Flexible'} / {listing.checkOutTime || 'Flexible'}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Cancellation Policy</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {listing.cancellationPolicy || 'Contact seller for details'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="mb-6">
                <PriceDisplay
                  price={parseFloat(listing.basePrice)}
                  currency={listing.currency}
                  size="lg"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {listing.priceUnit === 'per-night' ? 'per night' :
                   listing.priceUnit === 'per-person' ? 'per person' :
                   listing.priceUnit === 'per-booking' ? 'per booking' : ''}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Check-in</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Check-out</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Guests</label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <input
                      type="number"
                      min="1"
                      defaultValue="1"
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      ৳{parseFloat(listing.basePrice).toLocaleString()} × 1 {listing.priceUnit === 'per-night' ? 'night' : listing.priceUnit === 'per-person' ? 'person' : 'booking'}
                    </span>
                    <span>৳{parseFloat(listing.basePrice).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Service fee
                    </span>
                    <span>৳{Math.round(parseFloat(listing.basePrice) * 0.05).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>৳{(parseFloat(listing.basePrice) + Math.round(parseFloat(listing.basePrice) * 0.05)).toLocaleString()}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleReserveClick}>
                  Reserve
                </Button>

                <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                  You won't be charged yet
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Booking Wizard */}
        <BookingWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          listing={listing}
        />
        </div>
      </div>
    </BookingProvider>
  );
}
