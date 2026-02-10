import { Heart, MapPin, Zap, Tag, Percent, Users, User } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import type { Listing } from "@/types/listing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CountdownTimer } from "./countdown-timer";
import { PriceDisplay } from "./price-display";
import { RatingStars } from "./rating-stars";
import { VerifiedBadge } from "@/components/seller/verified-badge";

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

  // Get primary image or first image
  const primaryImage = listing.images?.find((img) => img.isPrimary) || listing.images?.[0];
  const imageUrl = primaryImage?.url || '/placeholder-listing.jpg';

  // Format location
  const locationText = typeof listing.location === 'string'
    ? listing.location
    : `${listing.location.city}, ${listing.location.district}`;

  const handleClick = () => {
    if (onClick) {
      // Use quick preview sheet if onClick handler provided
      onClick(listing.id);
    } else {
      // Navigate to full detail page if no onClick handler
      navigate({ to: `/listing/${listing.id}` });
    }
  };

  // Check if promo code is valid and available
  const hasValidPromo = listing.promoCode &&
    listing.promoCodeExpiresAt &&
    new Date(listing.promoCodeExpiresAt) > new Date() &&
    (listing.promoCodeUsedCount || 0) < (listing.promoCodeMaxUses || Infinity);

  return (
    <Card className={`group overflow-hidden transition-all hover:shadow-lg ${className}`}>
      <div className="block cursor-pointer" onClick={handleClick}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />

          {/* Top Left Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-2">
            {/* Flash Deal Badge - Most prominent */}
            {listing.isFlashDeal && (
              <Badge className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-bold shadow-lg animate-pulse flex items-center gap-1">
                <Zap className="h-3 w-3 fill-white" />
                FLASH SALE
                {listing.discountPercent && (
                  <span className="ml-1">{listing.discountPercent}% OFF</span>
                )}
              </Badge>
            )}

            {/* Trending Badge */}
            {listing.isTrending && !listing.isFlashDeal && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-md flex items-center gap-1">
                🔥 Trending
              </Badge>
            )}

            {/* Discount Badge (if not flash deal but has discount) */}
            {!listing.isFlashDeal && listing.discountPercent && listing.discountPercent > 0 && (
              <Badge className="bg-green-500 text-white font-bold shadow-md flex items-center gap-1">
                <Percent className="h-3 w-3" />
                {listing.discountPercent}% OFF
              </Badge>
            )}
          </div>

          {/* Top Right - Promo Code Badge */}
          {hasValidPromo && (
            <div className="absolute right-2 top-2 flex flex-col gap-2">
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold shadow-lg border-2 border-white/50 flex items-center gap-1 animate-bounce">
                <Tag className="h-3 w-3" />
                {listing.promoCode}
              </Badge>
            </div>
          )}

          {/* Wishlist Button - Bottom Right */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 bottom-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              // Add to wishlist logic
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-primary">
                {listing.title}
              </h3>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{locationText}</span>
            </div>

            {listing.seller && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  by {listing.seller.name}
                </span>
                {listing.seller.isVerified && (
                  <VerifiedBadge size="sm" showText={false} />
                )}
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {listing.category}
              </Badge>

              {/* Booking Type Badge */}
              {listing.groupEligible ? (
                <Badge variant="outline" className="text-xs flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                  <Users className="h-3 w-3" />
                  Group Booking
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs flex items-center gap-1 bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800">
                  <User className="h-3 w-3" />
                  Individual
                </Badge>
              )}
            </div>

            <RatingStars
              rating={listing.rating ? parseFloat(listing.rating) : undefined}
              reviewCount={listing.reviewCount}
              showNumber
              size="sm"
            />

            {/* Flash Deal Countdown */}
            {showCountdown && listing.isFlashDeal && listing.flashDealEndsAt && (
              <div className="rounded-md bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 p-2 border border-orange-200 dark:border-orange-800">
                <CountdownTimer endTime={listing.flashDealEndsAt} size="sm" />
              </div>
            )}

            {/* Promo Code Info */}
            {hasValidPromo && (
              <div className="rounded-md bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 p-2 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                    <Tag className="h-3 w-3" />
                    <span>Use code: <span className="font-bold">{listing.promoCode}</span></span>
                  </div>
                  {listing.promoCodeDiscount && (
                    <Badge variant="secondary" className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                      {listing.promoCodeDiscount}% off
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              {listing.discountedPrice ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      ৳{Number(listing.discountedPrice).toLocaleString()}
                    </span>
                    {listing.discountPercent && (
                      <Badge variant="destructive" className="text-xs">
                        -{listing.discountPercent}%
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground line-through">
                    ৳{Number(listing.basePrice).toLocaleString()}
                  </div>
                </div>
              ) : (
                <PriceDisplay
                  price={parseFloat(listing.basePrice || '0')}
                  currency={listing.currency}
                  discountPercent={listing.discountPercent}
                  size="md"
                />
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
