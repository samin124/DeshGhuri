import { createServerFn } from '@tanstack/start';
import { authClient } from '@/lib/auth-client';

/**
 * Server function to check if the current user has admin role
 * This runs on the server and has access to session cookies
 */
export const checkIsAdmin = createServerFn('GET', async () => {
  const session = await authClient.getSession();

  if (!session.data) {
    return { isAdmin: false, error: 'No session' };
  }

  // Check admin role via API
  const response = await fetch(`${process.env.VITE_SERVER_URL}/api/admin/dashboard/stats`, {
    headers: {
      // Forward the session cookie from the current request
      Cookie: session.request?.headers.get('cookie') || '',
    },
  });

  return {
    isAdmin: response.ok,
    error: response.ok ? null : 'Unauthorized',
  };
});
