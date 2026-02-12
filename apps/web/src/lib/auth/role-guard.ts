import { redirect } from '@tanstack/react-router';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export interface UserRoles {
  roles: string[];
  primaryRole: string | null;
  userId: string;
  userEmail: string;
}

/**
 * Fetches user roles from the backend
 */
export async function getUserRoles(): Promise<UserRoles | null> {
  try {
    const response = await fetch(`${API_URL}/api/auth/roles`, {
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return null;
  }
}

/**
 * Guards user-only routes (homepage, search, booking, etc.)
 * Redirects sellers to seller dashboard
 * Redirects admins to admin dashboard
 * Allows unauthenticated users and customers
 */
export async function requireCustomerAccess(currentPath: string) {
  // Skip during SSR - redirects will happen on client side if needed
  if (typeof window === 'undefined') {
    return;
  }

  // Get user roles via API
  const userRoles = await getUserRoles();

  if (!userRoles) {
    // Unauthenticated users can access customer pages
    return;
  }

  // Check if user is seller or admin (with priority)
  const { roles } = userRoles;

  // Super admin and admin should go to admin dashboard
  if (roles.includes('super_admin') || roles.includes('admin')) {
    throw redirect({ to: '/admin/dashboard' });
  }

  // Sellers should go to seller dashboard
  if (roles.includes('seller')) {
    throw redirect({ to: '/seller/dashboard' });
  }

  // Customers can access (or no role = allow)
  return;
}

/**
 * Guards seller-only routes
 * Requires authentication and seller role
 * Checks both Better Auth session and seller-specific session
 */
export async function requireSellerAccess(currentPath: string) {
  // Skip during SSR - auth will be checked on client side
  if (typeof window === 'undefined') {
    return {
      roles: [],
      primaryRole: null,
      userId: '',
      userEmail: '',
    };
  }

  // First check seller-specific session via API (this includes cookies automatically)
  try {
    const sellerResponse = await fetch(`${API_URL}/api/seller/auth/me`, {
      credentials: 'include',
    });

    if (sellerResponse.ok) {
      const { data } = await sellerResponse.json();
      // Seller session exists, allow access
      return {
        roles: ['seller'],
        primaryRole: 'seller',
        userId: data.userId,
        userEmail: data.email,
      };
    }
  } catch (error) {
    console.error('Seller session check error:', error);
  }

  // Fallback: Check if user has seller role via roles API
  const userRoles = await getUserRoles();

  if (!userRoles) {
    // No session at all
    throw redirect({
      to: '/login',
      search: { return: currentPath },
    });
  }

  if (!userRoles.roles.includes('seller')) {
    // User is logged in but not a seller
    throw redirect({ to: '/' });
  }

  return userRoles;
}

/**
 * Guards admin-only routes
 * Requires authentication and admin role
 */
export async function requireAdminAccess(currentPath: string) {
  // Skip during SSR - auth will be checked on client side
  if (typeof window === 'undefined') {
    return {
      roles: [],
      primaryRole: null,
      userId: '',
      userEmail: '',
    };
  }

  // Check user roles via API (includes cookies automatically)
  const userRoles = await getUserRoles();

  if (!userRoles) {
    // No session at all
    throw redirect({
      to: '/login',
      search: { return: currentPath },
    });
  }

  if (!userRoles.roles.includes('admin') && !userRoles.roles.includes('super_admin')) {
    // User is logged in but not an admin
    throw redirect({ to: '/' });
  }

  return userRoles;
}
