import { Heart, Menu, ShoppingCart, X, Store, LayoutDashboard, LogOut } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CITIES, LANGUAGES } from "@/lib/constants";
import UserMenu from "../user-menu";
import { ThemeToggle } from "./theme-toggle";
import { SearchAutocomplete } from "@/components/search";
import { BookingsCart } from "./bookings-cart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useSellerSession } from "@/contexts/seller-session-context";
import { authClient } from "@/lib/auth-client";

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
      <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 h-9 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
        <Store className="h-4 w-4" />
        <span className="hidden md:inline">{seller.businessName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-medium">{seller.businessName}</span>
              <span className="text-xs text-muted-foreground">{seller.email}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/seller/dashboard" className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Get seller session (will be null if not logged in as seller)
  const { seller } = useSellerSession();

  // Check if user is authenticated
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

    // Re-check auth periodically (every 30 seconds)
    const interval = setInterval(checkAuth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-gradient-to-r from-sky-50 via-white to-emerald-50 shadow-[0_14px_40px_-22px_rgba(15,23,42,0.45)] backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="h-1.5 w-full bg-gradient-to-r from-fuchsia-500 via-sky-500 to-emerald-500" />

      {/* Main navbar */}
      <div className="container mx-auto">
        <div className="flex items-center justify-between px-4 py-4 lg:py-5">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-3 text-2xl font-bold text-slate-900"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-sky-500 to-emerald-500 text-sm font-semibold text-white shadow-md">
              DG
            </span>
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 bg-clip-text text-transparent tracking-tight">
              DeshGhuri
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden flex-1 mx-8 max-w-2xl md:flex">
            <div className="flex w-full items-center rounded-full border border-slate-200 bg-white/90 px-2 py-1 shadow-[0_8px_20px_-14px_rgba(14,116,144,0.9)] transition-shadow focus-within:shadow-[0_10px_26px_-16px_rgba(16,185,129,0.8)]">
              <SearchAutocomplete />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* City Selector - Desktop */}
            <div className="hidden lg:block">
              <Select
                value={selectedCity}
                onValueChange={(value) => {
                  setSelectedCity(value);
                  if (value === "All Cities") {
                    navigate({ to: "/search" });
                  } else {
                    navigate({
                      to: "/search",
                      search: { location: value },
                    });
                  }
                }}
              >
                <SelectTrigger className="h-9 w-36 rounded-full border-slate-200 bg-white/90 shadow-sm hover:border-sky-300">
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

            {/* Categories Menu - Desktop */}
            <div className="hidden lg:block">
              <Button
                variant="ghost"
                className="rounded-full px-4 font-medium text-slate-700 transition-colors hover:bg-sky-100 hover:text-sky-700"
                onClick={() => {
                  navigate({ to: "/" });
                  // Small delay to ensure navigation completes before scrolling
                  setTimeout(() => {
                    document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              >
                Categories
              </Button>
            </div>

            {/* Deals Link - Desktop */}
            <div className="hidden lg:block">
              <Button
                variant="ghost"
                className="rounded-full px-4 font-medium text-slate-700 transition-colors hover:bg-emerald-100 hover:text-emerald-700"
                onClick={() => {
                  navigate({ to: "/" });
                  // Small delay to ensure navigation completes before scrolling
                  setTimeout(() => {
                    document.getElementById("deals")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              >
                Deals
              </Button>
            </div>

            {/* Seller Menu - Desktop */}
            {seller && (
              <div className="hidden lg:block">
                <SellerMenu />
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="relative rounded-full border border-slate-200 bg-white/90 shadow-sm transition-colors hover:bg-pink-100">
                  <Heart className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
                    0
                  </span>
                </Button>

            {/* Cart / Bookings */}
            {isAuthenticated ? (
              <BookingsCart />
            ) : (
              <Button variant="ghost" size="icon" className="relative rounded-full border border-slate-200 bg-white/90 shadow-sm transition-colors hover:bg-emerald-100">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
                  0
                </span>
              </Button>
            )}

            {/* User Menu (existing component - no changes) */}
            <UserMenu />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full border border-slate-200 bg-white/90 shadow-sm transition-colors hover:bg-sky-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-3 md:hidden">
          <div className="flex w-full items-center rounded-full border border-slate-200 bg-white/90 px-2 py-1 shadow-[0_8px_20px_-14px_rgba(14,116,144,0.9)]">
            <SearchAutocomplete placeholder="Search..." />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border/60 bg-white/95 p-4 shadow-inner lg:hidden">
            <div className="flex flex-col gap-4">
              {/* Customer-only features - Hidden for sellers */}
              {!seller && (
                <>
                  <Select
                    value={selectedCity}
                    onValueChange={(value) => {
                      setSelectedCity(value);
                      setMobileMenuOpen(false);
                      if (value === "All Cities") {
                        navigate({ to: "/search" });
                      } else {
                        navigate({
                          to: "/search",
                          search: { location: value },
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="rounded-full border-slate-200 bg-white/90 shadow-sm hover:border-sky-300">
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

                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-full border-slate-200 bg-white/90 text-slate-700 hover:bg-sky-100"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate({ to: "/" });
                      setTimeout(() => {
                        document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                  >
                    Categories
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-full border-slate-200 bg-white/90 text-slate-700 hover:bg-emerald-100"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate({ to: "/" });
                      setTimeout(() => {
                        document.getElementById("deals")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                  >
                    Deals
                  </Button>

                  <Button variant="outline" className="w-full justify-start rounded-full border-slate-200 bg-white/90 text-slate-700 hover:bg-fuchsia-100" asChild>
                    <Link to="/group-bookings">Group Booking</Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-start rounded-full border-slate-200 bg-white/90 text-slate-700 hover:bg-amber-100" asChild>
                    <Link to="/help">Help</Link>
                  </Button>
                </>
              )}

              {seller && <SellerMenu />}

              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="rounded-full border-slate-200 bg-white/90 shadow-sm hover:border-sky-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
