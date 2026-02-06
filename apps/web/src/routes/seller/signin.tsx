import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useSellerSession } from '@/contexts/seller-session-context';
import { authClient } from '@/lib/auth-client';
import { getPostLoginRedirect, getReturnUrlFromSearch } from '@/lib/auth/redirect-after-login';

export const Route = createFileRoute('/seller/signin')({
  component: RouteComponent,
  validateSearch: (search) => ({
    return: (search.return as string) || undefined,
    oauth: (search.oauth as string) || undefined,
  }),
});

interface SigninResponse {
  success: boolean;
  status?: string;
  message: string;
  email?: string;
  data?: {
    sellerId: string;
    businessName: string;
    email: string;
  };
}

function RouteComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { refetch } = useSellerSession();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'info' | 'warning' | 'error';
    title: string;
    message: string;
  } | null>(null);

  // Handle OAuth callback - check if user has seller role
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (search.oauth === 'true') {
        // Wait for Better Auth to process callback
        setTimeout(async () => {
          const session = await authClient.getSession();
          if (session?.data) {
            // User authenticated, check if they have seller role
            try {
              const response = await fetch('http://localhost:3000/api/auth/roles', {
                credentials: 'include',
              });
              const data = await response.json();

              if (data.roles?.includes('seller')) {
                // Has seller role, redirect to return URL or dashboard
                await refetch();
                const returnTo = search.return || '/seller/dashboard';
                toast.success('Welcome back! Redirecting to your dashboard...');
                navigate({ to: returnTo });
              } else {
                // No seller role
                await authClient.signOut();
                setErrorMessage('This account is not registered as a seller. Please apply to become a seller first.');
              }
            } catch (error) {
              await authClient.signOut();
              setErrorMessage('Unable to verify seller account. Please try again.');
            }
          }
        }, 1000);
      }
    };

    handleOAuthCallback();
  }, [search.oauth, search.return, navigate, refetch]);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setErrorMessage(null);
      setStatusMessage(null);

      try {
        const response = await fetch('http://localhost:3000/api/seller/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: value.email,
            password: value.password,
          }),
        });

        const result: SigninResponse = await response.json();

        if (result.success && result.data) {
          // Successful signin - refetch seller session to update navbar immediately
          await refetch();

          // Determine redirect destination (return URL or dashboard)
          const returnTo = search.return || '/seller/dashboard';

          // Show success message and redirect
          toast.success('Welcome back! Redirecting to your dashboard...');
          setTimeout(() => {
            navigate({ to: returnTo });
          }, 1000);
          return;
        }

        // Handle various status responses
        if (!result.success && result.status) {
          handleStatusResponse(result);
          return;
        }

        // Generic error
        setErrorMessage(result.message || 'Invalid email or password');
      } catch (error: any) {
        console.error('Signin error:', error);
        setErrorMessage('Failed to sign in. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
  });

  function handleStatusResponse(result: SigninResponse) {
    switch (result.status) {
      case 'pending':
        setStatusMessage({
          type: 'info',
          title: 'Application Under Review',
          message: result.message || 'Your seller application is currently under review. We will notify you once it is approved.',
        });
        break;
      case 'in-review':
        setStatusMessage({
          type: 'info',
          title: 'Application In Review',
          message: result.message || 'Your application is currently being reviewed by our team. You will receive an email once approved.',
        });
        break;
      case 'rejected':
        setStatusMessage({
          type: 'error',
          title: 'Application Rejected',
          message: result.message || 'Your seller application has been rejected. Please contact support for more information.',
        });
        break;
      case 'incomplete':
        setStatusMessage({
          type: 'warning',
          title: 'Incomplete Application',
          message: result.message || 'Your seller application is incomplete. Please complete all required information.',
        });
        break;
      case 'email-not-verified':
        setStatusMessage({
          type: 'warning',
          title: 'Email Not Verified',
          message: result.message || 'Please verify your email before signing in. Check your inbox for the verification link.',
        });
        break;
      default:
        setErrorMessage(result.message || 'Unable to sign in at this time');
    }
  }

  async function handleResendVerification() {
    const email = form.state.values.email;
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/seller/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Verification email sent! Please check your inbox.');
      } else {
        toast.error(result.message || 'Failed to send verification email');
      }
    } catch (error) {
      toast.error('Failed to send verification email');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Seller Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to access your seller dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Status Messages */}
            {statusMessage && (
              <Alert
                className={`mb-4 ${
                  statusMessage.type === 'error'
                    ? 'border-destructive bg-destructive/10'
                    : statusMessage.type === 'warning'
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-blue-500 bg-blue-500/10'
                }`}
              >
                <Info className="h-4 w-4" />
                <AlertTitle>{statusMessage.title}</AlertTitle>
                <AlertDescription>
                  {statusMessage.message}
                  {statusMessage.type === 'warning' && statusMessage.title === 'Email Not Verified' && (
                    <>
                      <br />
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal text-primary"
                        onClick={handleResendVerification}
                      >
                        Resend verification email
                      </Button>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
              {/* Email Field */}
              <form.Field name="email">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={field.name}
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-10"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
              </form.Field>

              {/* Password Field */}
              <form.Field name="password">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={field.name}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </form.Field>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Google OAuth Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={async () => {
                  // Preserve return URL in OAuth callback
                  const returnUrl = search.return;
                  const callbackPath = returnUrl
                    ? `/seller/signin?oauth=true&return=${encodeURIComponent(returnUrl)}`
                    : '/seller/signin?oauth=true';

                  await authClient.signIn.social({
                    provider: 'google',
                    callbackURL: window.location.origin + callbackPath,
                  });
                }}
                disabled={isLoading}
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

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have a seller account? </span>
                <Link to="/seller/signup" className="text-primary hover:underline font-medium">
                  Sign up here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Link to="/seller" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Seller Home
          </Link>
        </div>
      </div>
    </div>
  );
}
