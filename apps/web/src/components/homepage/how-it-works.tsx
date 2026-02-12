import { Search, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

const steps = [
  {
    icon: Search,
    title: 'Search & Book',
    description: 'Browse listings and select your perfect travel experience',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Pay with confidence - funds held in escrow until service delivery',
  },
  {
    icon: Shield,
    title: 'Service Delivery',
    description: 'Enjoy your trip knowing your payment is protected',
  },
  {
    icon: CheckCircle,
    title: 'Verified Completion',
    description: 'Seller submits proof, payment released after verification',
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground">Simple, secure, and transparent booking process</p>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="relative p-6 text-center">
                {index < steps.length - 1 && (
                  <div
                    className="absolute right-0 top-1/2 hidden h-0.5 w-4 bg-primary md:block"
                    style={{ transform: 'translateX(100%)' }}
                  />
                )}
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="mb-2 text-sm font-semibold text-primary">Step {index + 1}</div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
