import { Card } from "@/components/ui/card";
import { mockCategories } from "@/lib/mock-data";

export default function PopularServices() {
  return (
    <section className="bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Popular Services</h2>
          <p className="text-muted-foreground">Choose from our top service categories</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockCategories.slice(0, 6).map((service) => (
            <Card key={service.id} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-3">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
