import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/seller/dashboard-layout';
import { requireSellerAccess } from '@/lib/auth/role-guard';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export const Route = createFileRoute('/seller/dashboard')({
  beforeLoad: async ({ location }) => {
    // Check authentication and seller role
    await requireSellerAccess(location.pathname);

    // Get seller information
    try {
      const sellerResponse = await fetch(`${API_URL}/api/seller/auth/me`, {
        credentials: 'include',
      });

      if (!sellerResponse.ok) {
        throw redirect({ to: '/login', search: { return: location.pathname } });
      }

      const { data } = await sellerResponse.json();

      // Return seller session data
      return { seller: data };
    } catch (error) {
      // Error or unauthorized, redirect to login
      throw redirect({
        to: '/login',
        search: {
          return: location.pathname,
        },
      });
    }
  },
  component: DashboardLayout,
});
