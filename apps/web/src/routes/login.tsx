import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { authClient } from "@/lib/auth-client";
import { getPostLoginRedirect, getReturnUrlFromSearch } from "@/lib/auth/redirect-after-login";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
  validateSearch: (search) => ({
    return: (search.return as string) || undefined,
  }),
});

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(false);
  const navigate = useNavigate();
  const search = Route.useSearch();

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

  return showSignIn ? (
    <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
  ) : (
    <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
  );
}
