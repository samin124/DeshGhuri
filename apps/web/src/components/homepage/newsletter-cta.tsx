import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function NewsletterCTA() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
    }
  };

  return (
    <section className="relative overflow-hidden bg-background-subtle py-16">
      <div className="mx-auto w-full max-w-7xl px-4 text-center lg:px-6">
        <div className="mx-auto max-w-2xl rounded-2xl px-6 py-10 shadow-lg gradient-primary md:px-8">
          <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <h2 className="mb-3 text-3xl md:text-4xl font-bold text-white">Get Exclusive Deals</h2>
          <p className="mb-8 text-lg text-white/95">
            Subscribe to receive special offers and travel inspiration
          </p>
          <form
            onSubmit={handleSubscribe}
            className="mx-auto flex flex-col sm:flex-row max-w-md gap-3"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-white text-foreground h-12 px-4 border-0"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold h-12 px-8"
            >
              Subscribe
            </Button>
          </form>
          <p className="mt-4 text-sm text-white/80">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}
