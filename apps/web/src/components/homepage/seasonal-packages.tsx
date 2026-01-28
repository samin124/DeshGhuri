import { ListingCard } from "@/components/common/listing-card";
import { mockSeasonalPackages } from "@/lib/mock-data";

export default function SeasonalPackages() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">❄️ Winter Special Packages</h2>
          <p className="text-muted-foreground">Perfect season for travel adventures</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {mockSeasonalPackages.map((pkg) => (
            <ListingCard key={pkg.id} listing={pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}
