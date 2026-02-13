import { Link, Outlet, useLocation } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  ListChecks,
  Package,
  Menu,
  LogOut,
  MessageSquare,
  Wallet,
  BarChart3,
  Building2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSellerSession } from '@/contexts/seller-session-context';
import { DashboardFooter } from '@/components/layout/dashboard-footer';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    label: 'Workspace',
    items: [
      {
        name: 'Overview',
        href: '/seller/dashboard',
        icon: LayoutDashboard,
        description: 'Snapshot of your business',
      },
      {
        name: 'Listings',
        href: '/seller/dashboard/listings',
        icon: Package,
        description: 'Manage your packages',
      },
      {
        name: 'Bookings',
        href: '/seller/dashboard/bookings',
        icon: ListChecks,
        description: 'Review customer bookings',
      },
    ],
  },
  {
    label: 'Performance',
    items: [
      {
        name: 'Analytics',
        href: '/seller/dashboard/analytics',
        icon: BarChart3,
        description: 'Track growth and trends',
      },
      {
        name: 'Earnings',
        href: '/seller/dashboard/earnings',
        icon: Wallet,
        description: 'Revenue and escrow status',
      },
      {
        name: 'Reviews',
        href: '/seller/dashboard/reviews',
        icon: MessageSquare,
        description: 'Customer feedback and replies',
      },
    ],
  },
];

function getPageMeta(pathname: string) {
  if (pathname.startsWith('/seller/dashboard/listings')) {
    return {
      title: 'Listings',
      description: 'Control availability, pricing, and listing quality from one place.',
    };
  }

  if (pathname.startsWith('/seller/dashboard/bookings')) {
    return {
      title: 'Bookings',
      description: 'Handle incoming reservations and booking approval decisions quickly.',
    };
  }

  if (pathname.startsWith('/seller/dashboard/analytics')) {
    return {
      title: 'Analytics',
      description: 'Monitor traffic, conversions, and revenue trends over time.',
    };
  }

  if (pathname.startsWith('/seller/dashboard/earnings')) {
    return {
      title: 'Earnings',
      description: 'Track pending, released, and withdrawn balances clearly.',
    };
  }

  if (pathname.startsWith('/seller/dashboard/reviews')) {
    return {
      title: 'Reviews',
      description: 'Read customer feedback and respond to maintain trust.',
    };
  }

  return {
    title: 'Overview',
    description: 'A complete snapshot of bookings, listings, reviews, and business health.',
  };
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { seller } = useSellerSession();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-5 py-4">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">DeshGhuri</p>
            <p className="text-xs text-muted-foreground">Seller Workspace</p>
          </div>
        </Link>
      </div>

      <div className="px-4 py-4">
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="truncate text-sm font-semibold">
            {seller?.businessName || 'Seller Account'}
          </p>
          <p className="truncate text-xs text-muted-foreground">{seller?.email || 'Signed in'}</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-5 pb-4">
          {navigationSections.map((section) => (
            <div key={section.label} className="space-y-1.5">
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.label}
              </p>
              {section.items.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/seller/dashboard' && location.pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'group flex items-start gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors',
                      isActive
                        ? 'border-primary/20 bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    <item.icon
                      className={cn('mt-0.5 h-4 w-4 shrink-0', isActive ? 'text-primary' : '')}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="truncate text-xs opacity-80">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <Link to="/" onClick={onNavigate} className="block">
          <Button variant="outline" className="w-full">
            Back to Website
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { seller, logout } = useSellerSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();

  const pageMeta = useMemo(() => getPageMeta(location.pathname), [location.pathname]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/60">
      <aside className="hidden w-72 border-r bg-background lg:block">
        <SidebarContent />
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div>
                <p className="text-xs text-muted-foreground">Seller Dashboard</p>
                <h1 className="text-base font-semibold leading-none">{pageMeta.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden md:inline-flex">
                {seller?.businessName || 'Seller'}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>

          <Separator />
          <div className="px-4 py-2 text-xs text-muted-foreground lg:px-6">
            {pageMeta.description}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
            <Outlet />
          </div>
          <DashboardFooter />
        </main>
      </div>
    </div>
  );
}
