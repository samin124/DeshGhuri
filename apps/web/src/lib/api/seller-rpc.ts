import { sellerApi } from './rpc-client';

/**
 * RPC version of getSellerByUserId
 * Type-safe alternative to REST version in seller.ts
 *
 * @example
 * const result = await getSellerByUserIdRpc('user-123');
 * console.log(result.seller); // Fully typed!
 */
export async function getSellerByUserIdRpc(userId: string) {
  const response = await sellerApi['by-user'][':userId'].$get({
    param: { userId }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get seller');
  }

  return await response.json();
}

/**
 * RPC version of registerSeller
 */
export async function registerSellerRpc(userId: string) {
  const response = await sellerApi.register.$post({
    json: { userId }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to register seller');
  }

  return await response.json();
}

// NOTE: uploadDocument and updateDocument CANNOT use RPC
// because they use FormData. Keep using REST for file uploads.
