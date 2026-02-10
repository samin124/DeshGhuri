import { Snowflake, Calendar, MapPin, Sparkles } from "lucide-react";

import { ListingCard } from "@/components/common/listing-card";
import { useListingsByCategory } from "@/lib/api/listings";
import { Skeleton } from "@/components/ui/skeleton";
import { LISTING_CATEGORIES } from "@/lib/constants/categories";
import { Badge } from "@/components/ui/badge";

interface SeasonalPackagesProps {
  onListingClick?: (listingId: string) => void;
}

export default function SeasonalPackages({ onListingClick }: SeasonalPackagesProps) {
  const { data, isLoading, error } = useListingsByCategory(
    LISTING_CATEGORIES.TOUR_PACKAGE,
    3
  );

  return (
    <section className="relative py-12 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-sky-950/20 dark:via-blue-950/20 dark:to-indigo-950/20">
      {/* Animated snowflakes effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Snowflake className="absolute top-10 left-10 h-8 w-8 text-blue-200 animate-spin-slow opacity-50" />
        <Snowflake className="absolute top-20 right-20 h-6 w-6 text-sky-200 animate-spin-slow opacity-40" />
        <Snowflake className="absolute bottom-20 left-1/4 h-10 w-10 text-indigo-200 animate-spin-slow opacity-30" />
        <Snowflake className="absolute bottom-32 right-1/3 h-7 w-7 text-cyan-200 animate-spin-slow opacity-50" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="relative">
              <Snowflake className="h-10 w-10 text-blue-500 animate-spin-slow" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-cyan-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Winter Special Packages
            </h2>
            <div className="relative">
              <Snowflake className="h-10 w-10 text-indigo-500 animate-spin-slow" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <p className="text-muted-foreground">❄️ Perfect season for travel adventures in Bangladesh</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                <Calendar className="h-3 w-3 mr-1" />
                Dec - Feb
              </Badge>
              <Badge variant="outline" className="border-cyan-500 text-cyan-700 bg-cyan-50">
                <MapPin className="h-3 w-3 mr-1" />
                Tour Packages
              </Badge>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
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
          <div className="grid gap-6 md:grid-cols-3">
            {data.data.slice(0, 3).map((pkg) => (
              <ListingCard key={pkg.id} listing={pkg} onClick={onListingClick} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
