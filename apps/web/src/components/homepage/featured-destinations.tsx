import { Link } from '@tanstack/react-router';
import { useListings } from '@/lib/api/listings';

// Featured destinations with images
const FEATURED_DESTINATIONS = [
  {
    id: 'coxs-bazar',
    name: "Cox's Bazar",
    description: "World's longest natural sea beach",
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&h=400&fit=crop',
  },
  {
    id: 'sundarbans',
    name: 'Sundarbans',
    description: 'UNESCO World Heritage mangrove forest',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&h=400&fit=crop',
  },
  {
    id: 'sylhet',
    name: 'Sylhet',
    description: 'Tea gardens and lush green hills',
    image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=600&h=400&fit=crop',
  },
  {
    id: 'bandarban',
    name: 'Bandarban',
    description: 'Highest peaks and tribal culture',
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&h=400&fit=crop',
  },
  {
    id: 'rangamati',
    name: 'Rangamati',
    description: 'Lake city with serene beauty',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=400&fit=crop',
  },
  {
    id: 'sajek',
    name: 'Sajek Valley',
    description: 'Above the clouds experience',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop',
  },
];

export default function FeaturedDestinations() {
  // Fetch all listings to count by location
  const { data } = useListings({ limit: 1000 });

  // Count listings by city
  const locationCounts =
    data?.data?.reduce(
      (acc, listing) => {
        const city = listing.location?.city;
        if (city) {
          acc[city] = (acc[city] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  return (
    <section className="border-b border-border/40 bg-background-subtle py-16">
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
            Popular Destinations
          </h2>
          <p className="text-muted-foreground text-lg">
            Discover the most sought-after places in Bangladesh
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {FEATURED_DESTINATIONS.map((dest) => {
            const listingCount = locationCounts[dest.name] || 0;

            return (
              <Link key={dest.id} to="/search" search={{ location: dest.name }}>
                <div className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="mb-1 text-xl font-bold">{dest.name}</h3>
                    <p className="mb-3 text-sm text-white/90">{dest.description}</p>
                    <div className="text-xs font-medium text-white/80">
                      {listingCount} experiences
                    </div>
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
