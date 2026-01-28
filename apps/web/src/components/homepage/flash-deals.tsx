import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { ListingCard } from "@/components/common/listing-card";
import { mockFlashDeals } from "@/lib/mock-data";

export default function FlashDeals() {
  return (
    <section className="bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">⚡ Flash Deals</h2>
            <p className="text-muted-foreground">Limited time offers - Book now!</p>
          </div>
          <Link
            to="/deals"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mockFlashDeals.map((deal) => (
            <ListingCard key={deal.id} listing={deal} showCountdown={true} />
          ))}
        </div>
      </div>
    </section>
  );
}
