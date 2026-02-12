import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import z from 'zod';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || '',
      error: (search.error as string) || '',
    };
  },
});

function ResetPasswordComponent() {
  const navigate = useNavigate();
  const { token, error } = Route.useSearch();

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      if (value.password !== value.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      const { data, error: resetError } = await authClient.resetPassword({
        newPassword: value.password,
        token,
      });

      if (resetError) {
        toast.error('Failed to reset password. The link may have expired.');
        return;
      }

      toast.success('Password reset successfully! You can now sign in.');
      setTimeout(() => {
        navigate({ to: '/login' });
      }, 2000);
    },
    validators: {
      onSubmit: z.object({
        password: z
          .string()
          .min(8, 'Password must be at least 8 characters')
          .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
          .regex(/[a-z]/, 'Must contain at least one lowercase letter')
          .regex(/[0-9]/, 'Must contain at least one number')
          .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
        confirmPassword: z.string().min(8, 'Please confirm your password'),
      }),
    },
  });

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Reset Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">This password reset link is invalid or has expired.</p>
            <Button className="w-full" onClick={() => navigate({ to: '/forgot-password' })}>
              Request New Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
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
            <form.Field name="password">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>New Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error as string} className="text-red-500 text-sm">
                      {error as string}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Field name="confirmPassword">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Confirm Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error as string} className="text-red-500 text-sm">
                      {error as string}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!state.canSubmit || state.isSubmitting}
                >
                  {state.isSubmitting ? 'Resetting...' : 'Reset Password'}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
