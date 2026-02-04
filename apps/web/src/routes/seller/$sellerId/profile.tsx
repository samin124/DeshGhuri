import { createFileRoute } from '@tanstack/react-router';
import { MapPin, Phone, Mail, Star, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { VerifiedBadge } from '@/components/seller/verified-badge';
import { RatingStars } from '@/components/common/rating-stars';
import { ListingCard } from '@/components/common/listing-card';

export const Route = createFileRoute('/seller/$sellerId/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const { sellerId } = Route.useParams();

  // Mock data - replace with actual API call
  const seller = {
    id: sellerId,
    businessName: 'Paradise Resorts Ltd',
    category: 'Hotel',
    avatar: '',
    isVerified: true,
    rating: 4.9,
    reviewCount: 342,
    totalListings: 12,
    totalBookings: 1248,
    responseTime: '2 hours',
    memberSince: '2024',
    description: 'We are a premier hospitality provider in Bangladesh, offering luxury accommodations and unforgettable experiences. Our mission is to provide exceptional service and create memorable moments for our guests.',
    location: 'Cox\'s Bazar, Chittagong',
    contactEmail: 'contact@paradiseresorts.com',
    contactPhone: '+880 1XXX-XXXXXX',
    achievements: [
      { icon: Award, label: 'Top Rated Seller 2025' },
      { icon: Star, label: 'Excellence in Service' },
      { icon: Award, label: '1000+ Happy Customers' },
    ],
    listings: [
      {
        id: '1',
        title: 'Luxury Beach Resort',
        category: 'Hotel',
        location: 'Cox\'s Bazar',
        price: 8500,
        currency: 'BDT' as const,
        rating: 4.8,
        reviewCount: 156,
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
        seller: {
          id: sellerId,
          name: 'Paradise Resorts Ltd',
          isVerified: true,
        },
      },
      {
        id: '2',
        title: 'Premium Ocean View Suite',
        category: 'Hotel',
        location: 'Cox\'s Bazar',
        price: 12000,
        currency: 'BDT' as const,
        rating: 4.9,
        reviewCount: 98,
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
        seller: {
          id: sellerId,
          name: 'Paradise Resorts Ltd',
          isVerified: true,
        },
      },
    ],
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'agency':
        return 'Travel Agency';
      case 'hotel':
        return 'Hotel';
      case 'tour-operator':
        return 'Tour Operator';
      default:
        return category;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Card */}
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={seller.avatar} />
              <AvatarFallback className="text-2xl">
                {seller.businessName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{seller.businessName}</h1>
                    {seller.isVerified && <VerifiedBadge size="lg" />}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Badge variant="secondary">{getCategoryLabel(seller.category)}</Badge>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {seller.location}
                    </span>
                  </div>
                </div>
                <Button size="lg">Contact Seller</Button>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <RatingStars rating={seller.rating} showNumber size="sm" />
                  <span className="text-gray-600 dark:text-gray-400">
                    ({seller.reviewCount} reviews)
                  </span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {seller.totalListings} listings
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {seller.totalBookings} bookings
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Member since {seller.memberSince}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3">About</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {seller.description}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{seller.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{seller.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{seller.location}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Response Time</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Usually responds within {seller.responseTime}
                </p>
              </div>
            </div>
          </div>

          {seller.achievements.length > 0 && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="font-semibold mb-4">Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {seller.achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-primary/5"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium text-sm">
                          {achievement.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Listings Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Listings from {seller.businessName}</h2>
          {seller.listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seller.listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <p className="text-center text-gray-500">No listings available</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
