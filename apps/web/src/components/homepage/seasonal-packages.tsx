import { Snowflake, Calendar, MapPin, Sparkles } from 'lucide-react';

import { ListingCard } from '@/components/common/listing-card';
import { useListingsByCategory } from '@/lib/api/listings';
import { Skeleton } from '@/components/ui/skeleton';
import { LISTING_CATEGORIES } from '@/lib/constants/categories';
import { Badge } from '@/components/ui/badge';

interface SeasonalPackagesProps {
  onListingClick?: (listingId: string) => void;
}

export default function SeasonalPackages({ onListingClick }: SeasonalPackagesProps) {
  const { data, isLoading, error } = useListingsByCategory(LISTING_CATEGORIES.TOUR_PACKAGE, 4);

  return (
    <section className="relative border-b border-border/40 bg-background-subtle py-12">
      {/* Soft winter decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Snowflake className="animate-spin-slow absolute left-10 top-10 h-8 w-8 text-primary/20" />
        <Snowflake className="animate-spin-slow absolute right-20 top-20 h-6 w-6 text-muted-foreground/20" />
        <Snowflake className="animate-spin-slow absolute bottom-20 left-1/4 h-10 w-10 text-primary/15" />
        <Snowflake className="animate-spin-slow absolute bottom-32 right-1/3 h-7 w-7 text-muted-foreground/20" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 lg:px-6">
        <div className="mb-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="relative">
              <Snowflake className="h-10 w-10 animate-spin-slow text-primary" />
              <Sparkles className="absolute -right-1 -top-1 h-4 w-4 animate-pulse text-accent" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Winter Special Packages</h2>
            <div className="relative">
              <Snowflake className="h-10 w-10 animate-spin-slow text-primary" />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <p className="text-muted-foreground">
              Perfect season for travel adventures in Bangladesh
            </p>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-primary/35 bg-primary/10 text-primary">
                <Calendar className="mr-1 h-3 w-3" />
                Dec - Feb
              </Badge>
              <Badge variant="outline" className="border-accent/35 bg-accent/10 text-accent">
                <MapPin className="mr-1 h-3 w-3" />
                Tour Packages
              </Badge>
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
              Failed to load seasonal packages. Please try again later.
            </p>
          </div>
        )}

        {data?.data && data.data.length > 0 && (
          <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.data.slice(0, 4).map((pkg) => (
              <ListingCard key={pkg.id} listing={pkg} onClick={onListingClick} className="h-full" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
