import { createFileRoute, Outlet } from '@tanstack/react-router';
import { requireAdminAccess } from '@/lib/auth/role-guard';
import { AdminLayout } from '@/components/admin/admin-layout';

export const Route = createFileRoute('/admin/_admin')({
  beforeLoad: async ({ location }) => {
    // Check authentication and admin role
    // This will redirect if not authenticated or not an admin
    const userRoles = await requireAdminAccess(location.pathname);

    return { userRoles };
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
