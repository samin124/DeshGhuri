import { Heart, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";

import type { Listing } from "@/types/listing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CountdownTimer } from "./countdown-timer";
import { PriceDisplay } from "./price-display";
import { RatingStars } from "./rating-stars";

interface ListingCardProps {
  listing: Listing;
  showCountdown?: boolean;
  className?: string;
}

export function ListingCard({
  listing,
  showCountdown = false,
  className,
}: ListingCardProps) {
  return (
    <Card className={`group overflow-hidden transition-all hover:shadow-lg ${className}`}>
      <Link to="/" className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={listing.image}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          {listing.isFlashDeal && (
            <Badge className="absolute left-2 top-2 bg-destructive">
              Flash Deal
            </Badge>
          )}
          {listing.isTrending && (
            <Badge className="absolute left-2 top-2 bg-primary">
              🔥 Trending
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={(e) => {
              e.preventDefault();
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
              <span>{listing.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {listing.category}
              </Badge>
            </div>

            <RatingStars
              rating={listing.rating}
              reviewCount={listing.reviewCount}
              showNumber
              size="sm"
            />

            {showCountdown && listing.isFlashDeal && listing.dealEndsAt && (
              <CountdownTimer endTime={listing.dealEndsAt} size="sm" />
            )}

            <div className="flex items-center justify-between pt-2">
              <PriceDisplay
                price={listing.price}
                currency={listing.currency}
                discountPercent={listing.discountPercent}
                size="md"
              />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
