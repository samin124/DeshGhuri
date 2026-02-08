import { Heart, Menu, Search, ShoppingCart, X, Store, LayoutDashboard, LogOut } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CITIES, LANGUAGES } from "@/lib/constants";
import UserMenu from "../user-menu";
import { ThemeToggle } from "./theme-toggle";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  // Get seller session (will be null if not logged in as seller)
  const { seller } = useSellerSession();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({
        to: "/search",
        search: { location: searchQuery },
      });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar - desktop only */}
      

      {/* Main navbar */}
      <div className="container mx-auto">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-primary"
          >
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              DeshGhuri
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden flex-1 mx-8 max-w-2xl md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search destinations, hotels, experiences..."
                className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e);
                  }
                }}
              />
            </div>
          </form>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* City Selector - Desktop */}
            <div className="hidden lg:block">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-9 w-32">
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
              <Button variant="ghost" asChild>
                <Link to="/categories">Categories</Link>
              </Button>
            </div>

            {/* Deals Link - Desktop */}
            <div className="hidden lg:block">
              <Button variant="ghost" asChild>
                <Link to="/deals">Deals</Link>
              </Button>
            </div>

            {/* Seller Menu or Become a Seller Link - Desktop */}
            <div className="hidden lg:block">
              {seller ? (
                <SellerMenu />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ to: "/login", search: { tab: "seller" } })}
                >
                  Become a Seller
                </Button>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
                    0
                  </span>
                </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
                0
              </span>
            </Button>

            {/* User Menu (existing component - no changes) */}
            <UserMenu />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
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
        <form onSubmit={handleSearch} className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-background p-4 lg:hidden">
            <div className="flex flex-col gap-4">
              {/* Customer-only features - Hidden for sellers */}
              {!seller && (
                <>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
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

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/categories">Categories</Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/deals">Deals</Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/group-bookings">Group Booking</Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/help">Help</Link>
                  </Button>
                </>
              )}

              {seller ? (
                <SellerMenu />
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate({ to: "/login", search: { tab: "seller" } })}
                >
                  Become a Seller
                </Button>
              )}

              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
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
