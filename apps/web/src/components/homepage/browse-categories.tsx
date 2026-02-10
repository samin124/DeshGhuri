import { Link } from "@tanstack/react-router";
import { Building2, MapPin, Sparkles, Car } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LISTING_CATEGORIES, CATEGORY_DISPLAY_NAMES } from "@/lib/constants/categories";
import { useListings } from "@/lib/api/listings";

const CATEGORY_ICONS = {
  [LISTING_CATEGORIES.HOTEL]: Building2,
  [LISTING_CATEGORIES.TOUR_PACKAGE]: MapPin,
  [LISTING_CATEGORIES.EXPERIENCE]: Sparkles,
  [LISTING_CATEGORIES.TRANSPORT]: Car,
};

export default function BrowseCategories() {
  // Fetch all listings to count by category
  const { data } = useListings({ limit: 1000 });

  // Count listings by category
  const categoryCounts = data?.data?.reduce((acc, listing) => {
    acc[listing.category] = (acc[listing.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const categories = Object.values(LISTING_CATEGORIES).map((categoryValue) => ({
    id: categoryValue,
    name: CATEGORY_DISPLAY_NAMES[categoryValue],
    Icon: CATEGORY_ICONS[categoryValue],
    count: categoryCounts[categoryValue] || 0,
  }));

  return (
    <section id="categories" className="py-12 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Browse by Category</h2>
          <p className="text-muted-foreground">Find what you're looking for</p>
        </div>

        <div className="grid gap-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.Icon;
            return (
              <Link
                key={category.id}
                to="/search"
                search={{ category: category.id }}
              >
                <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
                  <div className="flex flex-col items-center p-6 text-center">
                    <Icon className="mb-3 h-12 w-12 text-primary" />
                    <h3 className="mb-1 font-semibold group-hover:text-primary">
                      {category.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {category.count} listings
                    </Badge>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
