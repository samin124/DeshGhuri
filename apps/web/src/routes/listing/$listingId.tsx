import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
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
  Wifi,
  Car,
  Utensils,
  Tv,
  Wind,
  Waves,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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

// Amenity icon mapping
const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-5 w-5" />,
  parking: <Car className="h-5 w-5" />,
  restaurant: <Utensils className="h-5 w-5" />,
  tv: <Tv className="h-5 w-5" />,
  ac: <Wind className="h-5 w-5" />,
  pool: <Waves className="h-5 w-5" />,
};

function RouteComponent() {
  const { listingId } = Route.useParams();
  const router = useRouter();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

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
        router.navigate({
          to: '/login',
          search: { return: `/listing/${listingId}` },
        });
        return;
      }

      setWizardOpen(true);
    } catch (err) {
      console.error('Error checking authentication:', err);
      router.navigate({
        to: '/login',
        search: { return: `/listing/${listingId}` },
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4]">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Skeleton className="h-[500px] rounded-2xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-60 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
            <Skeleton className="h-[500px] rounded-xl" />
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
  const rating = listing.rating ? parseFloat(listing.rating) : 0;
  const basePrice = parseFloat(listing.basePrice);
  const discountedPrice = listing.discountedPrice ? parseFloat(listing.discountedPrice) : null;
  const displayPrice = discountedPrice || basePrice;
  const serviceFee = Math.round(displayPrice * 0.05);
  const total = displayPrice + serviceFee;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <BookingProvider>
      <div className="min-h-screen bg-[#f8f7f4]">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Hero Image Gallery */}
          <div className="relative rounded-2xl overflow-hidden mb-8 shadow-lg">
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
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
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
                        {listing.reviewCount && listing.reviewCount > 0 && (
                          <span className="text-white/70">({listing.reviewCount} reviews)</span>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-white rounded-xl text-center">
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

                <Card className="p-4 bg-white rounded-xl text-center">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="font-semibold text-sm">{rating.toFixed(1)} / 5.0</p>
                </Card>

                <Card className="p-4 bg-white rounded-xl text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-xs text-muted-foreground">Payment</p>
                  <p className="font-semibold text-sm">Escrow Protected</p>
                </Card>

                <Card className="p-4 bg-white rounded-xl text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-muted-foreground">Confirmation</p>
                  <p className="font-semibold text-sm">Instant</p>
                </Card>
              </div>

              {/* Seller Info Card */}
              {listing.seller && (
                <Card className="p-6 bg-white rounded-xl">
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
              <Card className="p-6 bg-white rounded-xl">
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
                <Card className="p-6 bg-white rounded-xl">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                    What's Included
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {listing.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#f8f7f4]"
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
              <Card className="p-6 bg-white rounded-xl">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full"></div>
                  Important Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {(listing.checkInTime || listing.checkOutTime) && (
                    <div className="p-4 rounded-xl bg-[#f8f7f4]">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Check-in / Check-out</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-7">
                        {listing.checkInTime || 'Flexible'} / {listing.checkOutTime || 'Flexible'}
                      </p>
                    </div>
                  )}
                  <div className="p-4 rounded-xl bg-[#f8f7f4]">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Cancellation Policy</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-7">
                      {listing.cancellationPolicy || 'Free cancellation up to 24 hours before'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#f8f7f4]">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Secure Payment</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-7">
                      Your payment is protected with escrow
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#f8f7f4]">
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
            </div>

            {/* Booking Panel */}
            <div className="lg:col-span-1">
              <Card className="p-6 bg-white rounded-xl shadow-lg sticky top-24">
                {/* Price Header */}
                <div className="mb-6">
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
                <div className="mb-6">
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
                        min="1"
                        defaultValue="1"
                        className="w-full pl-11 pr-4 py-3 border border-border rounded-xl bg-[#f8f7f4] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

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
                  className="w-full mt-6 rounded-xl h-12 text-base font-semibold"
                  size="lg"
                  onClick={handleReserveClick}
                >
                  Reserve Now
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-3">
                  You won't be charged yet. Review before confirming.
                </p>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-border">
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
