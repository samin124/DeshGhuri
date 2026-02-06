import { Link, Outlet, useLocation } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ListChecks,
  Package,
  Calendar,
  Mail,
  Star,
  DollarSign,
  CreditCard,
  FileCheck,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { RoleSwitcher } from '@/components/layout/role-switcher';
import { DashboardFooter } from '@/components/layout/dashboard-footer';
import { Badge } from '@/components/ui/badge';
import { useSellerSession } from '@/contexts/seller-session-context';

const navigation = [
  {
    name: 'Overview',
    href: '/seller/dashboard',
    icon: LayoutDashboard,
    description: 'Dashboard overview and stats',
  },
  {
    name: 'Listings',
    href: '/seller/dashboard/listings',
    icon: Package,
    description: 'Manage your listings',
  },
  {
    name: 'Bookings',
    href: '/seller/dashboard/bookings',
    icon: ListChecks,
    description: 'View and manage bookings',
  },
  {
    name: 'Calendar',
    href: '/seller/dashboard/calendar',
    icon: Calendar,
    description: 'Availability management',
  },
  {
    name: 'Reviews',
    href: '/seller/dashboard/reviews',
    icon: Star,
    description: 'Customer reviews',
  },
  {
    name: 'Earnings',
    href: '/seller/dashboard/earnings',
    icon: DollarSign,
    description: 'Revenue and earnings',
  },
  {
    name: 'Payouts',
    href: '/seller/dashboard/payouts',
    icon: CreditCard,
    description: 'Payout history',
  },
  {
    name: 'Proof Center',
    href: '/seller/dashboard/proof-center',
    icon: FileCheck,
    description: 'Service proof submission',
  },
  {
    name: 'Analytics',
    href: '/seller/dashboard/analytics',
    icon: BarChart3,
    description: 'Performance insights',
  },
  {
    name: 'Inbox',
    href: '/seller/dashboard/inbox',
    icon: Mail,
    description: 'Messages and inquiries',
  },
  {
    name: 'Settings',
    href: '/seller/dashboard/settings',
    icon: Settings,
    description: 'Account settings',
  },
];

function SidebarContent() {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b px-6 py-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">DeshGhuri</span>
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">Seller Dashboard</p>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/seller/dashboard' && location.pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <div className="flex-1 truncate">
                  <div>{item.name}</div>
                  {!isActive && (
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4 space-y-2">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to="/">
            Back to Website
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useSellerSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar for desktop */}
      <aside className="hidden w-64 border-r bg-card lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Desktop header */}
        <header className="hidden lg:flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden md:flex">
              Seller Dashboard
            </Badge>
            <RoleSwitcher />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </header>

        {/* Mobile header */}
        <header className="border-b bg-card px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-primary">
              DeshGhuri
            </Link>
            <div className="flex items-center gap-2">
              <RoleSwitcher />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="min-h-full">
            <Outlet />
          </div>
          <DashboardFooter />
        </main>
      </div>
    </div>
  );
}
