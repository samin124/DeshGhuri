import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || "",
      error: (search.error as string) || "",
    };
  },
});

function VerifyEmailComponent() {
  const navigate = useNavigate();
  const { token, error } = Route.useSearch();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (error) {
        const errorMessages: Record<string, string> = {
          invalid_token: "This verification link is invalid or has expired.",
          already_verified: "This email is already verified.",
        };

        setVerificationError(errorMessages[error] || "An error occurred during verification.");
        setIsVerifying(false);
        return;
      }

      if (!token) {
        setVerificationError("No verification token provided.");
        setIsVerifying(false);
        return;
      }

      try {
        // Call the verification API
        const result = await authClient.verifyEmail({
          query: { token },
        });

        if (result.error) {
          setVerificationError("Failed to verify email. The link may have expired.");
          setIsVerifying(false);
          return;
        }

        setIsVerifying(false);
        toast.success("Email verified successfully!");

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate({ to: "/login" });
        }, 2000);
      } catch (err) {
        setVerificationError("An error occurred during verification.");
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, error, navigate]);

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {verificationError ? "Verification Failed" : "Email Verified!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationError ? (
            <>
              <p className="text-red-500">{verificationError}</p>
              <Button
                className="w-full"
                onClick={() => navigate({ to: "/login" })}
              >
                Back to Login
              </Button>
            </>
          ) : (
            <>
              <p className="text-green-600">
                Your email has been verified successfully. Redirecting to login...
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
