import { Link } from '@tanstack/react-router';
import { Building2, MapPin, Sparkles, Car } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { LISTING_CATEGORIES, CATEGORY_DISPLAY_NAMES } from '@/lib/constants/categories';
import { useListings } from '@/lib/api/listings';

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
  const categoryCounts =
    data?.data?.reduce(
      (acc, listing) => {
        acc[listing.category] = (acc[listing.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  const categories = Object.values(LISTING_CATEGORIES).map((categoryValue) => ({
    id: categoryValue,
    name: CATEGORY_DISPLAY_NAMES[categoryValue],
    Icon: CATEGORY_ICONS[categoryValue],
    count: categoryCounts[categoryValue] || 0,
  }));

  return (
    <section id="categories" className="py-16 scroll-mt-20 bg-background-subtle">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
            Browse by Category
          </h2>
          <p className="text-muted-foreground text-lg">Find exactly what you're looking for</p>
        </div>

        <div className="grid gap-6 grid-cols-2 md:grid-cols-4 auto-rows-fr">
          {categories.map((category) => {
            const Icon = category.Icon;
            return (
              <Link key={category.id} to="/search" search={{ category: category.id }}>
                <Card className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border hover:border-primary/50 h-full">
                  <div className="flex flex-col items-center p-6 text-center">
                    <div className="mb-3 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold text-foreground group-hover:text-primary transition-colors">
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
