import { mockStats } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";

export default function StatsSection() {
  return (
    <section className="bg-primary py-12 text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-4">
          {mockStats.map((stat) => (
            <Card key={stat.id} className="border-primary-foreground/10 bg-primary-foreground/5 text-center p-6">
              <div className="mb-2 text-4xl">{stat.icon}</div>
              <div className="mb-1 text-4xl font-bold">{stat.value}{stat.suffix}</div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
