import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from './date-range-picker';
import { GuestSelector } from './guest-selector';
import { CategorySelect } from './category-select';
import { CITIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SearchFormProps {
  variant?: 'hero' | 'inline';
  onSearch?: () => void;
  className?: string;
}

export function SearchForm({ variant = 'hero', onSearch, className }: SearchFormProps) {
  const navigate = useNavigate();

  // Form state
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [category, setCategory] = useState('all');

  // Location autocomplete
  const suggestions = useMemo(() => {
    if (!location.trim()) return [];
    return CITIES.filter((city) => city.toLowerCase().includes(location.toLowerCase())).slice(0, 5);
  }, [location]);

  const handleLocationSelect = (city: string) => {
    setLocation(city);
    setShowSuggestions(false);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Build search params
    const searchParams: Record<string, string> = {};

    if (location) searchParams.location = location;
    if (checkInDate) searchParams.checkIn = checkInDate.toISOString();
    if (checkOutDate) searchParams.checkOut = checkOutDate.toISOString();
    if (adults) searchParams.adults = adults.toString();
    if (children) searchParams.children = children.toString();
    if (rooms) searchParams.rooms = rooms.toString();
    if (category && category !== 'all') searchParams.category = category;

    // Navigate to search page with params
    navigate({
      to: '/search',
      search: searchParams,
    });

    // Optional callback
    onSearch?.();
  };

  const isHeroVariant = variant === 'hero';

  return (
    <form
      onSubmit={handleSearch}
      className={cn(
        'space-y-2 md:space-y-3 box-border',
        isHeroVariant && 'bg-card rounded-lg shadow-lg p-3 md:p-4 border overflow-hidden',
        className
      )}
    >
      {isHeroVariant && (
        <div className="mb-2 md:mb-3">
          <h2 className="text-base md:text-lg font-bold mb-1 text-foreground">
            Find Your Perfect Trip
          </h2>
          <p className="text-[11px] md:text-xs text-muted-foreground">
            Search hotels, tours, and experiences across Bangladesh
          </p>
        </div>
      )}

      {/* Location */}
      <div className="space-y-1 relative">
        <label className="text-xs font-medium text-foreground">Destination</label>
        <Input
          type="text"
          placeholder="Where do you want to go?"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-md shadow-lg z-50 max-h-60 overflow-auto">
            {suggestions.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleLocationSelect(city)}
                className="w-full px-4 py-2 text-left hover:bg-muted transition-colors text-sm text-foreground"
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dates */}
      <DateRangePicker
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        onCheckInChange={setCheckInDate}
        onCheckOutChange={setCheckOutDate}
      />

      {/* Guests & Rooms */}
      <GuestSelector
        adults={adults}
        children={children}
        rooms={rooms}
        onAdultsChange={setAdults}
        onChildrenChange={setChildren}
        onRoomsChange={setRooms}
      />

      {/* Category */}
      <CategorySelect value={category} onChange={setCategory} />

      {/* Search Button */}
      <Button type="submit" className="w-full" size="default">
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>

      {isHeroVariant && (
        <p className="text-[11px] text-center text-muted-foreground pt-1">
          Over 500+ verified travel services available
        </p>
      )}
    </form>
  );
}
