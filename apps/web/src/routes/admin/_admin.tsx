import { createFileRoute, Outlet } from '@tanstack/react-router';
import { requireAdminAccess } from '@/lib/auth/role-guard';
import { AdminLayout } from '@/components/admin/admin-layout';
import { getUser } from '@/functions/get-user';

export const Route = createFileRoute('/admin/_admin')({
  beforeLoad: async ({ location }) => {
    // Check authentication and admin role
    await requireAdminAccess(location.pathname);

    // Get user session
    const session = await getUser();

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
