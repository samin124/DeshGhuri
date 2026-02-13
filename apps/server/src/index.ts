import { auth } from '@DeshGhuri/auth';
import { db, user, eq } from '@DeshGhuri/db';
import { env } from '@DeshGhuri/env/server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { apiReference } from '@scalar/hono-api-reference';
import sellerUploadRoutes from './routes/seller-uploads';
import openAPIRoutes from './routes/seller.openapi-handlers';
import { requireAdmin } from './middleware/admin-auth';
import adminDashboard from './routes/admin/dashboard';
import adminUsers from './routes/admin/users';
import adminSellers from './routes/admin/sellers';
import adminDocuments from './routes/admin/documents';
import adminAuditLogs from './routes/admin/audit-logs';
import adminListings from './routes/admin/listings';
import adminBookings from './routes/admin/bookings';
import adminTransactions from './routes/admin/transactions';
import adminContent from './routes/admin/content';
import adminVerify from './routes/admin/verify';
import authRoles from './routes/auth/roles';
import authCheckEmail from './routes/auth/check-email';
import sellerDashboard from './routes/seller/dashboard';
import sellerAuth from './routes/seller/auth';
import sellerListings from './routes/seller/listings';
import sellerBookings from './routes/seller/bookings';
import customerBookings from './routes/customer/bookings';
import publicListings from './routes/listings';

const app = new Hono();
const port = 3000;

async function readAuthRequestBody(rawRequest: Request): Promise<{
  email?: string;
  callbackURL?: string;
}> {
  try {
    const contentType = rawRequest.headers.get('content-type')?.toLowerCase() || '';

    if (contentType.includes('application/json')) {
      const body = (await rawRequest.clone().json()) as Record<string, unknown>;
      return {
        email: typeof body.email === 'string' ? body.email.toLowerCase().trim() : undefined,
        callbackURL: typeof body.callbackURL === 'string' ? body.callbackURL : undefined,
      };
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(await rawRequest.clone().text());
      const email = params.get('email')?.toLowerCase().trim();
      const callbackURL = params.get('callbackURL') || undefined;
      return {
        email: email || undefined,
        callbackURL,
      };
    }
  } catch (error) {
    console.error('Failed to parse auth request body:', error);
  }

  return {};
}

app.use(logger());
app.use('*', secureHeaders());
app.use(
  '/*',
  cors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001', env.CORS_ORIGIN],
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Mount auth helper routes (must be BEFORE Better Auth wildcard handler)
app.route('/api/auth/roles', authRoles);
app.route('/api/auth/check-email', authCheckEmail);

// Extra backend guard: do not allow unverified users to sign in.
app.post('/api/auth/sign-in/email', async (c) => {
  try {
    const { email } = await readAuthRequestBody(c.req.raw);

    if (!email) {
      return auth.handler(c.req.raw);
    }

    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
      columns: {
        emailVerified: true,
      },
    });

    if (existingUser && !existingUser.emailVerified) {
      return c.json(
        {
          message: 'Please verify your email before signing in.',
        },
        403
      );
    }
  } catch (error) {
    console.error('Sign-in verification precheck failed:', error);
  }

  return auth.handler(c.req.raw);
});

// Extra backend guard: ensure signup does not create an active session and verification email is sent.
app.post('/api/auth/sign-up/email', async (c) => {
  const { email, callbackURL } = await readAuthRequestBody(c.req.raw);
  const authResponse = await auth.handler(c.req.raw);

  if (!authResponse.ok) {
    return authResponse;
  }

  let responsePayload: Record<string, unknown> | null = null;

  try {
    responsePayload = (await authResponse.clone().json()) as Record<string, unknown>;
  } catch {
    return authResponse;
  }

  const responseUser =
    responsePayload && typeof responsePayload.user === 'object'
      ? (responsePayload.user as Record<string, unknown>)
      : null;

  const signedUpEmail =
    typeof responseUser?.email === 'string'
      ? responseUser.email.toLowerCase().trim()
      : email?.toLowerCase().trim();
  const isEmailVerified = responseUser?.emailVerified === true;

  if (!signedUpEmail || isEmailVerified) {
    return authResponse;
  }

  try {
    await auth.api.sendVerificationEmail({
      body: {
        email: signedUpEmail,
        callbackURL,
      },
      headers: c.req.raw.headers,
    });
  } catch (error) {
    console.error('Fallback verification email send failed:', error);
  }

  const headers = new Headers(authResponse.headers);
  headers.delete('set-cookie');
  headers.append(
    'set-cookie',
    'better-auth.session_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax'
  );

  return new Response(
    JSON.stringify({
      ...responsePayload,
      token: null,
    }),
    {
      status: authResponse.status,
      headers,
    }
  );
});

// Better Auth handler (catches all other /api/auth/* routes)
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

// Mount seller authentication routes (independent from user auth)
app.route('/api/seller/auth', sellerAuth);

// Mount OpenAPI documented routes (JSON endpoints with full documentation)
// Includes: POST /register, GET /by-user/:userId, POST /onboarding/complete,
//           GET /verification-status/:sellerId, GET /test-cloudinary
app.route('/', openAPIRoutes);

// Mount file upload routes (FormData endpoints - not in OpenAPI spec)
// Includes: POST /documents/upload, PATCH /documents/:documentId
app.route('/api/seller', sellerUploadRoutes);

// Mount seller dashboard routes (protected with seller authentication)
app.route('/api/seller/dashboard', sellerDashboard);

// Mount seller listings routes (protected with seller authentication)
app.route('/api/seller/listings', sellerListings);

// Mount seller bookings routes (protected with seller authentication)
app.route('/api/seller/bookings', sellerBookings);

// Mount customer booking routes (protected - customers only)
app.route('/api/bookings', customerBookings);

// Mount public listing routes (browse, search, view listings)
app.route('/api/listings', publicListings);

// Mount admin verification route (must be BEFORE requireAdmin middleware)
app.route('/api/admin/verify', adminVerify);

// Protect all admin routes with authentication middleware
app.use('/api/admin/*', requireAdmin);

// Mount admin routes
app.route('/api/admin/dashboard', adminDashboard);
app.route('/api/admin/users', adminUsers);
app.route('/api/admin/sellers', adminSellers);
app.route('/api/admin/documents', adminDocuments);
app.route('/api/admin/audit-logs', adminAuditLogs);
app.route('/api/admin/listings', adminListings);
app.route('/api/admin/bookings', adminBookings);
app.route('/api/admin/transactions', adminTransactions);
app.route('/api/admin/content', adminContent);

// Serve OpenAPI documentation UI
app.get(
  '/docs',
  apiReference({
    theme: 'purple',
    spec: {
      url: '/openapi.json',
    },
  } as Record<string, unknown>)
);

app.get('/openapi', async (c) => {
  const res = await fetch('http://localhost:3000/openapi.json');
  const json = await res.json();
  return c.json(json);
});

app.get('/', (c) => {
  return c.text('OK');
});

export default {
  port,
  fetch: app.fetch,
};

// Export app type for RPC client (compile-time only, no runtime overhead)
export type AppType = typeof app;
