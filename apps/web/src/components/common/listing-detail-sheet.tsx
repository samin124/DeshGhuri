import { useState } from "react";
import { X, MapPin, Calendar, Users, Star, Heart, Share2, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useListing } from "@/lib/api/listings";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingStars } from "./rating-stars";
import { PriceDisplay } from "./price-display";
import { VerifiedBadge } from "@/components/seller/verified-badge";

interface ListingDetailSheetProps {
  listingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ListingDetailSheet({
  listingId,
  open,
  onOpenChange,
}: ListingDetailSheetProps) {
  const { data, isLoading } = useListing(listingId || "");
  const listing = data?.data;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get primary image or first image
  const images = listing?.images || [];
  const selectedImage = images[selectedImageIndex]?.url || '/placeholder-listing.jpg';

  // Format location
  const locationText = listing?.location
    ? typeof listing.location === 'string'
      ? listing.location
      : `${listing.location.city}, ${listing.location.district}, ${listing.location.address}`
    : '';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 overflow-hidden">
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : listing ? (
            <>
              {/* Header with close button */}
              <div className="sticky top-0 z-10 flex items-center justify-between bg-background border-b px-6 py-4">
                <div className="flex-1 min-w-0 pr-4">
                  <SheetTitle className="truncate">{listing.title}</SheetTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="flex-shrink-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Image Gallery */}
              <div className="relative">
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img
                    src={selectedImage}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  {listing.isFlashDeal && (
                    <Badge className="absolute left-4 top-4 bg-destructive">
                      Flash Deal {listing.discountPercent && `- ${listing.discountPercent}% OFF`}
                    </Badge>
                  )}
                  {listing.isTrending && (
                    <Badge className="absolute left-4 top-4 bg-primary">
                      🔥 Trending
                    </Badge>
                  )}
                </div>

                {/* Image thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          idx === selectedImageIndex
                            ? 'border-primary'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`${listing.title} - ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Title, Category, and Actions */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">{listing.title}</h2>
                      <Badge variant="secondary">{listing.category}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{locationText}</span>
                  </div>

                  {/* Rating */}
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
                  <>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
                        {listing.seller.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Hosted by {listing.seller.name}</span>
                          {listing.seller.verificationStatus === 'verified' && (
                            <VerifiedBadge size="sm" />
                          )}
                        </div>
                        {listing.seller.rating && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                            <span>{listing.seller.rating} seller rating</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">About this listing</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {listing.description}
                  </p>
                </div>

                <Separator />

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Capacity</p>
                      <p className="font-medium">{listing.maxGuests} guests</p>
                    </div>
                  </div>
                  {listing.checkInTime && listing.checkOutTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Check-in/out</p>
                        <p className="font-medium text-sm">
                          {listing.checkInTime} - {listing.checkOutTime}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Amenities */}
                {listing.amenities && listing.amenities.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {listing.amenities.map((amenity, idx) => (
                          <Badge key={idx} variant="outline">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Inclusions */}
                {listing.inclusions && listing.inclusions.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3">What's Included</h3>
                      <ul className="space-y-2">
                        {listing.inclusions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* Exclusions */}
                {listing.exclusions && listing.exclusions.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3">Not Included</h3>
                      <ul className="space-y-2">
                        {listing.exclusions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">✗</span>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* Cancellation Policy */}
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Cancellation Policy</h3>
                  <Badge variant="outline">{listing.cancellationPolicy}</Badge>
                </div>

                {/* House Rules */}
                {listing.houseRules && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">House Rules</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {listing.houseRules}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Sticky Footer with Price and Book Button */}
              <div className="sticky bottom-0 border-t bg-background p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <PriceDisplay
                      price={parseFloat(listing.basePrice || '0')}
                      currency={listing.currency}
                      discountPercent={listing.discountPercent}
                      size="lg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {listing.priceUnit}
                    </p>
                  </div>
                  <Button size="lg" asChild>
                    <Link to={`/listing/${listing.id}`}>
                      View Full Details & Book
                    </Link>
                  </Button>
                </div>
                {listing.groupEligible && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    💰 Group discounts available
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">Listing not found</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
