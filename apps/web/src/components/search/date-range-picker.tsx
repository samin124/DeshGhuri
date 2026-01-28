import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  checkInDate: Date | null;
  checkOutDate: Date | null;
  onCheckInChange: (date: Date | null) => void;
  onCheckOutChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function DateRangePicker({
  checkInDate,
  checkOutDate,
  onCheckInChange,
  onCheckOutChange,
  minDate = new Date(),
  maxDate,
  className,
}: DateRangePickerProps) {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);

  const handleCheckInSelect = (date: Date | undefined) => {
    if (date) {
      onCheckInChange(date);
      // If check-out is before new check-in, reset it
      if (checkOutDate && checkOutDate <= date) {
        onCheckOutChange(null);
      }
      // Auto-open check-out picker after check-in selection
      setCheckInOpen(false);
      setTimeout(() => setCheckOutOpen(true), 100);
    }
  };

  const handleCheckOutSelect = (date: Date | undefined) => {
    if (date) {
      onCheckOutChange(date);
      setCheckOutOpen(false);
    }
  };

  const clearCheckIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCheckInChange(null);
    onCheckOutChange(null);
  };

  const clearCheckOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCheckOutChange(null);
  };

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {/* Check-in Date */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Check-in</label>
        <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !checkInDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkInDate ? (
                <span className="flex-1">{format(checkInDate, "MMM dd, yyyy")}</span>
              ) : (
                <span className="flex-1">Select date</span>
              )}
              {checkInDate && (
                <button
                  onClick={clearCheckIn}
                  className="ml-auto hover:text-destructive"
                >
                  ×
                </button>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkInDate || undefined}
              onSelect={handleCheckInSelect}
              disabled={{ before: minDate, after: maxDate }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Check-out Date */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Check-out</label>
        <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !checkOutDate && "text-muted-foreground"
              )}
              disabled={!checkInDate}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkOutDate ? (
                <span className="flex-1">{format(checkOutDate, "MMM dd, yyyy")}</span>
              ) : (
                <span className="flex-1">Select date</span>
              )}
              {checkOutDate && (
                <button
                  onClick={clearCheckOut}
                  className="ml-auto hover:text-destructive"
                >
                  ×
                </button>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkOutDate || undefined}
              onSelect={handleCheckOutSelect}
              disabled={{
                before: checkInDate ? new Date(checkInDate.getTime() + 86400000) : minDate,
                after: maxDate,
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
