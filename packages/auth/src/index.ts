import { db } from "@DeshGhuri/db";
import * as schema from "@DeshGhuri/db/schema/auth";
import { env } from "@DeshGhuri/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sendVerificationEmail, sendResetPasswordEmail } from "./email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN],

  // Enhanced email & password configuration
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Require verification before sign-in
    sendResetPassword: async ({ user, url, token }) => {
      console.log("\n=== PASSWORD RESET TRIGGERED ===");
      console.log("📧 User:", user.email);
      console.log("👤 Name:", user.name);
      console.log("🔗 URL:", url);
      console.log("🎟️ Token:", token);
      console.log("================================\n");

      try {
        // Use Better Auth's URL which handles callbacks properly
        await sendResetPasswordEmail({
          to: user.email,
          userName: user.name,
          resetUrl: url,
        });
        console.log("✅ Password reset email handler completed successfully");
      } catch (error) {
        console.error("❌ Error in password reset email handler:", error);
        throw error;
      }
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour in seconds
  },

  // Email verification configuration
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      console.log("\n=== EMAIL VERIFICATION TRIGGERED ===");
      console.log("📧 User:", user.email);
      console.log("👤 Name:", user.name);
      console.log("🔗 URL:", url);
      console.log("🎟️ Token:", token);
      console.log("===================================\n");

      try {
        // Use Better Auth's URL which handles callbacks properly
        await sendVerificationEmail({
          to: user.email,
          userName: user.name,
          verificationUrl: url,
        });
        console.log("✅ Verification email handler completed successfully");
      } catch (error) {
        console.error("❌ Error in verification email handler:", error);
        throw error;
      }
    },
    verificationTokenExpiresIn: 86400, // 24 hours in seconds
  },

  // Google OAuth configuration (only enable if credentials are provided)
  ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            accessType: "offline", // Get refresh tokens
            prompt: "select_account consent", // Always show account picker
          },
        },
      }
    : {}),

  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },

  plugins: [],
});
