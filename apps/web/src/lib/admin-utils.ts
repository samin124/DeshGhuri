import { env } from '@DeshGhuri/env/web';

/**
 * Check if the current user has admin role
 * Makes a request to the admin API to verify access
 */
export async function checkAdminRole(): Promise<boolean> {
  try {
    const response = await fetch(`${env.VITE_SERVER_URL}/api/admin/dashboard/stats`, {
      credentials: 'include',
    });

    // If we can access the admin endpoint, user is an admin
    return response.ok;
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
}

/**
 * Get user roles from a server function
 * This should be called server-side
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    const response = await fetch(`${env.VITE_SERVER_URL}/api/admin/users/${userId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.user?.roles?.map((r: any) => r.role) || [];
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
}
