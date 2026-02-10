import { ChevronRight, Award, Star, Shield, ThumbsUp } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { ListingCard } from "@/components/common/listing-card";
import { useListings } from "@/lib/api/listings";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface PopularServicesProps {
  onListingClick?: (listingId: string) => void;
}

export default function PopularServices({ onListingClick }: PopularServicesProps) {
  // Fetch top-rated listings
  const { data, isLoading, error } = useListings({
    limit: 6,
    sort: 'rating',
  });

  return (
    <section className="relative py-12 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-teal-950/20">
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(59, 130, 246, 0.05) 25%, rgba(59, 130, 246, 0.05) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.05) 75%, rgba(59, 130, 246, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(59, 130, 246, 0.05) 25%, rgba(59, 130, 246, 0.05) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.05) 75%, rgba(59, 130, 246, 0.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Popular Services
              </h2>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-muted-foreground">⭐ Top-rated experiences from verified sellers</p>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Highest Rated
                </Badge>
                <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
                <Badge variant="outline" className="border-purple-500 text-purple-700 bg-purple-50">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Most Booked
                </Badge>
              </div>
            </div>
          </div>
          <Link
            to="/search"
            search={{ sort: 'rating' }}
            className="hidden md:flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold hover:underline"
          >
            View All Services
            <ChevronRight className="h-4 w-4" />
          </Link>
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
              Failed to load popular services. Please try again later.
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
            <p className="text-muted-foreground">No popular services available at the moment.</p>
          </div>
        )}

        {/* Mobile "View All" button */}
        <div className="mt-6 text-center md:hidden">
          <Link
            to="/search"
            search={{ sort: 'rating' }}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            View All Services
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
