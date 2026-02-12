import { mockPartners } from '@/lib/mock-data';

export default function PartnersSection() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Trusted By Thousands</h2>
          <p className="text-muted-foreground">Our partners and affiliations</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {mockPartners.map((partner) => (
            <div key={partner.id} className="grayscale hover:grayscale-0 transition-all">
              <img src={partner.logo} alt={partner.name} className="h-16 w-24 object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
