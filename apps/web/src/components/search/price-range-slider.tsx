import { useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  currency?: string;
  step?: number;
  className?: string;
}

export function PriceRangeSlider({
  min = 0,
  max = 50000,
  value,
  onChange,
  currency = "৳",
  step = 500,
  className,
}: PriceRangeSliderProps) {
  const [minValue, maxValue] = value;

  // Debounce is handled by the parent component for URL updates
  const handleSliderChange = (newValue: number[]) => {
    if (newValue.length === 2) {
      onChange([newValue[0], newValue[1]]);
    }
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value);
    if (!isNaN(newMin) && newMin >= min && newMin <= maxValue) {
      onChange([newMin, maxValue]);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value);
    if (!isNaN(newMax) && newMax >= minValue && newMax <= max) {
      onChange([minValue, newMax]);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <label className="text-sm font-medium">Price Range</label>
        <Slider
          min={min}
          max={max}
          step={step}
          value={[minValue, maxValue]}
          onValueChange={handleSliderChange}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Min Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {currency}
            </span>
            <Input
              type="number"
              value={minValue}
              onChange={handleMinInputChange}
              min={min}
              max={maxValue}
              step={step}
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Max Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {currency}
            </span>
            <Input
              type="number"
              value={maxValue}
              onChange={handleMaxInputChange}
              min={minValue}
              max={max}
              step={step}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {currency}{minValue.toLocaleString()}
        </span>
        <span>
          {currency}{maxValue.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
