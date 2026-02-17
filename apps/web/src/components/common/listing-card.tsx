import { Heart, MapPin, Star, Users, User } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

import type { Listing } from '@/types/listing';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from './countdown-timer';
import { useWishlist } from '@/contexts/wishlist-context';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
  showCountdown?: boolean;
  className?: string;
  onClick?: (listingId: string) => void;
}

export function ListingCard({
  listing,
  showCountdown = false,
  className,
  onClick,
}: ListingCardProps) {
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();

  // Get primary image or first image
  const primaryImage = listing.images?.find((img) => img.isPrimary) || listing.images?.[0];
  const imageUrl = primaryImage?.url || '/placeholder-listing.jpg';

  // Format location - show only city/area name
  const locationText =
    typeof listing.location === 'string'
      ? listing.location
      : listing.location.city || listing.location.district;

  const handleClick = () => {
    if (onClick) {
      // Use quick preview sheet if onClick handler provided
      onClick(listing.id);
    } else {
      // Navigate to full detail page if no onClick handler
      navigate({ to: `/listing/${listing.id}` });
    }
  };

  // Parse rating
  const rating = listing.rating ? parseFloat(listing.rating) : 0;
  const wishlisted = isWishlisted(listing.id);
  const availablePackages =
    typeof listing.availablePackages === 'number'
      ? listing.availablePackages
      : typeof listing.capacity === 'number' && typeof listing.bookedPackages === 'number'
        ? Math.max(listing.capacity - listing.bookedPackages, 0)
        : undefined;
  const isBookingClosed =
    typeof listing.isBookingClosed === 'boolean'
      ? listing.isBookingClosed
      : availablePackages !== undefined
        ? availablePackages === 0
        : false;

  return (
    <div
      className={cn(
        'group cursor-pointer overflow-hidden rounded-xl border border-border/70 bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover',
        className
      )}
      onClick={handleClick}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Left Discount Badge */}
        {listing.discountPercent && listing.discountPercent > 0 && (
          <div className="absolute left-3 top-3">
            <Badge className="bg-[#e85c4c] hover:bg-[#d94c3c] text-white font-semibold shadow-md rounded-full px-3 py-1 text-sm">
              {listing.discountPercent}% OFF
            </Badge>
          </div>
        )}

        <button
          type="button"
          className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md transition hover:bg-white"
          onClick={(event) => {
            event.stopPropagation();
            toggleWishlist(listing);
          }}
          aria-label={wishlisted ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              wishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
            )}
          />
        </button>

        {/* Bottom Left Countdown Timer */}
        {showCountdown && listing.isFlashDeal && listing.flashDealEndsAt && (
          <div className="absolute left-3 bottom-3">
            <div className="bg-black/70 text-white text-sm font-medium rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6l4 2"
                />
              </svg>
              <span>Ends in </span>
              <CountdownTimer endTime={listing.flashDealEndsAt} size="sm" />
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-2">
        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{locationText}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base text-foreground leading-snug line-clamp-1">
          {listing.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
          {listing.reviewCount !== undefined && listing.reviewCount > 0 && (
            <span className="text-sm text-muted-foreground">({listing.reviewCount})</span>
          )}
        </div>

        {/* Booking Type Badge */}
        {listing.groupEligible ? (
          <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
            <Users className="h-3 w-3 mr-1" />
            Group Booking
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
            <User className="h-3 w-3 mr-1" />
            Individual Booking
          </Badge>
        )}
        {availablePackages !== undefined && (
          <Badge
            variant={isBookingClosed ? 'destructive' : 'secondary'}
            className="text-xs ml-2"
          >
            {isBookingClosed ? 'Booking Closed' : `${availablePackages} left`}
          </Badge>
        )}

        {/* Pricing */}
        <div className="pt-1">
          {listing.discountedPrice ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-foreground">
                ৳{Number(listing.discountedPrice).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ৳{Number(listing.basePrice).toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="text-xl font-bold text-foreground">
              ৳{Number(listing.basePrice || '0').toLocaleString()}
            </div>
          )}
        </div>

        {/* Book Now Button */}
        <Button
          className="w-full mt-3"
          onClick={(e) => {
            e.stopPropagation();
            if (isBookingClosed) return;
            navigate({ to: `/listing/${listing.id}` });
          }}
          disabled={isBookingClosed}
        >
          {isBookingClosed ? 'Booking Closed' : 'Book Now'}
        </Button>
      </div>
    </div>
  );
}
