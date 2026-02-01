import { hc } from 'hono/client';
import type { AppType } from '../../../../server/src/index';
import { env } from '@DeshGhuri/env/web';

/**
 * Type-safe RPC client for DeshGhuri API
 * Uses Hono RPC for compile-time type safety
 */
export const rpcClient = hc<AppType>(env.VITE_SERVER_URL);

/**
 * Typed API routes
 */
export const sellerApi = rpcClient.api.seller;
