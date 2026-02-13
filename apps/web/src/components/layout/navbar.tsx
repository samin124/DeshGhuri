import {
  Menu,
  X,
  Store,
  LayoutDashboard,
  LogOut,
  MapPin,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CITIES } from '@/lib/constants';
import UserMenu from '../user-menu';
import { ThemeToggle } from './theme-toggle';
import { SearchAutocomplete } from '@/components/search';
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
import { WishlistMenu } from './wishlist-menu';
import { cn } from '@/lib/utils';

const CITY_MEGA_COLUMNS = [CITIES.slice(0, 4), CITIES.slice(4, 7), CITIES.slice(7)] as const;

function DeshGhuriLogo() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-md ring-1 ring-primary/15 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg">
      <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
        <defs>
          <linearGradient id="dgPinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="20" fill="#ecfeff" />
        <circle cx="24" cy="24" r="19" stroke="#67e8f9" strokeWidth="1.5" fill="none" />
        <path
          d="M24 8.8C17.8 8.8 12.8 13.8 12.8 20C12.8 26.2 20.5 35.4 24 39.2C27.5 35.4 35.2 26.2 35.2 20C35.2 13.8 30.2 8.8 24 8.8Z"
          fill="url(#dgPinGradient)"
        />
        <circle cx="24" cy="20" r="5.3" fill="#ffffff" />
        <path
          d="M18.8 29.6C20.8 27.9 23.1 27 25.8 27C28.2 27 30.3 27.7 32.2 29.1"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M34.2 12.3L35.5 14.9L38.4 15.3L36.3 17.4L36.8 20.3L34.2 18.9L31.6 20.3L32.1 17.4L30 15.3L32.9 14.9L34.2 12.3Z"
          fill="#f59e0b"
        />
      </svg>
    </div>
  );
}

interface CityMegaMenuProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

function CityMegaMenu({ selectedCity, onSelectCity }: CityMegaMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleCitySelect = (value: string) => {
    onSelectCity(value);
    setOpen(false);

    if (value === 'All Cities') {
      navigate({ to: '/search' });
      return;
    }

    navigate({ to: '/search', search: { location: value } });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-9 rounded-full border-border bg-transparent px-3.5 text-sm hover:bg-muted"
        >
          <MapPin className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
          <span className="max-w-[110px] truncate">
            {selectedCity === 'All Cities' ? 'All Cities' : selectedCity}
          </span>
          <ChevronDown className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(92vw,680px)] overflow-hidden rounded-2xl border border-border/60 p-0 shadow-xl"
      >
        <div className="grid bg-background md:grid-cols-[220px_1fr]">
          <div className="border-b border-border/60 bg-gradient-to-b from-primary/12 via-primary/6 to-background p-4 md:border-b-0 md:border-r md:p-5">
            <div className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Explore Bangladesh</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Select a city to discover offers, packages, and stays from verified sellers.
            </p>
            <button
              type="button"
              onClick={() => handleCitySelect('All Cities')}
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/15"
            >
              Browse all cities
            </button>
          </div>

          <div className="p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Popular destinations
              </p>
              <p className="text-[11px] text-muted-foreground">{CITIES.length} cities</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3">
              {CITY_MEGA_COLUMNS.map((column, columnIndex) => (
                <div key={columnIndex} className="space-y-1.5">
                  {column.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className={cn(
                        'w-full rounded-md px-2.5 py-2 text-left text-sm transition',
                        selectedCity === city
                          ? 'bg-primary/12 font-semibold text-primary'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
          <span className="hidden max-w-[120px] truncate md:inline">{seller.businessName}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-semibold">{seller.businessName}</span>
              <span className="text-xs font-normal text-muted-foreground">{seller.email}</span>
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

  const { seller } = useSellerSession();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
        {/* Main Navbar */}
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo & Brand */}
          <div className="flex items-center gap-4 xl:gap-8">
            <Link to="/" className="group flex items-center gap-3">
              <DeshGhuriLogo />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground">DeshGhuri</span>
                <span className="-mt-0.5 hidden text-[10px] font-medium text-muted-foreground sm:block">
                  Travel Bangladesh
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-1 lg:flex">
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
          <div className="mx-4 hidden max-w-md flex-1 xl:flex">
            <SearchAutocomplete placeholder="Search destinations, tours, hotels..." />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* City Selector - Desktop */}
            <div className="hidden lg:block">
              <CityMegaMenu selectedCity={selectedCity} onSelectCity={setSelectedCity} />
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
            <WishlistMenu />

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
        <div className="pb-3 md:hidden">
          <SearchAutocomplete placeholder="Search..." />
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background md:hidden">
            <div className="space-y-3 p-4">
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
                <SelectTrigger className="h-11 w-full rounded-lg">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
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

              <Button variant="outline" className="h-11 w-full justify-center rounded-lg" asChild>
                <Link to="/search" onClick={() => setMobileMenuOpen(false)}>
                  Explore All Packages
                </Link>
              </Button>

              {/* Seller Menu Mobile */}
              {seller && (
                <div className="border-t border-border pt-2">
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
