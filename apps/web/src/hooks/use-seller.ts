import { useQuery } from '@tanstack/react-query';
import { getSellerByUserIdRpc } from '@/lib/api/seller-rpc';

/**
 * Hook to fetch seller data by user ID using RPC
 *
 * @example
 * const { data, isLoading, error } = useSellerByUserId(userId);
 * const seller = data?.seller;
 */
export function useSellerByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: ['seller', 'by-user', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return getSellerByUserIdRpc(userId);
    },
    enabled: !!userId,
  });
}
