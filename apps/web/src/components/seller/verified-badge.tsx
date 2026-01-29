import { BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function VerifiedBadge({
  size = 'md',
  showText = true,
  className,
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className={cn(
              'inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50',
              className
            )}
          >
            <BadgeCheck className={cn(sizeClasses[size], 'flex-shrink-0')} />
            {showText && (
              <span className={textSizeClasses[size]}>Verified</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>This seller has been verified by DeshGhuri</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
