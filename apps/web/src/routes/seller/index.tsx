import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Store,
  Shield,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  LogIn,
  UserPlus
} from 'lucide-react';

export const Route = createFileRoute('/seller/')({
  component: BecomeASellerLanding,
});

function BecomeASellerLanding() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Become a Seller on DeshGhuri
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join Bangladesh's leading travel marketplace and reach thousands of travelers
        </p>
      </div>

      {/* Main CTA Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
        {/* Sign Up Card */}
        <Card className="border-2 hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="h-6 w-6 text-primary" />
              <CardTitle>New Seller</CardTitle>
            </div>
            <CardDescription>
              Don't have an account yet? Start your seller journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Create your business profile</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Verify your email and business documents</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Set up payment methods (Bkash or Nagad)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Wait for admin approval</span>
              </li>
            </ul>
            <Button className="w-full" size="lg" asChild>
              <Link to="/seller/signup">
                Sign Up as Seller
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Sign In Card */}
        <Card className="border-2 hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <LogIn className="h-6 w-6 text-primary" />
              <CardTitle>Existing Seller</CardTitle>
            </div>
            <CardDescription>
              Already applied or have a seller account?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Sign in with your registered email</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Check your application status</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Access your seller dashboard (if approved)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Manage your listings and bookings</span>
              </li>
            </ul>
            <Button className="w-full" size="lg" variant="outline" asChild>
              <Link to="/seller/signin">
                Sign In to Seller Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Why Sell on DeshGhuri?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-lg">Reach More Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Connect with thousands of travelers looking for tours, hotels, and experiences
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-lg">Secure Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get paid securely with escrow protection and automated fund release
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Store className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-lg">Easy Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage bookings, reviews, and earnings from a single dashboard
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-lg">Grow Your Business</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access analytics and insights to optimize your listings and increase revenue
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>What You Need to Get Started</CardTitle>
            <CardDescription>
              Make sure you have these ready before applying
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Business Documents</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Trade License</li>
                  <li>• National ID or Passport</li>
                  <li>• TIN Certificate (optional)</li>
                  <li>• Property Documents (for hotels)</li>
                  <li>• Tour License (for tour operators)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Payment Information</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Bkash or Nagad account (at least one)</li>
                  <li>• Account must be in business name</li>
                  <li>• Bank account details</li>
                  <li>• Valid email address (Gmail preferred)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support Section */}
      <div className="text-center mt-12">
        <p className="text-muted-foreground">
          Need help? Contact our seller support team at{' '}
          <a href="mailto:seller-support@deshghuri.com" className="text-primary hover:underline">
            seller-support@deshghuri.com
          </a>
        </p>
      </div>
    </div>
  );
}
