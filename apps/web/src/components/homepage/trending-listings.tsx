import { TrendingUp, Eye, Heart } from 'lucide-react';

import { ListingCard } from '@/components/common/listing-card';
import { useTrendingListings } from '@/lib/api/listings';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface TrendingListingsProps {
  onListingClick?: (listingId: string) => void;
}

export default function TrendingListings({ onListingClick }: TrendingListingsProps) {
  const { data, isLoading, error } = useTrendingListings();

  return (
    <section className="relative border-b border-border/40 bg-background-subtle py-16">
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Trending Now</h2>
              <Badge variant="destructive">🔥 Hot</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                Most viewed
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                Most loved
              </span>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
            {data.data.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={onListingClick}
                className="h-full"
              />
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
