import { Clock } from "lucide-react";

import { useCountdown } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  endTime: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  onExpire?: () => void;
}

export function CountdownTimer({
  endTime,
  size = "md",
  className,
  onExpire,
}: CountdownTimerProps) {
  const timeLeft = useCountdown(endTime);

  // Call onExpire callback when timer reaches 0
  if (timeLeft.total <= 0 && onExpire) {
    onExpire();
  }

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (timeLeft.total <= 0) {
    return (
      <div className={cn("flex items-center gap-1 text-muted-foreground", className)}>
        <Clock className="h-4 w-4" />
        <span className={sizeClasses[size]}>Expired</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Clock className="h-4 w-4 text-destructive" />
      <div className={cn("flex items-center gap-1 font-mono font-bold text-destructive", sizeClasses[size])}>
        {timeLeft.days > 0 && (
          <>
            <span>{String(timeLeft.days).padStart(2, "0")}</span>
            <span>:</span>
          </>
        )}
        <span>{String(timeLeft.hours).padStart(2, "0")}</span>
        <span>:</span>
        <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
        <span>:</span>
        <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
