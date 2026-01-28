import { RefreshCw } from "lucide-react";

import { ListingCard } from "@/components/common/listing-card";
import { mockTrendingListings } from "@/lib/mock-data";

export default function TrendingListings() {
  return (
    <section className="bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">🔥 Trending Now</h2>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              Updated hourly
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockTrendingListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
}
