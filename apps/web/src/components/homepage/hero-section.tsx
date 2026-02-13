import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowUpRight, MapPin, ShieldCheck, Sparkles, Star, Store } from 'lucide-react';

import type { Listing } from '@/types/listing';
import { SearchForm } from '@/components/search';
import { CountdownTimer } from '@/components/common/countdown-timer';
import { useFlashDeals, useHomepageConfig } from '@/lib/api/listings';

function getOfferDiscount(listing: Listing): number | null {
  if (typeof listing.discountPercent === 'number' && listing.discountPercent > 0) {
    return Math.round(listing.discountPercent);
  }

  const basePrice = Number(listing.basePrice ?? 0);
  const discountedPrice = Number(listing.discountedPrice ?? 0);

  if (basePrice > 0 && discountedPrice > 0 && discountedPrice < basePrice) {
    return Math.round(((basePrice - discountedPrice) / basePrice) * 100);
  }

  return null;
}

function formatPrice(value?: string) {
  return `BDT ${Number(value ?? '0').toLocaleString()}`;
}

function getLocationText(location: Listing['location'] | string | null | undefined) {
  if (typeof location === 'string') {
    return location;
  }

  if (location?.city && location?.district) {
    return `${location.city}, ${location.district}`;
  }

  return location?.city || location?.district || 'Bangladesh';
}

