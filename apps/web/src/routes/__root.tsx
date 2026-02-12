import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/layout/theme-provider';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { DashboardFooter } from '@/components/layout/dashboard-footer';
import { initMocks } from '@/mocks';
import appCss from '../index.css?url';
import { SellerSessionProvider } from '@/contexts/seller-session-context';

export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'My App',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  // Create QueryClient instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  );

  // Initialize MSW in the browser only (client-side)
  useEffect(() => {
    initMocks();
  }, []);

  // Get current pathname to conditionally render navbar/footer
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Detect different page types
  const isAdminLoginPage =
    currentPath === '/admin' ||
    currentPath === '/admin/' ||
    currentPath === '/admin/reset-password';
  const isSellerAuthPage = currentPath === '/seller/signup' || currentPath === '/seller/register';
  const isAdminDashboard =
    currentPath.startsWith('/admin/') && currentPath !== '/admin' && currentPath !== '/admin/';
  const isSellerDashboard = currentPath.startsWith('/seller/dashboard');

  // Dashboard pages have their own layouts (navbar + footer managed internally)
  const isDashboardPage = isAdminDashboard || isSellerDashboard;

  // Show public navbar/footer only on public pages (not auth pages, not dashboards)
  const showNavAndFooter = !isAdminLoginPage && !isSellerAuthPage && !isDashboardPage;

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <SellerSessionProvider>
              {showNavAndFooter && <Navbar />}
              <div className={`min-h-svh flex flex-col ${showNavAndFooter ? 'pt-28 md:pt-16' : ''}`}>
                <Outlet />
                {showNavAndFooter && <Footer />}
              </div>
              <Toaster richColors />
              <TanStackRouterDevtools position="bottom-left" />
            </SellerSessionProvider>
          </ThemeProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
