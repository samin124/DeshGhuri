import { auth } from "@DeshGhuri/auth";
import { env } from "@DeshGhuri/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import sellerRoutes from "./routes/seller";

const app = new Hono();
const port = 3000;

app.use(logger());
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

// Seller routes
app.route("/api/seller", sellerRoutes);

app.get("/", (c) => {
  return c.text("OK");
});

export default {
  port,
  fetch: app.fetch,
};
