import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { useListings } from "@/lib/api/listings";

// Featured destinations with images
const FEATURED_DESTINATIONS = [
  {
    id: "coxs-bazar",
    name: "Cox's Bazar",
    description: "World's longest natural sea beach",
    image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&h=400&fit=crop",
  },
  {
    id: "sundarbans",
    name: "Sundarbans",
    description: "UNESCO World Heritage mangrove forest",
    image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&h=400&fit=crop",
  },
  {
    id: "sylhet",
    name: "Sylhet",
    description: "Tea gardens and lush green hills",
    image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=600&h=400&fit=crop",
  },
  {
    id: "bandarban",
    name: "Bandarban",
    description: "Highest peaks and tribal culture",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&h=400&fit=crop",
  },
  {
    id: "rangamati",
    name: "Rangamati",
    description: "Lake city with serene beauty",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=400&fit=crop",
  },
  {
    id: "sajek",
    name: "Sajek Valley",
    description: "Above the clouds experience",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop",
  },
];

export default function FeaturedDestinations() {
  // Fetch all listings to count by location
  const { data } = useListings({ limit: 1000 });

  // Count listings by city
  const locationCounts = data?.data?.reduce((acc, listing) => {
    const city = listing.location?.city;
    if (city) {
      acc[city] = (acc[city] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <section className="bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Featured Destinations</h2>
          <p className="text-muted-foreground">Explore beautiful places in Bangladesh</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_DESTINATIONS.map((dest) => {
            const listingCount = locationCounts[dest.name] || 0;

            return (
              <Link
                key={dest.id}
                to="/search"
                search={{ location: dest.name }}
              >
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
                      {listingCount} listings
                    </Badge>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
