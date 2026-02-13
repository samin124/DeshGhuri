import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import z from 'zod';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useState } from 'react';

import { authClient } from '@/lib/auth-client';

import Loader from './loader';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const { isPending } = authClient.useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
    onSubmit: async ({ value }) => {
      try {
        const checkResponse = await fetch('http://localhost:3000/api/auth/check-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: value.email }),
        });

        const checkData = await checkResponse.json();

        if (!checkData.available) {
          toast.error(checkData.message || 'This email is already registered.');
          return;
        }
      } catch (error) {
        console.error('Error checking email availability:', error);
      }

      const { data, error } = await authClient.signUp.email({
        email: value.email,
        password: value.password,
        name: value.name,
        callbackURL: window.location.origin + '/login?tab=signin',
      });

      if (error) {
        if (error.message?.toLowerCase().includes('exist')) {
          toast.error('This email is already registered.');
        } else if (error.message?.toLowerCase().includes('password')) {
          toast.error("Password doesn't meet requirements.");
        } else {
          toast.error(error.message || 'Failed to create account.');
        }
        return;
      }

      // Safety net: even if backend config is stale/misconfigured, clear any session after signup.
      if (data?.token) {
        await authClient.signOut();
      }

      toast.success('Verification link sent. Check your inbox/spam and verify before signing in.', {
        duration: 8000,
        action: {
          label: 'Resend Email',
          onClick: async () => {
            const result = await authClient.sendVerificationEmail({
              email: value.email,
              callbackURL: window.location.origin + '/login?tab=signin',
            });

            if (result.error) {
              toast.error('Failed to resend verification email. Please try again.');
            } else {
              toast.success('Verification email sent again.');
            }
          },
        },
      });

      onSwitchToSignIn();
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.email('Invalid email address'),
        password: z
          .string()
          .min(8, 'Password must be at least 8 characters')
          .regex(/[A-Z]/, 'Must contain uppercase letter')
          .regex(/[a-z]/, 'Must contain lowercase letter')
          .regex(/[0-9]/, 'Must contain a number')
          .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
      }),
    },
  });

  // Password strength indicator
  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
  ];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

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
        {/* Name Field */}
        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="John Doe"
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
              <Label htmlFor={field.name} className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id={field.name}
                  name={field.name}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="pl-11 pr-11 h-12 rounded-xl bg-[#f8f7f4] border-border focus:bg-white transition-colors"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    setPassword(e.target.value);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs ${passwordStrength >= 4 ? 'text-green-600' : 'text-muted-foreground'}`}
                  >
                    Password strength: {strengthLabels[passwordStrength - 1] || 'Too weak'}
                  </p>
                </div>
              )}

              {/* Password Requirements */}
              <div className="grid grid-cols-2 gap-1 mt-2">
                <div
                  className={`flex items-center gap-1 text-xs ${password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}`}
                >
                  <CheckCircle
                    className={`h-3 w-3 ${password.length >= 8 ? 'text-green-600' : ''}`}
                  />
                  8+ characters
                </div>
                <div
                  className={`flex items-center gap-1 text-xs ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}
                >
                  <CheckCircle
                    className={`h-3 w-3 ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}
                  />
                  Uppercase
                </div>
                <div
                  className={`flex items-center gap-1 text-xs ${/[a-z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}
                >
                  <CheckCircle
                    className={`h-3 w-3 ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}
                  />
                  Lowercase
                </div>
                <div
                  className={`flex items-center gap-1 text-xs ${/[0-9]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}
                >
                  <CheckCircle
                    className={`h-3 w-3 ${/[0-9]/.test(password) ? 'text-green-600' : ''}`}
                  />
                  Number
                </div>
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
              {state.isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
          )}
        </form.Subscribe>

        {/* Terms */}
        <p className="text-xs text-center text-muted-foreground">
          By signing up, you agree to our{' '}
          <a href="/terms" className="text-primary hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
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
          await authClient.signIn.social({
            provider: 'google',
            callbackURL: window.location.origin,
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

      {/* Sign In Link */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="text-primary hover:text-primary/80 font-semibold"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
