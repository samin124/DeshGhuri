import { createFileRoute, Link } from '@tanstack/react-router';
import { Building2, Users, MapPin, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/seller/register')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="mx-auto max-w-4xl text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Become a DeshGhuri Seller
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Join Bangladesh's fastest-growing travel marketplace and reach thousands of travelers
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Reach More Customers</h3>
              <p className="text-sm text-muted-foreground">
                Access thousands of travelers looking for experiences
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">
                Protected escrow system ensures safe transactions
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Easy Management</h3>
              <p className="text-sm text-muted-foreground">
                Intuitive dashboard to manage bookings and inventory
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Build Your Brand</h3>
              <p className="text-sm text-muted-foreground">
                Showcase your business with verified seller badge
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Selection */}
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Business Type</CardTitle>
              <CardDescription>
                Select the category that best describes your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/seller/onboarding" search={{ category: 'agency' }}>
                <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Travel Agency</h3>
                      <p className="text-sm text-muted-foreground">
                        List tour packages, travel services, and customized itineraries
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/seller/onboarding" search={{ category: 'hotel' }}>
                <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Hotel / Resort</h3>
                      <p className="text-sm text-muted-foreground">
                        List your accommodation, rooms, and hospitality services
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/seller/onboarding" search={{ category: 'tour-operator' }}>
                <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Tour Operator</h3>
                      <p className="text-sm text-muted-foreground">
                        Offer unique experiences, activities, and guided tours
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </CardContent>
          </Card>

          {/* Already have account */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already registered?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in to your seller account
              </Link>
            </p>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="mx-auto max-w-4xl mt-12">
          <Card>
            <CardHeader>
              <CardTitle>What You'll Need</CardTitle>
              <CardDescription>
                Prepare these documents for a smooth verification process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Trade License</span> - Valid business registration
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">NID/Passport</span> - Government-issued ID of owner
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">TIN Certificate</span> - Required for revenue over BDT 50K/month
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Bank Account</span> - For receiving payouts
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Property/Tour License</span> - Additional documents based on your category
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
