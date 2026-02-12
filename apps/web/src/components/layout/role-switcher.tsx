import { Shield, Store, User, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface RolesResponse {
  roles: string[];
  primaryRole: string | null;
  userId?: string;
  userEmail?: string;
}

interface RoleOption {
  role: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  destination: string;
  description: string;
}

const roleOptions: RoleOption[] = [
  {
    role: 'super_admin',
    label: 'Admin Panel',
    icon: Shield,
    destination: '/admin/dashboard',
    description: 'Manage users, sellers, and system settings',
  },
  {
    role: 'admin',
    label: 'Admin Panel',
    icon: Shield,
    destination: '/admin/dashboard',
    description: 'Manage users, sellers, and system settings',
  },
  {
    role: 'seller',
    label: 'Seller Dashboard',
    icon: Store,
    destination: '/seller/dashboard',
    description: 'Manage your products and sales',
  },
  {
    role: 'customer',
    label: 'Customer View',
    icon: User,
    destination: '/',
    description: 'Browse and shop experiences',
  },
];

export function RoleSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user roles
  const { data: rolesData, isLoading } = useQuery<RolesResponse>({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/auth/roles', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  // Don't render if loading or no roles
  if (isLoading || !rolesData || !rolesData.roles || rolesData.roles.length === 0) {
    return null;
  }

  const { roles } = rolesData;

  // Only show if user has multiple roles
  if (roles.length <= 1) {
    return null;
  }

  // Get available role options for this user
  const availableRoles = roleOptions.filter((option) => roles.includes(option.role));

  // Determine current role based on current path
  const getCurrentRole = (): RoleOption | undefined => {
    const path = location.pathname;

    if (path.startsWith('/admin')) {
      return availableRoles.find((r) => r.role === 'admin' || r.role === 'super_admin');
    }
    if (path.startsWith('/seller')) {
      return availableRoles.find((r) => r.role === 'seller');
    }

    // Default to customer or first available role
    return availableRoles.find((r) => r.role === 'customer') || availableRoles[0];
  };

  const currentRole = getCurrentRole();
  const CurrentIcon = currentRole?.icon || User;

  const handleRoleSwitch = (destination: string) => {
    navigate({ to: destination });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden md:inline">{currentRole?.label || 'Switch Role'}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-medium">Switch Context</span>
              <span className="text-xs text-muted-foreground font-normal">Choose your role</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {availableRoles.map((roleOption) => {
          const RoleIcon = roleOption.icon;
          const isCurrent = currentRole?.role === roleOption.role;

          return (
            <DropdownMenuItem
              key={roleOption.role}
              onClick={() => handleRoleSwitch(roleOption.destination)}
              className="cursor-pointer py-3"
              disabled={isCurrent}
            >
              <div className="flex items-start gap-3 w-full">
                <RoleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium text-sm">
                    {roleOption.label}
                    {isCurrent && (
                      <span className="ml-2 text-xs text-muted-foreground">(Current)</span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">{roleOption.description}</span>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
