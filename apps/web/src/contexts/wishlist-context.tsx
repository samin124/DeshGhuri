import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';

import type { Listing } from '@/types/listing';
import { authClient } from '@/lib/auth-client';

const getStorageKey = (userId: string) => `wishlist:${userId}`;

export interface WishlistItem {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
  price: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  isAuthenticated: boolean;
  isWishlisted: (listingId: string) => boolean;
  toggleWishlist: (listing: Listing) => void;
  removeFromWishlist: (listingId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

function normalizeLocation(listing: Listing) {
  if (typeof listing.location === 'string') {
    return listing.location;
  }

  return [listing.location?.city, listing.location?.district].filter(Boolean).join(', ');
}

function toWishlistItem(listing: Listing): WishlistItem {
  const primaryImage = listing.images?.find((image) => image.isPrimary) || listing.images?.[0];
  return {
    id: listing.id,
    title: listing.title,
    location: normalizeLocation(listing) || 'Location unavailable',
    imageUrl: primaryImage?.url || '/placeholder-listing.jpg',
    price: listing.discountedPrice || listing.basePrice || '0',
  };
}

function parseStoredWishlist(value: string | null): WishlistItem[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item: unknown): item is WishlistItem => {
      if (!item || typeof item !== 'object') return false;
      const candidate = item as Record<string, unknown>;
      return (
        typeof candidate.id === 'string' &&
        typeof candidate.title === 'string' &&
        typeof candidate.location === 'string' &&
        typeof candidate.imageUrl === 'string' &&
        typeof candidate.price === 'string'
      );
    });
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const lastUserIdRef = useRef<string | null>(null);
  const userId = session?.user?.id || null;

  useEffect(() => {
    if (typeof window === 'undefined' || isPending) return;

    if (!userId) {
      lastUserIdRef.current = null;
      setItems([]);
      return;
    }

    lastUserIdRef.current = userId;
    const stored = localStorage.getItem(getStorageKey(userId));
    setItems(parseStoredWishlist(stored));
  }, [isPending, userId]);

  useEffect(() => {
    if (typeof window === 'undefined' || isPending || !userId) return;
    localStorage.setItem(getStorageKey(userId), JSON.stringify(items));
  }, [isPending, items, userId]);

  const isWishlisted = useCallback(
    (listingId: string) => items.some((item) => item.id === listingId),
    [items]
  );

  const removeFromWishlist = useCallback((listingId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== listingId));
  }, []);

  const clearWishlist = useCallback(() => {
    setItems([]);

    if (typeof window === 'undefined') return;
    const clearUserId = userId || lastUserIdRef.current;
    if (clearUserId) {
      localStorage.removeItem(getStorageKey(clearUserId));
    }
  }, [userId]);

  const toggleWishlist = useCallback(
    (listing: Listing) => {
      if (!userId) {
        toast.error('Please sign in to save favorites');
        return;
      }

      const alreadyWishlisted = items.some((item) => item.id === listing.id);

      if (alreadyWishlisted) {
        removeFromWishlist(listing.id);
        toast.success('Removed from favorites');
        return;
      }

      const wishlistItem = toWishlistItem(listing);
      setItems((prev) => [wishlistItem, ...prev]);
      toast.success('Added to favorites');
    },
    [items, removeFromWishlist, userId]
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      count: items.length,
      isAuthenticated: !!userId,
      isWishlisted,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
    }),
    [items, userId, isWishlisted, toggleWishlist, removeFromWishlist, clearWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }

  return context;
}
