import { Star, StarHalf } from 'lucide-react';

interface RatingStarsProps {
  rating?: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewCount?: number;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  reviewCount,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const renderStars = () => {
    const stars = [];
    const actualRating = rating || 0;
    const fullStars = Math.floor(actualRating);
    const hasHalfStar = actualRating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`}
        />
      );
    }

    if (hasHalfStar && stars.length < maxRating) {
      stars.push(
        <StarHalf key="half" className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
      );
    }

    const remainingStars = maxRating - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className={`${sizeClasses[size]} text-gray-300`} />);
    }

    return stars;
  };

  return (
    <div className="flex items-center gap-1">
      {renderStars()}
      {showNumber && rating !== undefined && (
        <span className="ml-1 text-sm font-medium text-muted-foreground">{rating.toFixed(1)}</span>
      )}
      {reviewCount !== undefined && (
        <span className="ml-1 text-xs text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  );
}