export default function HeroSection() {
  const navigate = useNavigate();
  const { data: flashDealsData, isLoading: isDealsLoading } = useFlashDeals();
  const { data: homepageConfigResponse } = useHomepageConfig();
  const autoplayRef = useRef(
    Autoplay({
      delay: 4000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplayRef.current]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const offers = useMemo(() => {
    const listings = flashDealsData?.data ?? [];

    return listings
      .filter(
        (listing) =>
          listing.isFlashDeal ||
          Boolean(listing.discountedPrice) ||
          typeof listing.discountPercent === 'number'
      )
      .sort((a, b) => {
        const discountDiff = (getOfferDiscount(b) ?? 0) - (getOfferDiscount(a) ?? 0);
        if (discountDiff !== 0) {
          return discountDiff;
        }

        return Number(b.rating ?? 0) - Number(a.rating ?? 0);
      })
      .slice(0, 5);
  }, [flashDealsData]);
  const heroConfig = homepageConfigResponse?.data;
  const activeOffer = offers[selectedIndex] ?? offers[0];
  const activeDiscount = activeOffer ? getOfferDiscount(activeOffer) : null;

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const handleOfferNavigate = useCallback(
    (listingId: string) => {
      navigate({ to: `/listing/${listingId}` });
    },
    [navigate]
  );

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    setSnapCount(emblaApi.scrollSnapList().length);
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect, offers.length]);

  return (
    <section className="bg-background-subtle py-2 md:py-4">
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
        <div className="relative rounded-2xl">
          <div className="grid min-h-[280px] grid-cols-1 gap-3 lg:min-h-[420px] lg:grid-cols-[65%_35%] lg:gap-3">
            {/* Column 1: Top offers carousel */}
            <div className="relative min-h-[280px] overflow-visible rounded-xl lg:min-h-[420px]">
              {!isDealsLoading && activeOffer ? (
                <div className="pointer-events-none absolute -left-2 -top-2 z-40 md:-left-3 md:-top-3">
                  <div className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 shadow-lg">
                    <Star className="h-3.5 w-3.5 fill-white text-white" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-white md:text-xs">
                      {activeDiscount ? `Sale ${activeDiscount}% Off` : 'Hot Sale'}
                    </span>
                  </div>
                </div>
              ) : null}

              {isDealsLoading ? (
                <div className="flex h-full items-end rounded-xl bg-muted/60 p-5 md:p-7">
                  <div className="w-full animate-pulse space-y-3">
                    <div className="h-6 w-28 rounded-full bg-muted" />
                    <div className="h-8 w-2/3 rounded bg-muted" />
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ) : offers.length > 0 ? (
                <>
                  <div className="h-full overflow-hidden rounded-xl" ref={emblaRef}>
                    <div className="flex h-full">
                      {offers.map((offer) => {
                        const primaryImage =
                          offer.images?.find((image) => image.isPrimary) || offer.images?.[0];
                        const imageUrl = primaryImage?.url || '/placeholder-listing.jpg';
                        const rating = offer.rating ? Number.parseFloat(offer.rating) : 0;
                        const sellerName = offer.seller?.name || 'Verified Seller';
                        const locationText = getLocationText(offer.location);
                        const currentPrice = offer.discountedPrice || offer.basePrice;

                        return (
                          <div
                            key={offer.id}
                            className="group relative min-h-[280px] min-w-0 flex-[0_0_100%] cursor-pointer lg:min-h-[420px]"
                            onClick={() => handleOfferNavigate(offer.id)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                handleOfferNavigate(offer.id);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={`View details for ${offer.title}`}
                          >
                            <img
                              src={imageUrl}
                              alt={offer.title}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/82 via-black/52 to-black/25" />
                            <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_90%_10%,rgba(34,197,94,0.2),transparent_55%),radial-gradient(120%_90%_at_10%_95%,rgba(251,146,60,0.18),transparent_60%)]" />

                            <div className="absolute right-4 top-4 z-20 rounded-full border border-white/20 bg-background/92 px-3 py-1.5 shadow-md backdrop-blur-sm">
                              {offer.flashDealEndsAt ? (
                                <CountdownTimer endTime={offer.flashDealEndsAt} size="sm" />
                              ) : (
                                <span className="text-xs font-semibold text-foreground">
                                  Limited Time Offer
                                </span>
                              )}
                            </div>

                            <div className="relative z-20 flex h-full items-end p-5 md:p-7">
                              <div className="w-full max-w-3xl space-y-3.5">
                                <div className="inline-flex items-center gap-1 rounded-full border border-white/35 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                                  Best Offer Package
                                </div>

                                <h2 className="line-clamp-1 text-2xl font-bold leading-tight text-white drop-shadow-sm md:text-3xl">
                                  {offer.title}
                                </h2>

                                <p className="line-clamp-2 max-w-2xl text-xs text-white/90 md:text-sm">
                                  {offer.description}
                                </p>

                                <div className="grid gap-2.5 md:grid-cols-[1fr_auto]">
                                  <div className="rounded-2xl border border-white/20 bg-black/42 p-3 text-white shadow-lg backdrop-blur-md">
                                    <div className="flex flex-wrap items-center gap-2.5 text-xs md:text-sm">
                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {locationText}
                                      </span>
                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                        {rating > 0 ? rating.toFixed(1) : 'New'}
                                        {offer.reviewCount > 0 ? ` (${offer.reviewCount})` : ''}
                                      </span>
                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                                        <Store className="h-3.5 w-3.5" />
                                        {sellerName}
                                        {offer.seller?.isVerified ? (
                                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                                        ) : null}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="w-full rounded-2xl border border-white/30 bg-gradient-to-br from-slate-900/88 to-black/72 p-3 shadow-xl backdrop-blur-md md:w-auto md:min-w-[205px]">
                                    <div className="flex items-end gap-2">
                                      <span className="text-lg font-bold text-amber-200 md:text-xl">
                                        {formatPrice(currentPrice)}
                                      </span>
                                      {offer.discountedPrice ? (
                                        <span className="pb-0.5 text-[11px] text-white/65 line-through">
                                          {formatPrice(offer.basePrice)}
                                        </span>
                                      ) : null}
                                    </div>
                                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/18 px-3 py-1 text-xs font-semibold text-white">
                                      View deal details
                                      <ArrowUpRight className="h-3.5 w-3.5" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {offers.length > 1 ? (
                    <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2">
                      {Array.from({ length: snapCount }).map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => emblaApi?.scrollTo(index)}
                          className={`h-2.5 rounded-full transition-all ${
                            index === selectedIndex
                              ? 'w-6 bg-accent shadow-md shadow-accent/50'
                              : 'w-2.5 bg-white/45 hover:bg-white/70'
                          }`}
                          aria-label={`Go to offer ${index + 1}`}
                        />
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="flex h-full items-end rounded-xl bg-muted/60 p-5 md:p-7">
                  <div className="space-y-2 text-foreground">
                    <p className="inline-flex rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                      Offers Updating
                    </p>
                    <h2 className="text-xl font-bold md:text-2xl">Best deals are coming shortly</h2>
                    <p className="text-sm text-muted-foreground">
                      New discounted packages will appear here from verified sellers.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Column 2: Filter Panel (35%) */}
            <div className="relative flex min-h-[220px] items-center rounded-xl bg-gradient-to-b from-primary/8 via-accent/8 to-background p-4 shadow-sm md:min-h-[260px] md:p-5 lg:min-h-0 lg:p-6">
              <div className="w-full space-y-3">
                <div>
                  <h2 className="line-clamp-2 text-base font-bold text-foreground md:text-lg">
                    {heroConfig?.heroTitle || 'Plan Your Trip'}
                  </h2>
                  <p className="mt-1 line-clamp-3 text-[11px] text-muted-foreground md:text-xs">
                    {heroConfig?.heroSubtitle ||
                      'Filter by destination, dates, guests, and category.'}
                  </p>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-accent/15 to-transparent p-[1px]">
                  <SearchForm
                    variant="inline"
                    className="w-full rounded-[15px] border border-primary/15 bg-background/95 p-3 shadow-sm md:p-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
