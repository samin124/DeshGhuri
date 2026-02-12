import { db, userRole } from '@DeshGhuri/db';
import * as schema from '@DeshGhuri/db/schema/auth';
import { env } from '@DeshGhuri/env/server';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sendVerificationEmail, sendResetPasswordEmail } from './email';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);

function generateId(prefix: string): string {
  return `${prefix}_${nanoid()}`;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  trustedOrigins: ['http://localhost:3001', 'http://127.0.0.1:3001', env.CORS_ORIGIN],

  // Enhanced email & password configuration
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disabled for now due to email verification issues
    async onSignUp({ user }: { user: { id: string; email: string } }) {
      // Assign default 'customer' role to new users
      try {
        await db.insert(userRole).values({
          id: generateId('role'),
          userId: user.id,
          role: 'customer',
          createdAt: new Date(),
          createdBy: null,
        });
        console.log(`✅ Assigned 'customer' role to new user: ${user.email}`);
      } catch (error) {
        console.error('❌ Error assigning role to new user:', error);
        // Don't throw - allow signup to continue even if role assignment fails
      }
    },
    sendResetPassword: async ({ user, url, token }) => {
      console.log('\n=== PASSWORD RESET TRIGGERED ===');
      console.log('📧 User:', user.email);
      console.log('👤 Name:', user.name);
      console.log('🔗 URL:', url);
      console.log('🎟️ Token:', token);
      console.log('================================\n');

      try {
        // Use Better Auth's URL which handles callbacks properly
        await sendResetPasswordEmail({
          to: user.email,
          userName: user.name,
          resetUrl: url,
        });
        console.log('✅ Password reset email handler completed successfully');
      } catch (error) {
        console.error('❌ Error in password reset email handler:', error);
        throw error;
      }
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour in seconds
  },

  // Email verification configuration
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      console.log('\n=== EMAIL VERIFICATION TRIGGERED ===');
      console.log('📧 User:', user.email);
      console.log('👤 Name:', user.name);
      console.log('🔗 URL:', url);
      console.log('🎟️ Token:', token);
      console.log('===================================\n');

      try {
        // Use Better Auth's URL which handles callbacks properly
        await sendVerificationEmail({
          to: user.email,
          userName: user.name,
          verificationUrl: url,
        });
        console.log('✅ Verification email handler completed successfully');
      } catch (error) {
        console.error('❌ Error in verification email handler:', error);
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
            accessType: 'offline', // Get refresh tokens
            prompt: 'select_account consent', // Always show account picker
          },
        },
      }
    : {}),

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days (in seconds)
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },

  advanced: {
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days (in seconds)
    },
  },

  plugins: [],
});
