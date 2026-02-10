import { TrendingUp, Eye, Heart, RefreshCw } from "lucide-react";

import { ListingCard } from "@/components/common/listing-card";
import { useTrendingListings } from "@/lib/api/listings";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface TrendingListingsProps {
  onListingClick?: (listingId: string) => void;
}

export default function TrendingListings({ onListingClick }: TrendingListingsProps) {
  const { data, isLoading, error } = useTrendingListings();

  return (
    <section className="relative py-12 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/20 dark:via-yellow-950/20 dark:to-orange-950/20">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />

      <div className="container mx-auto px-4 relative">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="relative">
                <TrendingUp className="h-8 w-8 text-orange-600 animate-bounce" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Trending Now
              </h2>
              <Badge variant="outline" className="border-orange-500 text-orange-700 bg-orange-50">
                🔥 Hot
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Most viewed
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                Most loved
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Updated hourly
              </span>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        )}

        {error && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              Failed to load trending listings. Please try again later.
            </p>
          </div>
        )}

        {data?.data && data.data.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((listing) => (
              <ListingCard key={listing.id} listing={listing} onClick={onListingClick} />
            ))}
          </div>
        )}

        {data?.data && data.data.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No trending listings at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
