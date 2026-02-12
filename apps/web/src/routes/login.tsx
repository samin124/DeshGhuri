import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { MapPin, Shield, Users, Star, CheckCircle, Store, ArrowRight } from 'lucide-react';

import SignInForm from '@/components/sign-in-form';
import SignUpForm from '@/components/sign-up-form';
import { authClient } from '@/lib/auth-client';
import { getPostLoginRedirect, getReturnUrlFromSearch } from '@/lib/auth/redirect-after-login';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  validateSearch: (search) => ({
    return: (search.return as string) || undefined,
    tab: (search.tab as string) || undefined,
  }),
});

function RouteComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [activeTab, setActiveTab] = useState(search.tab || 'signin');

  // Handle OAuth callback - redirect authenticated users
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hasOAuthParams = urlParams.has('code') || urlParams.has('state');

      if (hasOAuthParams) {
        setTimeout(async () => {
          const session = await authClient.getSession();
          if (session?.data) {
            const redirectTo = await getPostLoginRedirect({
              preferredDestination: search.return,
            });
            navigate({ to: redirectTo });
          }
        }, 1000);
      }
    };

    handleOAuthCallback();
  }, [navigate, search.return]);

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          {/* Left Side - Branding & Features */}
          <div className="hidden lg:block space-y-8">
            {/* Logo & Tagline */}
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-3">
                Welcome to <span className="text-primary">DeshGhuri</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Your trusted travel marketplace in Bangladesh
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Explore Bangladesh</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover amazing destinations from Cox's Bazar to Sundarbans
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Secure Payments</h3>
                  <p className="text-sm text-muted-foreground">
                    Escrow-protected transactions for peace of mind
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Group Discounts</h3>
                  <p className="text-sm text-muted-foreground">
                    Save up to 40% when you book with friends
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Verified Sellers</h3>
                  <p className="text-sm text-muted-foreground">
                    All sellers are verified for quality assurance
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-white shadow-sm">
                <p className="text-2xl font-bold text-primary">10K+</p>
                <p className="text-xs text-muted-foreground">Happy Travelers</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white shadow-sm">
                <p className="text-2xl font-bold text-primary">500+</p>
                <p className="text-xs text-muted-foreground">Verified Sellers</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white shadow-sm">
                <p className="text-2xl font-bold text-primary">4.8</p>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome to <span className="text-primary">DeshGhuri</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Your trusted travel marketplace
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#f8f7f4] p-1 rounded-xl">
                  <TabsTrigger
                    value="signin"
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-0">
                  <SignInForm onSwitchToSignUp={() => setActiveTab('signup')} />
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <SignUpForm onSwitchToSignIn={() => setActiveTab('signin')} />
                </TabsContent>
              </Tabs>

              {/* Become a Seller CTA */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Become a Seller</h3>
                      <p className="text-xs text-muted-foreground">
                        Start earning by listing your services
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl bg-white hover:bg-white/80"
                    onClick={() => navigate({ to: '/seller/signup' })}
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Trusted</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500" />
                <span>Top Rated</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
