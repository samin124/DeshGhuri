import { redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

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
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user roles:", error);
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
  const session = await authClient.getSession();

  // Unauthenticated users can access customer pages
  if (!session?.data) {
    return;
  }

  // Get user roles
  const userRoles = await getUserRoles();

  if (!userRoles) {
    // If we can't verify roles, allow access (fail open for public pages)
    return;
  }

  // Check if user is seller or admin (with priority)
  const { roles } = userRoles;

  // Super admin and admin should go to admin dashboard
  if (roles.includes("super_admin") || roles.includes("admin")) {
    throw redirect({ to: "/admin/dashboard" });
  }

  // Sellers should go to seller dashboard
  if (roles.includes("seller")) {
    throw redirect({ to: "/seller/dashboard" });
  }

  // Customers can access (or no role = allow)
  return;
}

/**
 * Guards seller-only routes
 * Requires authentication and seller role
 */
export async function requireSellerAccess(currentPath: string) {
  const session = await authClient.getSession();

  if (!session?.data) {
    throw redirect({
      to: "/login",
      search: { return: currentPath },
    });
  }

  const userRoles = await getUserRoles();

  if (!userRoles || !userRoles.roles.includes("seller")) {
    throw redirect({ to: "/" });
  }

  return userRoles;
}

/**
 * Guards admin-only routes
 * Requires authentication and admin role
 */
export async function requireAdminAccess(currentPath: string) {
  const session = await authClient.getSession();

  if (!session?.data) {
    throw redirect({
      to: "/admin",
      search: { return: currentPath },
    });
  }

  const userRoles = await getUserRoles();

  if (
    !userRoles ||
    (!userRoles.roles.includes("admin") && !userRoles.roles.includes("super_admin"))
  ) {
    throw redirect({ to: "/" });
  }

  return userRoles;
}
