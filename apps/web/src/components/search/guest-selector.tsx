import { useState } from 'react';
import { Users, Minus, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GuestSelectorProps {
  adults: number;
  children: number;
  rooms: number;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  onRoomsChange: (value: number) => void;
  maxGuests?: number;
  maxRooms?: number;
  className?: string;
}

export function GuestSelector({
  adults,
  children,
  rooms,
  onAdultsChange,
  onChildrenChange,
  onRoomsChange,
  maxGuests = 20,
  maxRooms = 10,
  className,
}: GuestSelectorProps) {
  const [open, setOpen] = useState(false);

  const totalGuests = adults + children;

  const incrementAdults = () => {
    if (totalGuests < maxGuests) {
      onAdultsChange(adults + 1);
    }
  };

  const decrementAdults = () => {
    if (adults > 1) {
      onAdultsChange(adults - 1);
    }
  };

  const incrementChildren = () => {
    if (totalGuests < maxGuests && children < 10) {
      onChildrenChange(children + 1);
    }
  };

  const decrementChildren = () => {
    if (children > 0) {
      onChildrenChange(children - 1);
    }
  };

  const incrementRooms = () => {
    if (rooms < maxRooms) {
      onRoomsChange(rooms + 1);
    }
  };

  const decrementRooms = () => {
    if (rooms > 1) {
      onRoomsChange(rooms - 1);
    }
  };

  const displayText = () => {
    const guestsText = `${totalGuests} Guest${totalGuests !== 1 ? 's' : ''}`;
    const roomsText = `${rooms} Room${rooms !== 1 ? 's' : ''}`;
    return `${guestsText}, ${roomsText}`;
  };

  return (
    <div className={cn('', className)}>
      <label className="text-sm font-medium mb-1 block">Guests & Rooms</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="flex h-10 w-full items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm font-normal ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Users className="mr-2 h-4 w-4" />
          <span className="flex-1 text-left">{displayText()}</span>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            {/* Adults */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Adults</p>
                <p className="text-xs text-muted-foreground">Ages 13+</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={decrementAdults}
                  disabled={adults <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{adults}</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={incrementAdults}
                  disabled={totalGuests >= maxGuests}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Children</p>
                <p className="text-xs text-muted-foreground">Ages 0-12</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={decrementChildren}
                  disabled={children <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{children}</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={incrementChildren}
                  disabled={totalGuests >= maxGuests || children >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Rooms */}
            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="font-medium">Rooms</p>
                <p className="text-xs text-muted-foreground">Number of rooms</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={decrementRooms}
                  disabled={rooms <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{rooms}</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={incrementRooms}
                  disabled={rooms >= maxRooms}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Optional: Room suggestion */}
            {totalGuests > rooms * 3 && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                💡 Consider adding more rooms for your group size
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
