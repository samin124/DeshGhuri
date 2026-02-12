import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  currency?: 'BDT';
  discountPercent?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceDisplay({
  price,
  currency = 'BDT',
  discountPercent,
  size = 'md',
  className,
}: PriceDisplayProps) {
  const currencySymbol = currency === 'BDT' ? '৳' : '৳';
  const originalPrice = discountPercent ? Math.round(price / (1 - discountPercent / 100)) : null;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('font-bold text-primary', sizeClasses[size])}>
        {currencySymbol}
        {price.toLocaleString()}
      </span>
      {originalPrice && (
        <span
          className={cn(
            'text-muted-foreground line-through',
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'
          )}
        >
          {currencySymbol}
          {originalPrice.toLocaleString()}
        </span>
      )}
      {discountPercent && (
        <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-white">
          {discountPercent}% OFF
        </span>
      )}
    </div>
  );
}
