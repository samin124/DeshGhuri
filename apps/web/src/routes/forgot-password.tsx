import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordComponent,
});

function ForgotPasswordComponent() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      console.log("\n=== FORGOT PASSWORD FORM SUBMITTED ===");
      console.log("📧 Email:", value.email);
      console.log("🔗 Redirect To:", `${window.location.origin}/reset-password`);
      console.log("=======================================\n");

      try {
        // CORRECT METHOD NAME: requestPasswordReset (not forgetPassword!)
        const result = await authClient.requestPasswordReset({
          email: value.email,
          redirectTo: `${window.location.origin}/reset-password`,
        });

        console.log("\n=== FORGOT PASSWORD API RESPONSE ===");
        console.log("Data:", result.data);
        console.log("Error:", result.error);
        console.log("=====================================\n");

        if (result.error) {
          console.error("❌ Password reset error:", result.error);
          console.error("Error details:", JSON.stringify(result.error, null, 2));
        } else {
          console.log("✅ Password reset request successful");
        }
      } catch (err) {
        console.error("\n❌ EXCEPTION IN FORGOT PASSWORD");
        console.error("Exception:", err);
        console.error("=====================================\n");
      }

      // Always show success message to prevent email enumeration
      toast.success("If an account exists with this email, you'll receive a password reset link.", {
        duration: 5000,
      });

      setTimeout(() => {
        navigate({ to: "/login" });
      }, 3000);
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email("Invalid email address"),
      }),
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
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
            <form.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="your.email@example.com"
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
                  {state.isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
              )}
            </form.Subscribe>

            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => navigate({ to: "/login" })}
            >
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
