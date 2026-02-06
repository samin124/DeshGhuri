import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db, eq, seller, session as sessionTable, userRole } from '@DeshGhuri/db';
import { auth } from '@DeshGhuri/auth';

/**
 * Middleware to require seller authentication
 * Checks if the user is authenticated and has an approved seller account
 * Works with both user-based and independent seller authentication
 */
export async function requireSeller(c: Context, next: () => Promise<void>) {
  // Try Better Auth session first
  let session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  // If Better Auth session not found, try manual session lookup
  if (!session) {
    const cookieHeader = c.req.header('cookie');
    console.log('🔍 Better Auth session not found, trying manual lookup');
    console.log('🍪 Cookies:', cookieHeader);

    // Extract session token from cookie
    const sessionToken = cookieHeader?.split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('better-auth.session_token='))
      ?.split('=')[1];

    if (sessionToken) {
      console.log('🔑 Found session token:', sessionToken.substring(0, 20) + '...');

      // Manually lookup session in database
      const dbSession = await db.query.session.findFirst({
        where: eq(sessionTable.token, sessionToken),
        with: {
          user: true,
        },
      });

      if (dbSession && dbSession.expiresAt > new Date()) {
        console.log('✅ Manual session found for user:', dbSession.user.email);
        // Create a session-like object for compatibility
        session = {
          session: dbSession,
          user: dbSession.user,
        } as any;
      } else {
        console.log('❌ No valid manual session found');
      }
    }
  }

  if (!session) {
    throw new HTTPException(401, {
      message: 'Unauthorized: No valid session found',
    });
  }

  // Get user roles to verify this is a seller account
  const userRoles = await db.query.userRole.findMany({
    where: eq(userRole.userId, session.user.id),
  });

  const roles = userRoles.map((r) => r.role);
  const isSeller = roles.includes('seller');

  // Only allow access if user has seller role
  if (!isSeller) {
    throw new HTTPException(403, {
      message: 'Forbidden: This account is not registered as a seller. Please apply to become a seller.',
    });
  }

  // Find seller account by userId (for seller accounts only)
  const sellerAccount = await db.query.seller.findFirst({
    where: eq(seller.userId, session.user.id),
  });

  if (!sellerAccount) {
    throw new HTTPException(403, {
      message: 'Forbidden: Seller profile not found. Please contact support.',
    });
  }

  // Check if seller is approved
  if (sellerAccount.verificationStatus !== 'approved') {
    throw new HTTPException(403, {
      message: `Forbidden: Seller account not approved. Current status: ${sellerAccount.verificationStatus}`,
    });
  }

  // Check if email is verified
  if (!session.user.emailVerified) {
    throw new HTTPException(403, {
      message: 'Forbidden: Please verify your email address before accessing the seller dashboard',
    });
  }

  // Store user and seller info in context for use in route handlers
  c.set('userId', session.user.id);
  c.set('userEmail', session.user.email);
  c.set('sellerId', sellerAccount.id);
  c.set('sellerEmail', sellerAccount.email);
  c.set('sellerVerified', sellerAccount.verificationStatus === 'approved');
  c.set('businessName', sellerAccount.businessName);

  await next();
}

/**
 * Middleware to require seller authentication (any status)
 * Checks if the user is authenticated and has a seller account (regardless of verification status)
 * Only allows access if user has seller role
 */
export async function requireSellerAccount(c: Context, next: () => Promise<void>) {
  // Get session using Better Auth
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw new HTTPException(401, {
      message: 'Unauthorized: No valid session found',
    });
  }

  // Get user roles to verify this is a seller account
  const userRoles = await db.query.userRole.findMany({
    where: eq(userRole.userId, session.user.id),
  });

  const roles = userRoles.map((r) => r.role);
  const isSeller = roles.includes('seller');

  // Only allow access if user has seller role
  if (!isSeller) {
    throw new HTTPException(403, {
      message: 'Forbidden: This account is not registered as a seller. Please apply to become a seller.',
    });
  }

  // Find seller account by userId
  const sellerAccount = await db.query.seller.findFirst({
    where: eq(seller.userId, session.user.id),
  });

  if (!sellerAccount) {
    throw new HTTPException(403, {
      message: 'Forbidden: Seller profile not found. Please contact support.',
    });
  }

  // Store user and seller info in context for use in route handlers
  c.set('userId', session.user.id);
  c.set('userEmail', session.user.email);
  c.set('sellerId', sellerAccount.id);
  c.set('sellerEmail', sellerAccount.email);
  c.set('sellerStatus', sellerAccount.verificationStatus);
  c.set('businessName', sellerAccount.businessName);

  await next();
}
