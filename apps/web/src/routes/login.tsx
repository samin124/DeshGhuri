import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { authClient } from "@/lib/auth-client";
import { getPostLoginRedirect, getReturnUrlFromSearch } from "@/lib/auth/redirect-after-login";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
  validateSearch: (search) => ({
    return: (search.return as string) || undefined,
    tab: (search.tab as string) || undefined,
  }),
});

function RouteComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [activeTab, setActiveTab] = useState(search.tab || "signin");

  // Handle OAuth callback - redirect authenticated users
  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Check if user just logged in (OAuth callback has code/state params)
      const urlParams = new URLSearchParams(window.location.search);
      const hasOAuthParams = urlParams.has('code') || urlParams.has('state');

      if (hasOAuthParams) {
        // Wait for Better Auth to process the callback
        setTimeout(async () => {
          const session = await authClient.getSession();
          if (session?.data) {
            // User is authenticated, redirect based on roles
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
    <div className="mx-auto w-full mt-10 max-w-2xl p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Welcome to DeshGhuri</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
          <TabsTrigger value="seller">Become a Seller</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="mt-6">
          <SignInForm onSwitchToSignUp={() => setActiveTab("signup")} />
        </TabsContent>

        <TabsContent value="signup" className="mt-6">
          <SignUpForm onSwitchToSignIn={() => setActiveTab("signin")} />
        </TabsContent>

        <TabsContent value="seller" className="mt-6">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Start Your Seller Journey</h2>
              <p className="text-muted-foreground">
                Join our trusted marketplace and reach thousands of travelers
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">What you'll need:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Valid business registration documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Trade license and NID/Passport</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Bank account or mobile banking details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Business contact information</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> Seller accounts require email verification and admin approval before you can start listing. The process typically takes 1-2 business days.
              </p>
            </div>

            <button
              onClick={() => navigate({ to: "/seller/signup" })}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors"
            >
              Continue to Seller Registration
            </button>

            <div className="text-center text-sm text-muted-foreground">
              Already have a seller account?{" "}
              <button
                onClick={() => setActiveTab("signin")}
                className="text-primary hover:underline font-medium"
              >
                Sign in here
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
