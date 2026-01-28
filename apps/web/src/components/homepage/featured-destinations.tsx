import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { mockDestinations } from "@/lib/mock-data";

export default function FeaturedDestinations() {
  return (
    <section className="bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Featured Destinations</h2>
          <p className="text-muted-foreground">Explore beautiful places in Bangladesh</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockDestinations.map((dest) => (
            <Link key={dest.id} to={`/destinations/${dest.id}`}>
              <div className="group relative overflow-hidden rounded-lg">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="h-72 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="mb-2 text-2xl font-bold">{dest.name}</h3>
                  <p className="mb-3 text-sm text-white/90">{dest.description}</p>
                  <Badge className="bg-primary">
                    {dest.listingCount} listings
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
