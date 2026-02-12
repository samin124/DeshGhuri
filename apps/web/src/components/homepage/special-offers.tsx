import { Sparkles, Users, TrendingDown } from 'lucide-react';

import { ListingCard } from '@/components/common/listing-card';
import { useListings } from '@/lib/api/listings';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface SpecialOffersProps {
  onListingClick?: (listingId: string) => void;
}

export default function SpecialOffers({ onListingClick }: SpecialOffersProps) {
  // Use listings with group discounts for special offers
  const { data, isLoading, error } = useListings({
    groupEligible: true,
    limit: 4,
    sort: 'popular',
  });

  return (
    <section className="relative py-16 bg-primary/10 border-b">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-7 w-7 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Special Offers</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Exclusive group booking deals with massive savings
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Badge variant="default">
              <Users className="h-3 w-3 mr-1" />
              Group Discounts
            </Badge>
            <Badge variant="success">
              <TrendingDown className="h-3 w-3 mr-1" />
              Save up to 40%
            </Badge>
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
              Failed to load special offers. Please try again later.
            </p>
          </div>
        )}

        {data?.data && data.data.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
            {data.data.slice(0, 4).map((offer) => (
              <ListingCard
                key={offer.id}
                listing={offer}
                onClick={onListingClick}
                className="h-full"
              />
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
