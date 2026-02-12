import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useEffect } from 'react';
import { Shield, Lock, Mail } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { getUser } from '@/functions/get-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { rpcClient } from '@/lib/api/rpc-client';

export const Route = createFileRoute('/admin/')({
  beforeLoad: async ({ search }) => {
    const session = await getUser();

    // If already logged in, check if they're an admin
    if (session) {
      try {
        const response = await rpcClient.api.admin.verify.$get();
        const data = await response.json();

        if (data.isAdmin) {
          // Already logged in as admin, redirect to return URL or dashboard
          const returnTo = search.return || '/admin/dashboard';
          throw redirect({ to: returnTo });
        } else {
          // User is logged in but not an admin - sign them out
          await authClient.signOut();
          // The error will be shown via the component state below
        }
      } catch (error) {
        // Not an admin or error checking, sign out
        if (session) {
          await authClient.signOut();
        }
      }
    }
  },
  component: AdminLoginPage,
  validateSearch: (search) => ({
    return: (search.return as string) || undefined,
  }),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const search = Route.useSearch();

  // Check for OAuth callback and verify admin status
  useEffect(() => {
    const checkOAuthCallback = async () => {
      // Check if user just logged in (e.g., via OAuth)
      const urlParams = new URLSearchParams(window.location.search);
      const hasCallbackParams = urlParams.has('state') || urlParams.has('code');

      if (hasCallbackParams) {
        // Wait a bit for Better Auth to process the callback
        setTimeout(async () => {
          const session = await getUser();
          if (session) {
            // User is logged in, verify admin role
            try {
              const response = await rpcClient.api.admin.verify.$get();
              const data = await response.json();

              if (data.isAdmin) {
                // Success! Redirect to return URL or dashboard
                const returnTo = search.return || '/admin/dashboard';
                navigate({ to: returnTo });
              } else {
                // Not an admin - sign out and show error
                await authClient.signOut();
                toast.error('Access Denied: This area is restricted to administrators only.', {
                  duration: 5000,
                });
              }
            } catch (error) {
              await authClient.signOut();
              toast.error('Unable to verify admin access. Please try again.');
            }
          }
        }, 1000);
      }
    };

    checkOAuthCallback();
  }, [navigate, search.return]);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        // Attempt login
        const result = await authClient.signIn.email(
          {
            email: value.email,
            password: value.password,
          },
          {
            onRequest: () => {
              // Don't navigate yet - need to verify admin status first
            },
          }
        );

        if (result.error) {
          toast.error(result.error.message || 'Invalid credentials');
          return;
        }

        // Login successful, now verify admin role
        try {
          const verifyResponse = await rpcClient.api.admin.verify.$get();
          const verifyData = await verifyResponse.json();

          if (!verifyData.isAdmin) {
            // Not an admin - sign them out and show error
            await authClient.signOut();
            toast.error('Access Denied: This area is restricted to administrators only.', {
              duration: 5000,
            });
            return;
          }

          // Successfully verified as admin
          toast.success('Welcome to Admin Panel');

          // Redirect to return URL or dashboard
          const returnTo = search.return || '/admin/dashboard';
          navigate({ to: returnTo });
        } catch (error) {
          // Error verifying admin status
          await authClient.signOut();
          toast.error('Unable to verify admin access. Please contact support.');
        }
      } catch (error) {
        toast.error('An error occurred during login. Please try again.');
      }
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
      }),
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo and Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/50">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Access</h1>
          <p className="mt-2 text-gray-400">DeshGhuri Administration Portal</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5 text-sm text-red-400 border border-red-500/20">
            <Lock className="h-3.5 w-3.5" />
            Restricted Area - Authorized Personnel Only
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-gray-700/50 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            {/* Email Field */}
            <div>
              <form.Field name="email">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-gray-200">
                      Administrator Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="admin@deshghuri.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="border-gray-600 bg-gray-900/50 pl-10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    {field.state.meta.errors.map((error) => (
                      <p key={error.toString()} className="text-sm text-red-400">
                        {error.toString()}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            {/* Password Field */}
            <div>
              <form.Field name="password">
                {(field) => (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={field.name} className="text-gray-200">
                        Password
                      </Label>
                      <button
                        type="button"
                        onClick={async () => {
                          const email = form.getFieldValue('email');
                          if (!email) {
                            toast.error('Please enter your email first');
                            return;
                          }

                          try {
                            await authClient.forgetPassword({
                              email,
                              redirectTo: window.location.origin + '/admin/reset-password',
                            });
                            toast.success('Password reset link sent to your email!');
                          } catch (error) {
                            toast.error('Failed to send reset link. Please try again.');
                          }
                        }}
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        placeholder="Enter your password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="border-gray-600 bg-gray-900/50 pl-10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    {field.state.meta.errors.map((error) => (
                      <p key={error.toString()} className="text-sm text-red-400">
                        {error.toString()}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            {/* Submit Button */}
            <form.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
                  disabled={!state.canSubmit || state.isSubmitting}
                  size="lg"
                >
                  {state.isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Access Admin Panel
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-800/50 px-2 text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-gray-600 bg-gray-900/50 text-gray-200 hover:bg-gray-700 hover:text-white"
            onClick={async () => {
              // Preserve return URL in OAuth callback
              const returnUrl = search.return;
              const callbackPath = returnUrl
                ? `/admin?return=${encodeURIComponent(returnUrl)}`
                : '/admin';

              await authClient.signIn.social({
                provider: 'google',
                callbackURL: window.location.origin + callbackPath,
              });
            }}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate({ to: '/' })}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            ← Back to Main Site
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          All login attempts are logged and monitored for security purposes
        </div>
      </div>
    </div>
  );
}
