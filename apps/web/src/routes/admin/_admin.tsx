import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { getUser } from '@/functions/get-user';
import { AdminLayout } from '@/components/admin/admin-layout';

export const Route = createFileRoute('/admin/_admin')({
  beforeLoad: async () => {
    const session = await getUser();

    if (!session) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/admin/dashboard',
        },
      });
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
