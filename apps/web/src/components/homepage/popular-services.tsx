import { ChevronRight, Award, Star, Shield, ThumbsUp } from 'lucide-react';
import { Link } from '@tanstack/react-router';

import { ListingCard } from '@/components/common/listing-card';
import { useListings } from '@/lib/api/listings';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface PopularServicesProps {
  onListingClick?: (listingId: string) => void;
}

export default function PopularServices({ onListingClick }: PopularServicesProps) {
  // Fetch top-rated listings
  const { data, isLoading, error } = useListings({
    limit: 4,
    sort: 'rating',
  });

  return (
    <section className="relative border-b border-border/40 bg-background-subtle py-12">
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(0deg, transparent 24%, rgba(148, 163, 184, 0.12) 25%, rgba(148, 163, 184, 0.12) 26%, transparent 27%, transparent 74%, rgba(148, 163, 184, 0.12) 75%, rgba(148, 163, 184, 0.12) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(148, 163, 184, 0.12) 25%, rgba(148, 163, 184, 0.12) 26%, transparent 27%, transparent 74%, rgba(148, 163, 184, 0.12) 75%, rgba(148, 163, 184, 0.12) 76%, transparent 77%, transparent)',
            backgroundSize: '56px 56px',
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 lg:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/15">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Popular Services</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-muted-foreground">Top-rated experiences from verified sellers</p>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-primary/35 bg-primary/10 text-primary">
                  <Star className="mr-1 h-3 w-3 fill-current" />
                  Highest Rated
                </Badge>
                <Badge variant="outline" className="border-success/35 bg-success/10 text-success">
                  <Shield className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
                <Badge variant="outline" className="border-accent/35 bg-accent/10 text-accent">
                  <ThumbsUp className="mr-1 h-3 w-3" />
                  Most Booked
                </Badge>
              </div>
            </div>
          </div>
          <Link
            to="/search"
            search={{ sort: 'rating' }}
            className="hidden items-center gap-1 font-semibold text-primary hover:text-primary-hover hover:underline md:flex"
          >
            View All Services
            <ChevronRight className="h-4 w-4" />
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
              Failed to load popular services. Please try again later.
            </p>
          </div>
        )}

        {data?.data && data.data.length > 0 && (
          <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
