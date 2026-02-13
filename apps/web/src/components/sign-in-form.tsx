import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import z from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { authClient } from '@/lib/auth-client';
import { getPostLoginRedirect, getReturnUrlFromSearch } from '@/lib/auth/redirect-after-login';

import Loader from './loader';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const navigate = useNavigate();
  const { isPending } = authClient.useSession();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: async () => {
            const session = await authClient.getSession();

            if (session.data?.user && !session.data.user.emailVerified) {
              await authClient.signOut();
              toast.error('Please verify your email before signing in.', {
                duration: 6000,
                action: {
                  label: 'Resend Email',
                  onClick: async () => {
                    const result = await authClient.sendVerificationEmail({
                      email: value.email,
                      callbackURL: window.location.origin + '/login',
                    });

                    if (result.error) {
                      toast.error('Failed to resend verification email');
                    } else {
                      toast.success('Verification email sent!');
                    }
                  },
                },
              });
              return;
            }

            const returnUrl = getReturnUrlFromSearch(window.location.search);
            const redirectTo = await getPostLoginRedirect({
              preferredDestination: returnUrl,
            });

            try {
              const response = await fetch('http://localhost:3000/api/auth/roles', {
                credentials: 'include',
              });
              const data = await response.json();
              const primaryRole = data.primaryRole;

              if (primaryRole === 'admin' || primaryRole === 'super_admin') {
                toast.success('Welcome back, Admin!');
              } else if (primaryRole === 'seller') {
                toast.success('Welcome back! Redirecting to dashboard...');
              } else {
                toast.success('Sign in successful!');
              }
            } catch (error) {
              toast.success('Sign in successful!');
            }

            navigate({ to: redirectTo });
          },
          onError: (error) => {
            if (
              error.error.status === 403 ||
              error.error.message?.includes('verify') ||
              error.error.message?.includes('verification')
            ) {
              toast.error('Please verify your email before signing in.', {
                duration: 6000,
                action: {
                  label: 'Resend Email',
                  onClick: async () => {
                    const result = await authClient.sendVerificationEmail({
                      email: value.email,
                      callbackURL: window.location.origin + '/login',
                    });

                    if (result.error) {
                      toast.error('Failed to resend verification email');
                    } else {
                      toast.success('Verification email sent!');
                    }
                  },
                },
              });
            } else if (error.error.message?.toLowerCase().includes('credential')) {
              toast.error('Invalid email or password');
            } else {
              toast.error(error.error.message || 'Failed to sign in');
            }
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-5"
      >
        {/* Email Field */}
        <form.Field name="email">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="you@example.com"
                  className="pl-11 h-12 rounded-xl bg-[#f8f7f4] border-border focus:bg-white transition-colors"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-sm text-destructive">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        {/* Password Field */}
        <form.Field name="password">
          {(field) => (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:text-primary/80 font-medium"
                  onClick={() => navigate({ to: '/forgot-password' })}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id={field.name}
                  name={field.name}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-11 pr-11 h-12 rounded-xl bg-[#f8f7f4] border-border focus:bg-white transition-colors"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-sm text-destructive">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        {/* Submit Button */}
        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          )}
        </form.Subscribe>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* Google OAuth Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 rounded-xl bg-[#f8f7f4] hover:bg-[#f0efec] border-border"
        onClick={async () => {
          const returnUrl = getReturnUrlFromSearch(window.location.search);
          const callbackPath = returnUrl
            ? `/login?return=${encodeURIComponent(returnUrl)}`
            : '/login';

          await authClient.signIn.social({
            provider: 'google',
            callbackURL: window.location.origin + callbackPath,
          });
        }}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      {/* Sign Up Link */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="text-primary hover:text-primary/80 font-semibold"
        >
          Sign up for free
        </button>
      </p>
    </div>
  );
}
