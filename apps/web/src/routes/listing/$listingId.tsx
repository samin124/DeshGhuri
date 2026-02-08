import { createFileRoute } from '@tanstack/react-router';
import { MapPin, Users, Calendar, Heart, Share2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RatingStars } from '@/components/common/rating-stars';
import { PriceDisplay } from '@/components/common/price-display';
import { VerifiedBadge } from '@/components/seller/verified-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { requireCustomerAccess } from '@/lib/auth/role-guard';

export const Route = createFileRoute('/listing/$listingId')({
  beforeLoad: async ({ location }) => {
    await requireCustomerAccess(location.pathname);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { listingId } = Route.useParams();

  // Mock data - replace with actual API call
  const listing = {
    id: listingId,
    title: 'Luxury Resort in Cox\'s Bazar',
    description: 'Experience the beauty of the world\'s longest natural sea beach with our premium beachfront resort. Enjoy stunning ocean views, modern amenities, and exceptional service.',
    category: 'Hotel',
    location: 'Cox\'s Bazar, Chittagong',
    price: 8500,
    currency: 'BDT' as const,
    rating: 4.8,
    reviewCount: 156,
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    ],
    seller: {
      id: 'seller-1',
      name: 'Paradise Resorts Ltd',
      avatar: '',
      isVerified: true,
      rating: 4.9,
      responseTime: '2 hours',
      totalListings: 12,
    },
    features: [
      'Free WiFi',
      'Sea View',
      'Swimming Pool',
      'Restaurant',
      'Room Service',
      'Air Conditioning',
      'Parking',
      'Spa',
    ],
    policies: {
      checkIn: '2:00 PM',
      checkOut: '12:00 PM',
      cancellation: 'Free cancellation up to 24 hours before check-in',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="aspect-[4/3] md:aspect-[16/9] rounded-lg overflow-hidden">
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {listing.images.slice(1).map((image, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={image}
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
                      <span>{listing.location}</span>
                    </div>
                    <Badge variant="secondary">{listing.category}</Badge>
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
                rating={listing.rating}
                reviewCount={listing.reviewCount}
                showNumber
                size="md"
              />
            </div>

            <Separator />

            {/* Seller Info */}
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
                    <div className="flex items-center gap-1">
                      <RatingStars
                        rating={listing.seller.rating}
                        showNumber
                        size="sm"
                      />
                    </div>
                    <span>{listing.seller.totalListings} listings</span>
                    <span>Responds in {listing.seller.responseTime}</span>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3">
                    Contact Seller
                  </Button>
                </div>
              </div>
            </Card>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">About this listing</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {listing.description}
              </p>
            </div>

            <Separator />

            {/* Features */}
            <div>
              <h2 className="text-xl font-semibold mb-4">What this place offers</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listing.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Policies */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Policies</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Check-in / Check-out</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {listing.policies.checkIn} / {listing.policies.checkOut}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Cancellation Policy</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {listing.policies.cancellation}
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
                  price={listing.price}
                  currency={listing.currency}
                  size="lg"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  per night
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
                      ৳{listing.price} × 1 night
                    </span>
                    <span>৳{listing.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Service fee
                    </span>
                    <span>৳{Math.round(listing.price * 0.05)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>৳{listing.price + Math.round(listing.price * 0.05)}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  Reserve
                </Button>

                <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                  You won't be charged yet
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
