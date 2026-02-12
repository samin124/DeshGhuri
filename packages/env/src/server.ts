import 'dotenv/config';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Email configuration (Gmail SMTP)
    EMAIL_HOST: z.string().default('smtp.gmail.com'),
    EMAIL_PORT: z.coerce.number().default(587),
    EMAIL_USER: z.string().email(),
    EMAIL_PASSWORD: z.string().min(1),
    EMAIL_FROM: z.string().email(),

    // Google OAuth configuration (optional for now)
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    // Supabase Storage (S3-compatible)
    SUPABASE_PROJECT_REF: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SUPABASE_STORAGE_BUCKET: z.string().default('seller-documents'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
