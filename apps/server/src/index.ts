import { auth } from "@DeshGhuri/auth";
import { env } from "@DeshGhuri/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { apiReference } from "@scalar/hono-api-reference";
import sellerUploadRoutes from "./routes/seller-uploads";
import openAPIRoutes from "./routes/seller.openapi-handlers";
import { requireAdmin } from "./middleware/admin-auth";
import adminDashboard from "./routes/admin/dashboard";
import adminUsers from "./routes/admin/users";
import adminSellers from "./routes/admin/sellers";
import adminDocuments from "./routes/admin/documents";
import adminAuditLogs from "./routes/admin/audit-logs";
import adminListings from "./routes/admin/listings";
import adminBookings from "./routes/admin/bookings";
import adminTransactions from "./routes/admin/transactions";

const app = new Hono();
const port = 3000;

app.use(logger());
app.use("*", secureHeaders());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Mount OpenAPI documented routes (JSON endpoints with full documentation)
// Includes: POST /register, GET /by-user/:userId, POST /onboarding/complete,
//           GET /verification-status/:sellerId, GET /test-cloudinary
app.route("/", openAPIRoutes);

// Mount file upload routes (FormData endpoints - not in OpenAPI spec)
// Includes: POST /documents/upload, PATCH /documents/:documentId
app.route("/api/seller", sellerUploadRoutes);

// Protect all admin routes with authentication middleware
app.use("/api/admin/*", requireAdmin);

// Mount admin routes
app.route("/api/admin/dashboard", adminDashboard);
app.route("/api/admin/users", adminUsers);
app.route("/api/admin/sellers", adminSellers);
app.route("/api/admin/documents", adminDocuments);
app.route("/api/admin/audit-logs", adminAuditLogs);
app.route("/api/admin/listings", adminListings);
app.route("/api/admin/bookings", adminBookings);
app.route("/api/admin/transactions", adminTransactions);

// Serve OpenAPI documentation UI
app.get(
  "/docs",
  apiReference({
    theme: "purple",
    spec: {
      url: "/openapi.json",
    },
  } as any)
);

app.get("/openapi", async (c) => {
  const res = await fetch("http://localhost:3000/openapi.json");
  const json = await res.json();
  return c.json(json);
});

app.get("/", (c) => {
  return c.text("OK");
});

export default {
  port,
  fetch: app.fetch,
};

// Export app type for RPC client (compile-time only, no runtime overhead)
export type AppType = typeof app;
