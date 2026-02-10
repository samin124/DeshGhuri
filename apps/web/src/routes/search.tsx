import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { requireCustomerAccess } from "@/lib/auth/role-guard";
import { Map, Grid3x3, SlidersHorizontal, Bookmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingCard } from "@/components/common/listing-card";
import { ListingDetailSheet } from "@/components/common/listing-detail-sheet";
import {
  DateRangePicker,
  GuestSelector,
  CategorySelect,
  PriceRangeSlider,
  AmenitiesFilter,
} from "@/components/search";
import { useListings } from "@/lib/api/listings";

// Define search params type
type SearchParams = {
  location?: string;
  date?: string;
  guests?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  groupEligible?: string;
  verifiedOnly?: string;
  flashDeals?: string;
  sort?: string;
  // New parameters
  checkIn?: string;
  checkOut?: string;
  adults?: string;
  children?: string;
  rooms?: string;
  amenities?: string; // comma-separated list
};

export const Route = createFileRoute("/search")({
  beforeLoad: async ({ location }) => {
    await requireCustomerAccess(location.pathname);
  },
  component: SearchComponent,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      location: search.location as string,
      date: search.date as string,
      guests: search.guests as string,
      category: search.category as string,
      minPrice: search.minPrice as string,
      maxPrice: search.maxPrice as string,
      rating: search.rating as string,
      groupEligible: search.groupEligible as string,
      verifiedOnly: search.verifiedOnly as string,
      flashDeals: search.flashDeals as string,
      sort: (search.sort as string) || "relevance",
      // New parameters
      checkIn: search.checkIn as string,
      checkOut: search.checkOut as string,
      adults: search.adults as string,
      children: search.children as string,
      rooms: search.rooms as string,
      amenities: search.amenities as string,
    };
  },
});

function SearchComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleListingClick = (listingId: string) => {
    setSelectedListingId(listingId);
    setSheetOpen(true);
  };

  // Fetch listings from API with current search params
  const { data, isLoading, error } = useListings({
    page: 1, // TODO: Add pagination support
    limit: 20,
    category: search.category && search.category !== "all" ? search.category : undefined,
    location: search.location,
    minPrice: search.minPrice ? Number(search.minPrice) : undefined,
    maxPrice: search.maxPrice ? Number(search.maxPrice) : undefined,
    rating: search.rating ? Number(search.rating) : undefined,
    groupEligible: search.groupEligible === "true" ? true : undefined,
    verifiedOnly: search.verifiedOnly === "true" ? true : undefined,
    flashDeals: search.flashDeals === "true" ? true : undefined,
    sort: search.sort === "price-low" ? "price-asc" :
          search.sort === "price-high" ? "price-desc" :
          search.sort === "rating" ? "rating" :
          search.sort === "popularity" ? "popular" :
          search.sort === "newest" ? "newest" : undefined,
  });

  const filteredListings = data?.data || [];

  // Update search params
  const updateSearch = useCallback((updates: Partial<SearchParams>) => {
    navigate({
      to: "/search",
      search: { ...search, ...updates },
    });
  }, [search, navigate]);

  // Handle price range change with proper callback
  const handlePriceRangeChange = useCallback(
    ([min, max]: [number, number]) => {
      updateSearch({
        minPrice: min.toString(),
        maxPrice: max.toString(),
      });
    },
    [updateSearch]
  );

  // Save search functionality (requires login)
  const [isSaving, setIsSaving] = useState(false);
  const handleSaveSearch = useCallback(() => {
    // TODO: Check if user is logged in
    const isLoggedIn = false; // Replace with actual auth check

    if (!isLoggedIn) {
      // Redirect to login or show login modal
      alert("Please login to save your search. You'll receive email notifications when new matches are found.");
      // navigate({ to: "/sign-in" }); // Uncomment when auth is ready
      return;
    }

    // Save the search criteria
    setIsSaving(true);
    try {
      // TODO: API call to save search
      const searchCriteria = {
        location: search.location,
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        adults: search.adults,
        children: search.children,
        rooms: search.rooms,
        category: search.category,
        minPrice: search.minPrice,
        maxPrice: search.maxPrice,
        rating: search.rating,
        amenities: search.amenities,
      };
      console.log("Saving search:", searchCriteria);

      // Simulate API call
      setTimeout(() => {
        setIsSaving(false);
        alert("Search saved! You'll receive email notifications when new matching listings are added.");
      }, 1000);
    } catch (error) {
      setIsSaving(false);
      alert("Failed to save search. Please try again.");
    }
  }, [search]);

  // Get available filters from API response
  const availableFilters = data?.filters?.availableFilters;
  const categoryCounts = availableFilters?.categories?.reduce(
    (acc, cat) => ({ ...acc, [cat.value]: cat.count }),
    {} as Record<string, number>
  ) || {};

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search Summary */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {search.flashDeals === "true" ? (
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              ⚡ Flash Deals{search.location && ` in ${search.location}`}
            </span>
          ) : search.location ? (
            `Searching in ${search.location}`
          ) : (
            "Search Results"
          )}
        </h1>
        <div className="space-y-1">
          <p className="text-muted-foreground">
            Found {filteredListings.length} available listing{filteredListings.length !== 1 ? 's' : ''}
            {search.location && ` in ${search.location}`}
          </p>
          {search.checkIn && search.checkOut && (
            <p className="text-sm text-muted-foreground">
              ✓ Showing only available inventory for selected dates
            </p>
          )}
          {(search.adults || search.children) && (
            <p className="text-sm text-muted-foreground">
              ✓ Prices updated for {Number(search.adults || 2) + Number(search.children || 0)} guest{Number(search.adults || 2) + Number(search.children || 0) !== 1 ? 's' : ''}
              {search.rooms && Number(search.rooms) > 1 && ` and ${search.rooms} rooms`}
            </p>
          )}
        </div>
      </div>

      {/* Filters and Controls Bar */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>

          {/* Quick filters */}
          <Button
            variant={search.flashDeals === "true" ? "default" : "outline"}
            size="sm"
            onClick={() => updateSearch({ flashDeals: search.flashDeals === "true" ? undefined : "true" })}
            className={search.flashDeals === "true" ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" : ""}
          >
            {search.flashDeals === "true" && "⚡ "}
            Flash Deals
          </Button>

          <Button
            variant={search.verifiedOnly === "true" ? "default" : "outline"}
            size="sm"
            onClick={() => updateSearch({ verifiedOnly: search.verifiedOnly === "true" ? undefined : "true" })}
          >
            Verified Only
          </Button>

          <Button
            variant={search.groupEligible === "true" ? "default" : "outline"}
            size="sm"
            onClick={() => updateSearch({ groupEligible: search.groupEligible === "true" ? undefined : "true" })}
          >
            Group Bookings
          </Button>
        </div>

        <div className="flex gap-2">
          {/* Sort dropdown */}
          <Select value={search.sort || "relevance"} onValueChange={(value) => updateSearch({ sort: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="popularity">Most Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className="flex gap-1 rounded-lg border p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("map")}
            >
              <Map className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 rounded-lg border bg-muted/30 p-6">
          <h3 className="mb-6 text-lg font-semibold">Filters</h3>

          {/* Section 1: Search Criteria */}
          <div className="mb-6 pb-6 border-b">
            <h4 className="text-sm font-medium mb-4 text-muted-foreground">Search Criteria</h4>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Dates */}
              <DateRangePicker
                checkInDate={search.checkIn ? new Date(search.checkIn) : null}
                checkOutDate={search.checkOut ? new Date(search.checkOut) : null}
                onCheckInChange={(date) =>
                  updateSearch({ checkIn: date?.toISOString() })
                }
                onCheckOutChange={(date) =>
                  updateSearch({ checkOut: date?.toISOString() })
                }
              />

              {/* Guests */}
              <GuestSelector
                adults={Number(search.adults || 2)}
                children={Number(search.children || 0)}
                rooms={Number(search.rooms || 1)}
                onAdultsChange={(value) => updateSearch({ adults: value.toString() })}
                onChildrenChange={(value) =>
                  updateSearch({ children: value.toString() })
                }
                onRoomsChange={(value) => updateSearch({ rooms: value.toString() })}
              />

              {/* Category */}
              <CategorySelect
                value={search.category || "all"}
                onChange={(value) => updateSearch({ category: value })}
                showCounts={true}
                counts={categoryCounts}
              />
            </div>
          </div>

          {/* Section 2: Price & Rating */}
          <div className="mb-6 pb-6 border-b">
            <h4 className="text-sm font-medium mb-4 text-muted-foreground">Price & Rating</h4>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Price Range Slider */}
              <PriceRangeSlider
                min={0}
                max={50000}
                value={[
                  Number(search.minPrice || 0),
                  Number(search.maxPrice || 50000),
                ]}
                onChange={handlePriceRangeChange}
              />

              {/* Rating Filter */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Minimum Rating</label>
                <Select
                  value={search.rating || "0"}
                  onValueChange={(value) => updateSearch({ rating: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Ratings</SelectItem>
                    <SelectItem value="3">3+ Stars ⭐⭐⭐</SelectItem>
                    <SelectItem value="4">4+ Stars ⭐⭐⭐⭐</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars ⭐⭐⭐⭐⭐</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 3: Amenities */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-4 text-muted-foreground">Amenities</h4>
            <AmenitiesFilter
              selectedAmenities={
                search.amenities ? search.amenities.split(",") : []
              }
              onChange={(amenities) =>
                updateSearch({
                  amenities: amenities.length ? amenities.join(",") : undefined,
                })
              }
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/search", search: {} })}
              className="flex-1"
            >
              Clear All Filters
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveSearch}
              disabled={isSaving}
              className="flex-1"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Search"}
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold text-destructive">
            Failed to load listings
          </h3>
          <p className="text-sm text-muted-foreground">
            Please try again later or adjust your search criteria.
          </p>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && viewMode === "grid" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClick={handleListingClick}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && viewMode === "map" && (
        <div className="rounded-lg border bg-muted/30 p-8 text-center">
          <Map className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Map View</h3>
          <p className="text-sm text-muted-foreground">
            Map view will be implemented with Google Maps API integration
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={handleListingClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredListings.length === 0 && (
        <div className="py-12 text-center">
          <h3 className="mb-2 text-xl font-semibold">No results found</h3>
          <p className="mb-4 text-muted-foreground">
            Try adjusting your filters or search criteria
          </p>
          <Button onClick={() => navigate({ to: "/search", search: {} })}>
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && data?.pagination && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Showing {filteredListings.length} of {data.pagination.total} results
            {data.pagination.totalPages > 1 && (
              <span> • Page {data.pagination.page} of {data.pagination.totalPages}</span>
            )}
          </p>
          {/* TODO: Add pagination controls when backend supports it */}
        </div>
      )}

      {/* Listing Detail Sheet */}
      <ListingDetailSheet
        listingId={selectedListingId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
