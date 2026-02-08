import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/seller/signup')({
  component: RouteComponent,
});

const searchSchema = z.object({
  category: z.enum(['agency', 'hotel', 'tour-operator']).optional(),
});

function RouteComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const category = (search as any).category;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      // Validate passwords match
      if (value.password !== value.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      // Validate password strength
      if (value.password.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }

      setIsLoading(true);

      try {
        // Check if email is already in use
        const checkResponse = await fetch('http://localhost:3000/api/auth/check-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: value.email }),
        });

        const checkData = await checkResponse.json();

        if (!checkData.available) {
          toast.error(checkData.message || 'This email is already registered. Each email can only be used for one account type. Please sign in or use a different email.');
          setIsLoading(false);
          return;
        }

        // Store credentials temporarily for onboarding
        sessionStorage.setItem('seller_signup_email', value.email);
        sessionStorage.setItem('seller_signup_password', value.password);

        if (category) {
          sessionStorage.setItem('seller_signup_category', category);
        }

        toast.success('Email and password saved. Please complete your business information.');

        // Redirect to onboarding
        navigate({
          to: '/seller/onboarding-new',
          search: category ? { category } : {},
        });
      } catch (error: any) {
        console.error('Signup error:', error);
        toast.error(error.message || 'Failed to proceed with signup');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Create Seller Account
            </CardTitle>
            <CardDescription className="text-center">
              Step 1 of 2: Set up your login credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This will be your login email and primary contact
                    </p>
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
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters long
                    </p>
                  </div>
                )}
              </form.Field>

              {/* Confirm Password Field */}
              <form.Field name="confirmPassword">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={field.name}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </form.Field>

              {/* Info Alert */}
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  After setting your credentials, you'll complete your business information and documents.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Continue to Business Information'}
              </Button>

              {/* Sign In Link */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have a seller account? </span>
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in here
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
