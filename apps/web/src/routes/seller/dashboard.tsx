import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/seller/dashboard-layout';
import { requireSellerAccess } from '@/lib/auth/role-guard';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export const Route = createFileRoute('/seller/dashboard')({
  beforeLoad: async ({ location }) => {
    // Check authentication and seller role
    // This will redirect to login if not authenticated
    await requireSellerAccess(location.pathname);
  },
  component: DashboardLayout,
});
