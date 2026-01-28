import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { mockCategories } from "@/lib/mock-data";

export default function BrowseCategories() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Browse by Category</h2>
          <p className="text-muted-foreground">Find what you're looking for</p>
        </div>

        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {mockCategories.map((category) => (
            <Link key={category.id} to={`/categories/${category.id}`}>
              <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
                <div className="flex flex-col items-center p-6 text-center">
                  <div className="mb-3 text-5xl">{category.icon}</div>
                  <h3 className="mb-1 font-semibold group-hover:text-primary">
                    {category.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {category.count} listings
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
