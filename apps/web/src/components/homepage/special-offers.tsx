import { ListingCard } from "@/components/common/listing-card";
import { mockSpecialOffers } from "@/lib/mock-data";

export default function SpecialOffers() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold">Special Offers</h2>
          <p className="text-muted-foreground">Exclusive deals just for you</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {mockSpecialOffers.map((offer) => (
            <ListingCard key={offer.id} listing={offer} />
          ))}
        </div>
      </div>
    </section>
  );
}
