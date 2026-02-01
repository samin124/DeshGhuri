import { auth } from "@DeshGhuri/auth";
import { env } from "@DeshGhuri/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { apiReference } from "@scalar/hono-api-reference";
import sellerUploadRoutes from "./routes/seller-uploads";
import openAPIRoutes from "./routes/seller.openapi-handlers";

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
