import { Link } from '@tanstack/react-router';
import { ChevronRight, Zap, Clock } from 'lucide-react';

import { ListingCard } from '@/components/common/listing-card';
import { useFlashDeals } from '@/lib/api/listings';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface FlashDealsProps {
  onListingClick?: (listingId: string) => void;
}

export default function FlashDeals({ onListingClick }: FlashDealsProps) {
  // Get only active flash deals
  const { data, isLoading, error } = useFlashDeals();

  return (
    <section
      id="deals"
      className="relative scroll-mt-20 border-b border-border/40 bg-background-subtle py-16"
    >
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-8 w-8 text-accent" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Flash Deals</h2>
              <Badge variant="accent">
                <Clock className="h-3 w-3 mr-1" />
                Limited Time
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Special offers available for a limited time only
            </p>
          </div>
          <Link
            to="/search"
            search={{ flashDeals: 'true', sort: 'newest' }}
            className="hidden md:flex items-center gap-1 text-primary hover:text-primary-hover font-semibold transition-colors"
          >
            View All
            <ChevronRight className="h-5 w-5" />
          </Link>
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
              Failed to load flash deals. Please try again later.
            </p>
          </div>
        )}

        {data?.data && data.data.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
            {data.data.slice(0, 4).map((deal) => (
              <ListingCard
                key={deal.id}
                listing={deal}
                showCountdown={true}
                onClick={onListingClick}
                className="h-full"
              />
            ))}
          </div>
        ) : (
          !isLoading &&
          !error && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No flash deals available right now. Check back soon!
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
