import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense, useState } from 'react';
import { requireCustomerAccess } from '@/lib/auth/role-guard';
import { useHomepageConfig } from '@/lib/api/listings';

// Eager load above-fold components for better LCP
import HeroSection from '@/components/homepage/hero-section';
import FlashDeals from '@/components/homepage/flash-deals';
import SpecialOffers from '@/components/homepage/special-offers';
import { ListingDetailSheet } from '@/components/common/listing-detail-sheet';

// Lazy load below-fold components for better performance
const TrendingListings = lazy(() => import('@/components/homepage/trending-listings'));
const BrowseCategories = lazy(() => import('@/components/homepage/browse-categories'));
const FeaturedDestinations = lazy(() => import('@/components/homepage/featured-destinations'));
const PopularServices = lazy(() => import('@/components/homepage/popular-services'));
const SeasonalPackages = lazy(() => import('@/components/homepage/seasonal-packages'));
const TestimonialsSection = lazy(() => import('@/components/homepage/testimonials'));
const BlogPreview = lazy(() => import('@/components/homepage/blog-preview'));
const FAQSection = lazy(() => import('@/components/homepage/faq-section'));
const NewsletterCTA = lazy(() => import('@/components/homepage/newsletter-cta'));

export const Route = createFileRoute('/')({
  beforeLoad: async ({ location }) => {
    await requireCustomerAccess(location.pathname);
  },
  component: HomeComponent,
  head: () => ({
    meta: [
      {
        title: 'DeshGhuri - Your Trusted Travel Marketplace in Bangladesh',
      },
      {
        name: 'description',
        content:
          'Book hotels, tours, and experiences in Bangladesh with escrow protection, group discounts up to 40%, and verified sellers. Secure payment, price lock guarantee, and split payment options available.',
      },
      {
        name: 'keywords',
        content:
          "Bangladesh travel, Cox's Bazar, Sundarbans, group booking, travel marketplace, escrow payment, verified sellers, tour packages, hotels Bangladesh",
      },
    ],
  }),
});

const SectionSkeleton = () => (
  <div className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-6">
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-64 rounded bg-muted"></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 rounded bg-muted"></div>
        ))}
      </div>
    </div>
  </div>
);

function HomeComponent() {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: homepageConfigResponse } = useHomepageConfig();
  const sectionVisibility = homepageConfigResponse?.data.sectionVisibility;

  const handleListingClick = (listingId: string) => {
    setSelectedListingId(listingId);
    setSheetOpen(true);
  };

  return (
    <main className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-background-subtle">
      {/* Above fold - eager load for better LCP */}
      {(sectionVisibility?.hero ?? true) && <HeroSection />}
      {(sectionVisibility?.flashDeals ?? true) && (
        <FlashDeals onListingClick={handleListingClick} />
      )}
      {(sectionVisibility?.specialOffers ?? true) && (
        <SpecialOffers onListingClick={handleListingClick} />
      )}

      {/* Below fold - lazy load with Suspense boundaries */}
      {(sectionVisibility?.trendingListings ?? true) && (
        <Suspense fallback={<SectionSkeleton />}>
          <TrendingListings onListingClick={handleListingClick} />
        </Suspense>
      )}

      {(sectionVisibility?.browseCategories ?? true) && (
        <Suspense fallback={<SectionSkeleton />}>
          <BrowseCategories />
        </Suspense>
      )}

      {(sectionVisibility?.featuredDestinations ?? true) && (
        <Suspense fallback={<SectionSkeleton />}>
          <FeaturedDestinations />
        </Suspense>
      )}

      {(sectionVisibility?.popularServices ?? true) && (
        <Suspense fallback={<SectionSkeleton />}>
          <PopularServices onListingClick={handleListingClick} />
        </Suspense>
      )}

      {(sectionVisibility?.seasonalPackages ?? true) && (
        <Suspense fallback={<SectionSkeleton />}>
          <SeasonalPackages onListingClick={handleListingClick} />
        </Suspense>
      )}

      {(sectionVisibility?.testimonials ?? true) && (
        <Suspense fallback={<SectionSkeleton />}>
          <TestimonialsSection />
        </Suspense>
      )}

      {(sectionVisibility?.blogPreview ?? true) && (
        <Suspense fallback={<SectionSkeleton />}>
          <BlogPreview />
        </Suspense>
      )}

      {(sectionVisibility?.faq ?? true) && (
        <Suspense fallback={<SectionSkeleton />}>
          <FAQSection />
        </Suspense>
      )}

      {(sectionVisibility?.newsletter ?? true) && <NewsletterCTA />}

      {/* Listing Detail Sheet */}
      <ListingDetailSheet
        listingId={selectedListingId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </main>
  );
}
