import { auth } from '@DeshGhuri/auth';
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
