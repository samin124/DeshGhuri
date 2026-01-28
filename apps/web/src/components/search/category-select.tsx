import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  showCounts?: boolean;
  counts?: Record<string, number>;
  className?: string;
}

export function CategorySelect({
  value,
  onChange,
  showCounts = false,
  counts,
  className,
}: CategorySelectProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-sm font-medium">Category</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <span>All Categories</span>
            {showCounts && counts && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({Object.values(counts).reduce((a, b) => a + b, 0)})
              </span>
            )}
          </SelectItem>
          {CATEGORIES.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <span className="flex items-center gap-2">
                <span>{category.icon}</span>
                <span>{category.name}</span>
                {showCounts && counts && counts[category.id] !== undefined && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    ({counts[category.id]})
                  </span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
