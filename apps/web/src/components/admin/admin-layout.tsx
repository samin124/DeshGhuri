import { Link, useRouter, useMatches } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Home,
  Users,
  Store,
  FileText,
  ClipboardList,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Calendar,
  CreditCard,
  Percent,
  Layout,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DashboardFooter } from '@/components/layout/dashboard-footer';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { authClient } from '@/lib/auth-client';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: Home,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Sellers',
    icon: Store,
    children: [
      {
        name: 'All Sellers',
        href: '/admin/sellers',
      },
      {
        name: 'Verification Queue',
        href: '/admin/sellers/verification-queue',
      },
    ],
  },
  {
    name: 'Documents',
    href: '/admin/documents',
    icon: FileText,
  },
  {
    name: 'Listings',
    href: '/admin/listings',
    icon: Package,
  },
  {
    name: 'Bookings',
    href: '/admin/bookings',
    icon: Calendar,
  },
  {
    name: 'Transactions',
    href: '/admin/transactions',
    icon: CreditCard,
  },
  {
    name: 'Promotions',
    href: '/admin/promotions',
    icon: Percent,
  },
  {
    name: 'Content',
    href: '/admin/content',
    icon: Layout,
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: BarChart3,
  },
  {
    name: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: ClipboardList,
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Sellers']);
  const router = useRouter();
  const matches = useMatches();

  // Get current path for active state
  const currentPath = matches[matches.length - 1]?.pathname || '';

  // Get user from route context
  const routeContext = matches.find((m) => m.context && 'session' in m.context)?.context as
    | { session?: { user?: { id: string; name: string; email: string } } }
    | undefined;
  const session = routeContext?.session;
  const user = session?.user;

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.navigate({ to: '/login' });
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-subtle">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">DeshGhuri</h1>
                <Badge variant="secondary" className="text-xs">
                  Admin
                </Badge>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navigation.map((item) => {
              if (item.children) {
                const isExpanded = expandedItems.includes(item.name);
                const isActive = item.children.some((child) => currentPath.startsWith(child.href));

                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                              currentPath === child.href
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              const Icon = item.icon;
              const isActive = currentPath === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <Separator />

          {/* User section */}
          <div className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getUserInitials(user?.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/">View Public Site</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden md:flex">
              Admin Panel
            </Badge>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background-subtle">
          <div className="p-4 lg:p-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </div>
          <DashboardFooter />
        </main>
      </div>
    </div>
  );
}
