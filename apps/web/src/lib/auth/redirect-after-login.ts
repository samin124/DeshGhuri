import { rpcClient } from '@/lib/api/rpc-client';

interface RedirectOptions {
  /**
   * Preferred destination from URL parameter (e.g., ?return=/admin/reports)
   * If provided and user has access, will redirect here
   */
  preferredDestination?: string;

  /**
   * Fallback destination if user has no roles or error occurs
   * Default: '/' (home page)
   */
  defaultDestination?: string;
}

/**
 * Determines where to redirect user after login based on their roles
 *
 * Priority Order:
 * 1. preferredDestination (if user has access)
 * 2. Primary role's default dashboard
 * 3. defaultDestination fallback
 *
 * Role Priority (for determining primary role):
 * super_admin > admin > seller > customer
 *
 * @example
 * ```typescript
 * // Simple usage
 * const redirect = await getPostLoginRedirect();
 * navigate({ to: redirect });
 *
 * // With return URL
 * const redirect = await getPostLoginRedirect({
 *   preferredDestination: searchParams.get('return'),
 * });
 *
 * // With custom fallback
 * const redirect = await getPostLoginRedirect({
 *   defaultDestination: '/welcome',
 * });
 * ```
 */
export async function getPostLoginRedirect(
  options: RedirectOptions = {}
): Promise<string> {
  const { preferredDestination, defaultDestination = '/' } = options;

  try {
    // Fetch user roles from backend
    const response = await rpcClient.api.auth.roles.$get();

    if (!response.ok) {
      console.warn('Failed to fetch roles, using default destination');
      return defaultDestination;
    }

    const data = await response.json();
    const { roles, primaryRole } = data;

    // If user requested specific destination, check if they have access
    if (preferredDestination) {
      const hasAccess = checkRouteAccess(preferredDestination, roles);
      if (hasAccess) {
        console.log('✅ Redirecting to preferred destination:', preferredDestination);
        return preferredDestination;
      } else {
        console.warn('⚠️ User lacks access to preferred destination:', preferredDestination);
      }
    }

    // Otherwise, redirect based on primary role
    const destination = getRoleDefaultDestination(primaryRole || 'customer');
    console.log('✅ Redirecting based on primary role:', primaryRole, '→', destination);
    return destination;

  } catch (error) {
    console.error('Error determining post-login redirect:', error);
    return defaultDestination;
  }
}

/**
 * Gets the default dashboard/landing page for a given role
 */
function getRoleDefaultDestination(role: string): string {
  switch (role) {
    case 'super_admin':
    case 'admin':
      return '/admin/dashboard';

    case 'seller':
      return '/seller/dashboard';

    case 'customer':
    default:
      return '/'; // Customer homepage
  }
}

/**
 * Checks if user has access to a specific route based on their roles
 *
 * Route Access Rules:
 * - /admin/* requires admin or super_admin role
 * - /seller/* requires seller role
 * - All other routes are public
 */
function checkRouteAccess(path: string, roles: string[]): boolean {
  // Admin routes require admin or super_admin role
  if (path.startsWith('/admin')) {
    return roles.some(r => r === 'admin' || r === 'super_admin');
  }

  // Seller routes require seller role
  if (path.startsWith('/seller')) {
    return roles.includes('seller');
  }

  // All other routes are accessible (public pages, customer pages)
  return true;
}

/**
 * Helper to extract return URL from search params
 * Safely handles missing or invalid URLs
 *
 * @example
 * ```typescript
 * const returnUrl = getReturnUrlFromSearch(location.search);
 * const redirect = await getPostLoginRedirect({
 *   preferredDestination: returnUrl,
 * });
 * ```
 */
export function getReturnUrlFromSearch(search: string | URLSearchParams): string | undefined {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search;
  const returnUrl = params.get('return');

  // Validate that return URL is a relative path (security check)
  if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
    return returnUrl;
  }

  return undefined;
}
