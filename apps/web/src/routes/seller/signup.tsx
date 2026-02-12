import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  CheckCircle,
  Store,
  Shield,
  TrendingUp,
  Users,
  ArrowRight,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/seller/signup')({
  component: RouteComponent,
});

const _searchSchema = z.object({
  category: z.enum(['agency', 'hotel', 'tour-operator']).optional(),
});

function RouteComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const category = (search as any).category;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      if (value.password !== value.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      if (value.password.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }

      setIsLoading(true);

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
          setIsLoading(false);
          return;
        }

        sessionStorage.setItem('seller_signup_email', value.email);
        sessionStorage.setItem('seller_signup_password', value.password);

        if (category) {
          sessionStorage.setItem('seller_signup_category', category);
        }

        toast.success("Credentials saved. Let's set up your business!");

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

  // Password strength
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

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

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          {/* Left Side - Benefits */}
          <div className="hidden lg:block space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Become a Seller</h1>
                  <p className="text-muted-foreground">Join DeshGhuri Marketplace</p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Why sell on DeshGhuri?</h2>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Grow Your Business</h3>
                  <p className="text-sm text-muted-foreground">
                    Reach thousands of travelers looking for experiences in Bangladesh
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Secure Payments</h3>
                  <p className="text-sm text-muted-foreground">
                    Get paid securely with our escrow-protected payment system
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Group Bookings</h3>
                  <p className="text-sm text-muted-foreground">
                    Attract more customers with group discounts and special offers
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Easy Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Powerful dashboard to manage listings, bookings, and earnings
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-white shadow-sm">
                <p className="text-2xl font-bold text-primary">500+</p>
                <p className="text-xs text-muted-foreground">Active Sellers</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white shadow-sm">
                <p className="text-2xl font-bold text-primary">10K+</p>
                <p className="text-xs text-muted-foreground">Monthly Bookings</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white shadow-sm">
                <p className="text-2xl font-bold text-primary">95%</p>
                <p className="text-xs text-muted-foreground">Satisfaction Rate</p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="bg-white rounded-2xl shadow-lg p-8">
              {/* Progress indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Step 1 of 2</span>
                  <span className="text-sm text-muted-foreground">Account Setup</span>
                </div>
                <div className="flex gap-2">
                  <div className="h-2 flex-1 rounded-full bg-primary"></div>
                  <div className="h-2 flex-1 rounded-full bg-muted"></div>
                </div>
              </div>

              {/* Mobile header */}
              <div className="lg:hidden text-center mb-6">
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Store className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Create Seller Account</h1>
                <p className="text-sm text-muted-foreground mt-1">Set up your login credentials</p>
              </div>

              {/* Desktop header */}
              <div className="hidden lg:block mb-6">
                <h2 className="text-xl font-bold text-foreground">Create Your Account</h2>
                <p className="text-sm text-muted-foreground">
                  Set up your login credentials to get started
                </p>
              </div>

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
                        Business Email <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={field.name}
                          type="email"
                          placeholder="business@example.com"
                          className="pl-11 h-12 rounded-xl bg-[#f8f7f4] border-border focus:bg-white transition-colors"
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
                      <Label htmlFor={field.name} className="text-sm font-medium">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={field.name}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          className="pl-11 pr-11 h-12 rounded-xl bg-[#f8f7f4] border-border focus:bg-white transition-colors"
                          value={field.state.value}
                          onChange={(e) => {
                            field.handleChange(e.target.value);
                            setPassword(e.target.value);
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* Password Strength */}
                      {password && (
                        <div className="flex gap-1">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-colors ${
                                i < passwordStrength
                                  ? strengthColors[passwordStrength - 1]
                                  : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                      )}

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
                      <Label htmlFor={field.name} className="text-sm font-medium">
                        Confirm Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={field.name}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          className={`pl-11 pr-11 h-12 rounded-xl bg-[#f8f7f4] border-border focus:bg-white transition-colors ${
                            confirmPassword &&
                            (passwordsMatch ? 'border-green-500' : 'border-red-500')
                          }`}
                          value={field.state.value}
                          onChange={(e) => {
                            field.handleChange(e.target.value);
                            setConfirmPassword(e.target.value);
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {confirmPassword && (
                        <p
                          className={`text-xs flex items-center gap-1 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}
                        >
                          <CheckCircle className="h-3 w-3" />
                          {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Info Box */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground">Next: Business Information</p>
                      <p className="text-muted-foreground">
                        You'll provide your business details and upload documents for verification.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Processing...'
                  ) : (
                    <>
                      Continue to Business Setup
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>

                {/* Sign In Link */}
                <p className="text-center text-sm text-muted-foreground">
                  Already have a seller account?{' '}
                  <Link to="/login" className="text-primary hover:text-primary/80 font-semibold">
                    Sign in here
                  </Link>
                </p>
              </form>
            </Card>

            {/* Back Link */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Verified</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Fast Approval</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
