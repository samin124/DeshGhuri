import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/seller/dashboard-layout';
import { getUser } from '@/functions/get-user';

export const Route = createFileRoute('/seller/dashboard')({
  beforeLoad: async () => {
    const session = await getUser();

    // Check if user is logged in
    if (!session) {
      throw redirect({
        to: '/seller/signin',
        search: {
          return: '/seller/dashboard',
        },
      });
    }

    // Check if user has seller role
    // For now, we'll fetch roles from the API
    const response = await fetch('http://localhost:3000/api/auth/roles', {
      credentials: 'include',
    });

    if (!response.ok) {
      throw redirect({ to: '/seller/signin' });
    }

    const { roles } = await response.json();

    // If user doesn't have seller role, redirect to home with error
    if (!roles || !roles.includes('seller')) {
      throw redirect({
        to: '/',
        // You could add a toast/error message here via search params
      });
    }

    return { session };
  },
  component: DashboardLayout,
});
