import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Shield, Lock, KeyRound } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/admin/reset-password')({
  component: AdminResetPasswordPage,
});

function AdminResetPasswordPage() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      if (value.newPassword !== value.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      try {
        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
          toast.error('Invalid or missing reset token');
          return;
        }

        // Reset password using Better Auth
        await authClient.resetPassword({
          newPassword: value.newPassword,
          token,
        });

        toast.success('Password reset successfully! Redirecting to login...');

        setTimeout(() => {
          navigate({ to: '/login' });
        }, 2000);
      } catch (error) {
        toast.error('Failed to reset password. The link may have expired.');
      }
    },
    validators: {
      onSubmit: z.object({
        newPassword: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
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
            <KeyRound className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Reset Password</h1>
          <p className="mt-2 text-gray-400">Enter your new admin password</p>
        </div>

        {/* Reset Password Card */}
        <div className="rounded-2xl border border-gray-700/50 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            {/* New Password Field */}
            <div>
              <form.Field name="newPassword">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-gray-200">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        placeholder="Enter new password"
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

            {/* Confirm Password Field */}
            <div>
              <form.Field name="confirmPassword">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-gray-200">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        placeholder="Confirm new password"
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
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Reset Password
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate({ to: '/login' })}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            ← Back to Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}
