import { Link } from "@tanstack/react-router";
import { ChevronRight, Zap, Clock } from "lucide-react";

import { ListingCard } from "@/components/common/listing-card";
import { useFlashDeals } from "@/lib/api/listings";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface FlashDealsProps {
  onListingClick?: (listingId: string) => void;
}

export default function FlashDeals({ onListingClick }: FlashDealsProps) {
  // Get only active flash deals
  const { data, isLoading, error } = useFlashDeals();

  return (
    <section id="deals" className="relative py-12 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950/20 dark:via-red-950/20 dark:to-pink-950/20 scroll-mt-20">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center animate-pulse">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Flash Deals
              </h2>
              <Badge variant="destructive" className="animate-pulse">
                <Clock className="h-3 w-3 mr-1" />
                Limited Time
              </Badge>
            </div>
            <p className="text-muted-foreground">🔥 Hottest deals - Grab them before they're gone!</p>
          </div>
          <Link
            to="/search"
            search={{ flashDeals: 'true', sort: 'newest' }}
            className="hidden md:flex items-center gap-1 text-orange-600 hover:text-orange-700 font-semibold hover:underline"
          >
            View All Deals
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.data.slice(0, 4).map((deal) => (
              <ListingCard
                key={deal.id}
                listing={deal}
                showCountdown={true}
                onClick={onListingClick}
              />
            ))}
          </div>
        ) : !isLoading && !error && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              No flash deals available right now. Check back soon!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
