import { mockStats } from '@/lib/mock-data';

export default function StatsSection() {
  return (
    <section className="relative border-b border-border/40 bg-background-subtle py-16">
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
        {/* Stats Grid - Simple and Clean */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {mockStats.map((stat, _index) => (
            <div key={stat.id} className="text-center">
              <div className="mb-3 text-4xl">{stat.icon}</div>
              <div className="mb-1 text-3xl md:text-4xl font-bold text-primary">
                {stat.value}
                {stat.suffix}
              </div>
              <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
