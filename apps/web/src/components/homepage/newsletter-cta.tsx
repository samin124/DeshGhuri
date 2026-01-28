import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function NewsletterCTA() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Successfully subscribed to newsletter!");
      setEmail("");
    }
  };

  return (
    <section className="bg-primary py-16 text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <Mail className="mx-auto mb-4 h-12 w-12" />
        <h2 className="mb-2 text-3xl font-bold">Stay Updated</h2>
        <p className="mb-6 text-primary-foreground/90">
          Subscribe to get exclusive deals and travel tips delivered to your inbox
        </p>
        <form onSubmit={handleSubscribe} className="mx-auto flex max-w-md gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            className="flex-1 bg-primary-foreground text-foreground"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" variant="secondary">
            Subscribe
          </Button>
        </form>
        <p className="mt-4 text-xs text-primary-foreground/70">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
