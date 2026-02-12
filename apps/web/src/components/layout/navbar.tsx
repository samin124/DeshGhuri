import {
  Heart,
  Menu,
  ShoppingCart,
  X,
  Store,
  LayoutDashboard,
  LogOut,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { CITIES } from '@/lib/constants';
import UserMenu from '../user-menu';
import { ThemeToggle } from './theme-toggle';
import { SearchAutocomplete } from '@/components/search';
import { BookingsCart } from './bookings-cart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { useSellerSession } from '@/contexts/seller-session-context';
import { authClient } from '@/lib/auth-client';

function SellerMenu() {
  const { seller, logout } = useSellerSession();
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

  if (!seller) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 rounded-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
        >
          <Store className="h-4 w-4" />
          <span className="hidden md:inline max-w-[120px] truncate">{seller.businessName}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-semibold">{seller.businessName}</span>
              <span className="text-xs text-muted-foreground font-normal">{seller.email}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/seller/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Seller Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? 'Logging out...' : 'Sign Out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { seller } = useSellerSession();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl">
        {/* Main Navbar */}
        <div className="flex h-16 items-center justify-between px-4">
          {/* Left: Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <span className="text-xl">🌏</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground tracking-tight">DeshGhuri</span>
                <span className="text-[10px] text-muted-foreground font-medium -mt-0.5 hidden sm:block">
                  Travel Bangladesh
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <Button
                variant="ghost"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => {
                  navigate({ to: '/' });
                  setTimeout(() => {
                    document.getElementById('deals')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                Deals
              </Button>
              <Button
                variant="ghost"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => {
                  navigate({ to: '/' });
                  setTimeout(() => {
                    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                Categories
              </Button>
              <Button
                variant="ghost"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link to="/search">Explore</Link>
              </Button>
            </nav>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <SearchAutocomplete placeholder="Search destinations, tours, hotels..." />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* City Selector - Desktop */}
            <div className="hidden lg:block">
              <Select
                value={selectedCity}
                onValueChange={(value) => {
                  setSelectedCity(value);
                  if (value === 'All Cities') {
                    navigate({ to: '/search' });
                  } else {
                    navigate({ to: '/search', search: { location: value } });
                  }
                }}
              >
                <SelectTrigger className="h-9 w-[140px] rounded-full border-border bg-transparent hover:bg-muted text-sm">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Cities">All Cities</SelectItem>
                  {CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seller Menu */}
            {seller && (
              <div className="hidden md:block">
                <SellerMenu />
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
              <Heart className="h-[18px] w-[18px]" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                0
              </span>
            </Button>

            {/* Cart */}
            {isAuthenticated ? (
              <BookingsCart />
            ) : (
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                <ShoppingCart className="h-[18px] w-[18px]" />
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  0
                </span>
              </Button>
            )}

            {/* User Menu */}
            <UserMenu />

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <SearchAutocomplete placeholder="Search..." />
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="p-4 space-y-3">
              {/* City Selector */}
              <Select
                value={selectedCity}
                onValueChange={(value) => {
                  setSelectedCity(value);
                  setMobileMenuOpen(false);
                  if (value === 'All Cities') {
                    navigate({ to: '/search' });
                  } else {
                    navigate({ to: '/search', search: { location: value } });
                  }
                }}
              >
                <SelectTrigger className="w-full h-11 rounded-lg">
                  <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Cities">All Cities</SelectItem>
                  {CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Mobile Nav Links */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-11 justify-center rounded-lg"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate({ to: '/' });
                    setTimeout(() => {
                      document.getElementById('deals')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  Deals
                </Button>
                <Button
                  variant="outline"
                  className="h-11 justify-center rounded-lg"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate({ to: '/' });
                    setTimeout(() => {
                      document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  Categories
                </Button>
              </div>

              <Button variant="outline" className="w-full h-11 justify-center rounded-lg" asChild>
                <Link to="/search" onClick={() => setMobileMenuOpen(false)}>
                  Explore All Packages
                </Link>
              </Button>

              {/* Seller Menu Mobile */}
              {seller && (
                <div className="pt-2 border-t border-border">
                  <SellerMenu />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
