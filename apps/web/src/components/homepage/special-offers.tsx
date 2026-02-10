import { Sparkles, Users, TrendingDown } from "lucide-react";

import { ListingCard } from "@/components/common/listing-card";
import { useListings } from "@/lib/api/listings";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface SpecialOffersProps {
  onListingClick?: (listingId: string) => void;
}

export default function SpecialOffers({ onListingClick }: SpecialOffersProps) {
  // Use listings with group discounts for special offers
  const { data, isLoading, error } = useListings({
    groupEligible: true,
    limit: 2,
    sort: 'popular',
  });

  return (
    <section className="relative py-12 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-8 w-8 text-purple-600 animate-pulse" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Special Offers
            </h2>
            <Sparkles className="h-8 w-8 text-pink-600 animate-pulse" />
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <p className="text-muted-foreground">💎 Exclusive deals handpicked for you</p>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Users className="h-3 w-3 mr-1" />
              Group Discounts
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <TrendingDown className="h-3 w-3 mr-1" />
              Save up to 40%
            </Badge>
          </div>
        </div>

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        )}

        {error && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              Failed to load special offers. Please try again later.
            </p>
          </div>
        )}

        {data?.data && data.data.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {data.data.slice(0, 2).map((offer) => (
              <ListingCard key={offer.id} listing={offer} onClick={onListingClick} />
            ))}
          </div>
        )}

        {data?.data && data.data.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No special offers available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
