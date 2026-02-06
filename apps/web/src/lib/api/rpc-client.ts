import { hc } from 'hono/client';
import type { AppType } from '../../../../server/src/index';
import { env } from '@DeshGhuri/env/web';

/**
 * Type-safe RPC client for DeshGhuri API
 * Uses Hono RPC for compile-time type safety
 */
export const rpcClient = hc<AppType>(env.VITE_SERVER_URL, {
  fetch: (input, init) => {
    return fetch(input, {
      ...init,
      credentials: 'include', // Include cookies in requests
    });
  },
});

/**
 * Typed API routes
 */
export const sellerApi = rpcClient.api.seller;
