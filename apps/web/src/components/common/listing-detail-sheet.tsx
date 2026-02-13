import { useState } from 'react';
import { X, MapPin, Users, Star, Heart, Share2, Clock } from 'lucide-react';
import { Link } from '@tanstack/react-router';

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useListing } from '@/lib/api/listings';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingStars } from './rating-stars';
import { VerifiedBadge } from '@/components/seller/verified-badge';

interface ListingDetailSheetProps {
  listingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ListingDetailSheet({ listingId, open, onOpenChange }: ListingDetailSheetProps) {
  const { data, isLoading } = useListing(listingId || '');
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
      <SheetContent
        side="right"
        className="h-[100dvh] w-full overflow-hidden bg-background p-0 sm:max-w-3xl"
      >
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="space-y-4 p-4 sm:p-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : listing ? (
            <>
              {/* Header with close button */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex-1 min-w-0 pr-4">
                  <SheetTitle className="truncate text-xl font-bold text-foreground sm:text-2xl">
                    {listing.title}
                  </SheetTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="flex-shrink-0 hover:bg-muted rounded-full"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>

              {/* Image Gallery */}
              <div className="relative">
                <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                  <img
                    src={selectedImage}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  {listing.isFlashDeal && (
                    <Badge
                      variant="accent"
                      className="absolute left-4 top-4 font-semibold shadow-lg"
                    >
                      ⚡ Flash Deal - {listing.discountPercent}% OFF
                    </Badge>
                  )}
                  {listing.isTrending && !listing.isFlashDeal && (
                    <Badge
                      variant="destructive"
                      className="absolute left-4 top-4 font-semibold shadow-lg"
                    >
                      🔥 Trending
                    </Badge>
                  )}
                </div>

                {/* Image thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto bg-muted/50 p-3 sm:gap-3 sm:p-4">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-20 sm:w-20 ${
                          idx === selectedImageIndex
                            ? 'border-primary shadow-md'
                            : 'border-border hover:border-primary/50'
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
              <div className="space-y-5 bg-background p-4 sm:space-y-6 sm:p-6">
                {/* Title, Category, and Actions */}
                <div className="space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-3 text-foreground">{listing.title}</h2>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                        {listing.category}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover:border-destructive hover:text-destructive"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover:border-primary hover:text-primary"
                      >
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
                    <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-lg font-semibold text-primary-foreground">
                        {listing.seller.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            Hosted by {listing.seller.name}
                          </span>
                          {listing.seller.verificationStatus === 'verified' && (
                            <VerifiedBadge size="sm" />
                          )}
                        </div>
                        {listing.seller.rating && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 fill-current text-warning" />
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
                  <h3 className="font-bold text-lg mb-3 text-foreground">About this experience</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {listing.description}
                  </p>
                </div>

                <Separator />

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Capacity</p>
                      <p className="font-semibold text-foreground">{listing.maxGuests} guests</p>
                    </div>
                  </div>
                  {listing.checkInTime && listing.checkOutTime && (
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Check-in/out</p>
                        <p className="font-semibold text-foreground text-sm">
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
                      <h3 className="font-bold text-lg mb-3 text-foreground">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {listing.amenities.map((amenity, idx) => (
                          <Badge key={idx} variant="secondary">
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
                      <h3 className="font-bold text-lg mb-3 text-foreground">What's Included</h3>
                      <ul className="space-y-2.5">
                        {listing.inclusions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-success font-bold mt-0.5">✓</span>
                            <span className="text-foreground/90">{item}</span>
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
                      <h3 className="font-bold text-lg mb-3 text-foreground">Not Included</h3>
                      <ul className="space-y-2.5">
                        {listing.exclusions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-destructive font-bold mt-0.5">✗</span>
                            <span className="text-foreground/90">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* Cancellation Policy */}
                <Separator />
                <div>
                  <h3 className="font-bold text-lg mb-3 text-foreground">Cancellation Policy</h3>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                    {listing.cancellationPolicy}
                  </Badge>
                </div>

                {/* House Rules */}
                {listing.houseRules && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-bold text-lg mb-3 text-foreground">House Rules</h3>
                      <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {listing.houseRules}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Sticky Footer with Price and Book Button */}
              <div className="sticky bottom-0 border-t bg-background p-4 shadow-2xl sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div>
                    <div className="text-3xl font-bold text-foreground">
                      ৳
                      {Number(listing.discountedPrice || listing.basePrice || '0').toLocaleString()}
                    </div>
                    {listing.discountedPrice && (
                      <div className="text-base text-muted-foreground line-through">
                        ৳{Number(listing.basePrice).toLocaleString()}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">{listing.priceUnit}</p>
                  </div>
                  <Button size="lg" className="w-full rounded-xl px-8 sm:w-auto" asChild>
                    <Link to={`/listing/${listing.id}`}>View Details & Book</Link>
                  </Button>
                </div>
                {listing.groupEligible && (
                  <p className="text-sm text-center text-primary mt-3 font-medium">
                    💰 Group discounts up to 40% available
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
