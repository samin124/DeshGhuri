import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Building2, Users, MapPin, Shield } from 'lucide-react';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/seller/register')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new landing page
    navigate({ to: '/seller' });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold mb-4">Redirecting...</h1>
          <p className="text-muted-foreground">Please wait while we redirect you to the seller registration page.</p>
        </div>
      </div>
    </div>
  );
}
