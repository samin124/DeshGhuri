import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const AMENITIES = [
  { id: 'wifi', label: 'Free WiFi', icon: '📶' },
  { id: 'breakfast', label: 'Breakfast Included', icon: '🍳' },
  { id: 'parking', label: 'Free Parking', icon: '🅿️' },
  { id: 'pool', label: 'Swimming Pool', icon: '🏊' },
  { id: 'gym', label: 'Fitness Center', icon: '💪' },
  { id: 'spa', label: 'Spa & Wellness', icon: '💆' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'ac', label: 'Air Conditioning', icon: '❄️' },
  { id: 'beach', label: 'Beach Access', icon: '🏖️' },
  { id: 'pet', label: 'Pet Friendly', icon: '🐕' },
] as const;

interface AmenitiesFilterProps {
  selectedAmenities: string[];
  onChange: (amenities: string[]) => void;
  className?: string;
}

export function AmenitiesFilter({ selectedAmenities, onChange, className }: AmenitiesFilterProps) {
  const toggleAmenity = (amenityId: string) => {
    const updated = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter((a) => a !== amenityId)
      : [...selectedAmenities, amenityId];

    onChange(updated);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <label className="text-sm font-medium">Amenities</label>
      <div className="grid grid-cols-2 gap-3">
        {AMENITIES.map((amenity) => (
          <div key={amenity.id} className="flex items-center space-x-2">
            <Checkbox
              id={amenity.id}
              checked={selectedAmenities.includes(amenity.id)}
              onCheckedChange={() => toggleAmenity(amenity.id)}
            />
            <label
              htmlFor={amenity.id}
              className="text-sm cursor-pointer flex items-center gap-1.5 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              <span>{amenity.icon}</span>
              <span>{amenity.label}</span>
            </label>
          </div>
        ))}
      </div>
      {selectedAmenities.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          Clear amenities
        </button>
      )}
    </div>
  );
}

export { AMENITIES };
