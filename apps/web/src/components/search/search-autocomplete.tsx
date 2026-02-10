import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, MapPin, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { CATEGORY_DISPLAY_NAMES } from "@/lib/constants/categories";

const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface ListingSuggestion {
  id: string;
  title: string;
  category: string;
  basePrice: string;
  images: string[];
  location: {
    city: string;
    district: string;
  };
}

interface LocationSuggestion {
  city: string;
  district: string;
}

interface SuggestionsResponse {
  success: boolean;
  data: {
    listings: ListingSuggestion[];
    locations: LocationSuggestion[];
  };
}

async function fetchSuggestions(query: string): Promise<SuggestionsResponse> {
  const res = await fetch(`${API_URL}/api/listings/suggestions?q=${encodeURIComponent(query)}`);

  if (!res.ok) {
    throw new Error("Failed to fetch suggestions");
  }

  return res.json();
}

interface SearchAutocompleteProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export default function SearchAutocomplete({
  placeholder = "Search destinations, hotels, experiences...",
  onSearch,
  className,
}: SearchAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch suggestions
  const { data, isLoading } = useQuery({
    queryKey: ["search-suggestions", debouncedQuery],
    queryFn: () => fetchSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const suggestions = data?.data;
  const totalSuggestions = (suggestions?.listings.length || 0) + (suggestions?.locations.length || 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show dropdown when there are suggestions
  useEffect(() => {
    if (debouncedQuery.length >= 2 && totalSuggestions > 0) {
      setIsOpen(true);
    }
  }, [debouncedQuery, totalSuggestions]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setIsOpen(false);
      setSearchQuery("");

      if (onSearch) {
        onSearch(query);
      } else {
        navigate({
          to: "/search",
          search: { location: query },
        });
      }
    }
  };

  const handleListingClick = (listing: ListingSuggestion) => {
    setIsOpen(false);
    setSearchQuery("");
    navigate({ to: `/listing/${listing.id}` });
  };

  const handleLocationClick = (location: LocationSuggestion) => {
    setIsOpen(false);
    setSearchQuery("");
    navigate({
      to: "/search",
      search: { location: location.city },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || totalSuggestions === 0) {
      if (e.key === "Enter") {
        handleSearch(searchQuery);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalSuggestions - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex === -1) {
          handleSearch(searchQuery);
        } else if (selectedIndex < (suggestions?.listings.length || 0)) {
          const listing = suggestions?.listings[selectedIndex];
          if (listing) handleListingClick(listing);
        } else {
          const locationIndex = selectedIndex - (suggestions?.listings.length || 0);
          const location = suggestions?.locations[locationIndex];
          if (location) handleLocationClick(location);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (debouncedQuery.length >= 2 && totalSuggestions > 0) {
              setIsOpen(true);
            }
          }}
        />
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && searchQuery.length >= 2 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border bg-background shadow-lg">
          {isLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}

          {!isLoading && totalSuggestions === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for "{searchQuery}"
            </div>
          )}

          {!isLoading && totalSuggestions > 0 && (
            <div className="max-h-96 overflow-y-auto">
              {/* Location Suggestions */}
              {suggestions?.locations && suggestions.locations.length > 0 && (
                <div className="border-b">
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground">
                    LOCATIONS
                  </div>
                  {suggestions.locations.map((location, index) => {
                    const globalIndex = (suggestions?.listings.length || 0) + index;
                    return (
                      <button
                        key={`${location.city}-${location.district}`}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted",
                          selectedIndex === globalIndex && "bg-muted"
                        )}
                        onClick={() => handleLocationClick(location)}
                      >
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{location.city}</div>
                          {location.district && (
                            <div className="text-xs text-muted-foreground">
                              {location.district}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Listing Suggestions */}
              {suggestions?.listings && suggestions.listings.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground">
                    LISTINGS
                  </div>
                  {suggestions.listings.map((listing, index) => (
                    <button
                      key={listing.id}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted",
                        selectedIndex === index && "bg-muted"
                      )}
                      onClick={() => handleListingClick(listing)}
                    >
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                          <TrendingUp className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{listing.title}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{CATEGORY_DISPLAY_NAMES[listing.category]}</span>
                          <span>•</span>
                          <span>{listing.location.city}</span>
                          <span>•</span>
                          <span className="font-semibold text-primary">
                            ৳{Number(listing.basePrice).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
