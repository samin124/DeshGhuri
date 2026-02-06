import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { getUser } from '@/functions/get-user';
// import { checkIsAdmin } from '@/functions/check-admin';
import { AdminLayout } from '@/components/admin/admin-layout';

export const Route = createFileRoute('/admin/_admin')({
  beforeLoad: async ({ location }) => {
    const session = await getUser();

    // If not logged in, redirect to admin login with return URL
    if (!session) {
      throw redirect({
        to: '/admin',
        search: {
          return: location.pathname, // Preserve the original destination
        },
      });
    }

    // Verify user has admin role
    try {
      const response = await fetch('http://localhost:3000/api/auth/roles', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw redirect({ to: '/admin' });
      }

      const { roles } = await response.json();

      // Check if user has admin or super_admin role
      if (!roles || (!roles.includes('admin') && !roles.includes('super_admin'))) {
        // Not an admin - redirect to home page
        throw redirect({
          to: '/',
          // Could add error message via search params or toast
        });
      }
    } catch (error) {
      // Error fetching roles, redirect to home
      throw redirect({ to: '/' });
    }

    return { session };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
