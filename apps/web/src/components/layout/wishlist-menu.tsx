import { Heart, MapPin, Trash2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWishlist } from '@/contexts/wishlist-context';

export function WishlistMenu() {
  const navigate = useNavigate();
  const { items, count, isAuthenticated, removeFromWishlist } = useWishlist();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
          <Heart className="h-[18px] w-[18px]" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">My Favorites</h3>

          {!isAuthenticated ? (
            <div className="py-8 text-center">
              <Heart className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                Sign in to save and manage your favorites
              </p>
              <Button
                size="sm"
                onClick={() => {
                  window.location.href = '/login';
                }}
              >
                Sign In
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center">
              <Heart className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No favorites yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tap the heart on any package to save it.
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="h-[360px] -mx-1 px-1">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0"
                          onClick={() => navigate({ to: `/listing/${item.id}` })}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </button>

                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            className="text-left w-full font-medium text-sm truncate hover:underline"
                            onClick={() => navigate({ to: `/listing/${item.id}` })}
                          >
                            {item.title}
                          </button>

                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{item.location}</span>
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-semibold">
                              BDT {Number(item.price).toLocaleString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => removeFromWishlist(item.id)}
                              aria-label="Remove from favorites"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <DropdownMenuSeparator className="my-3" />

              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate({ to: '/search' })}
              >
                Explore More Packages
              </Button>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
