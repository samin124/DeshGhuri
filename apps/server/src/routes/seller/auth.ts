import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sellerSignup, sellerSignin, getSellerByEmail } from '@DeshGhuri/auth/seller-auth';
import { auth } from '@DeshGhuri/auth';
import { setCookie, deleteCookie } from 'hono/cookie';
import { db, session, eq } from '@DeshGhuri/db';
import { customAlphabet } from 'nanoid';
import { requireSeller } from '../../middleware/seller-auth';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);

function generateId(prefix: string): string {
  return `${prefix}_${nanoid()}`;
}

function generateSessionToken(): string {
  return customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 32)();
}

const app = new Hono();

// Seller signup schema
const sellerSignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().min(2, 'Business name is required'),
  category: z.enum(['agency', 'hotel', 'tour-operator']),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  address: z.object({
    street: z.string(),
    city: z.string(),
    district: z.string(),
    postalCode: z.string().optional(),
  }),
  contactPhone: z.string().min(11, 'Valid phone number required'),
  contactEmail: z.string().email(),
  businessDescription: z.string().optional(),
  paymentMethods: z
    .array(
      z.object({
        type: z.enum(['bkash', 'nagad']),
        accountNumber: z.string().min(11, 'Valid account number required'),
        accountName: z.string().min(2, 'Account name required'),
      })
    )
    .min(1, 'At least one payment method is required'),
  bankAccount: z
    .object({
      bankName: z.string(),
      branchName: z.string(),
      accountHolderName: z.string(),
      accountNumber: z.string(),
      routingNumber: z.string().optional(),
      accountType: z.enum(['savings', 'current']),
    })
    .optional(),
});

// Seller signin schema
const sellerSigninSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/seller/auth/signup
 * Register a new seller account
 */
app.post('/signup', zValidator('json', sellerSignupSchema), async (c) => {
  try {
    const data = c.req.valid('json');

    const result = await sellerSignup(data);

    // If successful, also send verification email using Better Auth
    if (result.success && result.userId) {
      try {
        await auth.api.sendVerificationEmail({
          body: { email: data.email },
          headers: c.req.raw.headers,
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail the signup if email sending fails
      }
    }

    return c.json(
      {
        success: true,
        data: result,
        message: 'Seller account created successfully. Please check your email for verification.',
      },
      201
    );
  } catch (error: unknown) {
    console.error('Seller signup error:', error);
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create seller account',
      },
      400
    );
  }
});

/**
 * POST /api/seller/auth/signin
 * Sign in to seller account
 */
app.post('/signin', zValidator('json', sellerSigninSchema), async (c) => {
  try {
    const data = c.req.valid('json');

    const result = await sellerSignin(data);

    if (!result.success) {
      return c.json(
        {
          success: false,
          status: result.status,
          message: result.message,
          email: (result as any).email,
        },
        403
      );
    }

    // Create session manually with PLAIN token (Better Auth stores plain tokens)
    if (result.userId) {
      const sessionToken = generateSessionToken();
      const sessionId = generateId('session');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      console.log('🔐 Creating session:');
      console.log('  - Token:', sessionToken);
      console.log('  - User ID:', result.userId);

      await db.insert(session).values({
        id: sessionId,
        userId: result.userId,
        token: sessionToken, // Store PLAIN token
        expiresAt: expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || null,
        userAgent: c.req.header('user-agent') || null,
      });

      console.log('✅ Session created in database');

      // Set session cookie
      setCookie(c, 'better-auth.session_token', sessionToken, {
        httpOnly: true,
        secure: process.env === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      console.log('✅ Session cookie set');
    }

    return c.json({
      success: true,
      data: {
        sellerId: result.sellerId,
        businessName: result.businessName,
        email: result.email,
      },
      message: 'Signin successful',
    });
  } catch (error: unknown) {
    console.error('Seller signin error:', error);
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Invalid credentials',
      },
      401
    );
  }
});

/**
 * GET /api/seller/auth/status
 * Check seller account status by email
 */
app.get('/status/:email', async (c) => {
  try {
    const email = c.req.param('email');

    const seller = await getSellerByEmail(email);

    if (!seller) {
      return c.json(
        {
          success: false,
          message: 'No seller account found with this email',
        },
        404
      );
    }

    return c.json({
      success: true,
      data: {
        email: seller.email,
        businessName: seller.businessName,
        verificationStatus: seller.verificationStatus,
        createdAt: seller.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error('Status check error:', error);
    return c.json(
      {
        success: false,
        message: 'Failed to check status',
      },
      500
    );
  }
});

/**
 * POST /api/seller/auth/resend-verification
 * Resend verification email
 */
app.post(
  '/resend-verification',
  zValidator(
    'json',
    z.object({
      email: z.string().email(),
    })
  ),
  async (c) => {
    try {
      const { email } = c.req.valid('json');

      const seller = await getSellerByEmail(email);
      if (!seller) {
        return c.json(
          {
            success: false,
            message: 'No seller account found with this email',
          },
          404
        );
      }

      await auth.api.sendVerificationEmail({
        body: { email },
        headers: c.req.raw.headers,
      });

      return c.json({
        success: true,
        message: 'Verification email sent successfully',
      });
    } catch (error: unknown) {
      console.error('Resend verification error:', error);
      return c.json(
        {
          success: false,
          message: 'Failed to send verification email',
        },
        500
      );
    }
  }
);

/**
 * GET /api/seller/auth/me
 * Get current authenticated seller info
 */
app.get('/me', requireSeller, async (c) => {
  try {
    const sellerId = c.get('sellerId');
    const businessName = c.get('businessName');
    const email = c.get('sellerEmail');
    const userId = c.get('userId');

    return c.json({
      success: true,
      data: {
        sellerId,
        businessName,
        email,
        userId,
      },
    });
  } catch (error: unknown) {
    console.error('Get seller info error:', error);
    return c.json(
      {
        success: false,
        message: 'Failed to get seller information',
      },
      500
    );
  }
});

/**
 * POST /api/seller/auth/logout
 * Logout seller and clear session
 */
app.post('/logout', requireSeller, async (c) => {
  try {
    // Get session token from cookie
    const cookieHeader = c.req.header('cookie');
    const sessionToken = cookieHeader
      ?.split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('better-auth.session_token='))
      ?.split('=')[1];

    if (sessionToken) {
      // Delete session from database
      await db.delete(session).where(eq(session.token, sessionToken));
      console.log('✅ Session deleted from database');
    }

    // Clear session cookie
    deleteCookie(c, 'better-auth.session_token', {
      path: '/',
    });

    console.log('✅ Session cookie cleared');

    return c.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: unknown) {
    console.error('Logout error:', error);
    return c.json(
      {
        success: false,
        message: 'Failed to logout',
      },
      500
    );
  }
});

export default app;
