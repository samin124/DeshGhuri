import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// Eager load above-fold components for better LCP
import HeroSection from "@/components/homepage/hero-section";
import FlashDeals from "@/components/homepage/flash-deals";
import SpecialOffers from "@/components/homepage/special-offers";

// Lazy load below-fold components for better performance
const TrendingListings = lazy(() => import("@/components/homepage/trending-listings"));
const BrowseCategories = lazy(() => import("@/components/homepage/browse-categories"));
const FeaturedDestinations = lazy(() => import("@/components/homepage/featured-destinations"));
const PopularServices = lazy(() => import("@/components/homepage/popular-services"));
const GroupsForming = lazy(() => import("@/components/homepage/groups-forming"));
const SeasonalPackages = lazy(() => import("@/components/homepage/seasonal-packages"));
const HowItWorks = lazy(() => import("@/components/homepage/how-it-works"));
const TestimonialsSection = lazy(() => import("@/components/homepage/testimonials"));
const BlogPreview = lazy(() => import("@/components/homepage/blog-preview"));
const PartnersSection = lazy(() => import("@/components/homepage/partners-section"));
const StatsSection = lazy(() => import("@/components/homepage/stats-section"));
const FAQSection = lazy(() => import("@/components/homepage/faq-section"));
const NewsletterCTA = lazy(() => import("@/components/homepage/newsletter-cta"));

export const Route = createFileRoute("/")({
  component: HomeComponent,
  head: () => ({
    meta: [
      {
        title: "DeshGhuri - Your Trusted Travel Marketplace in Bangladesh",
      },
      {
        name: "description",
        content:
          "Book hotels, tours, and experiences in Bangladesh with escrow protection, group discounts up to 40%, and verified sellers. Secure payment, price lock guarantee, and split payment options available.",
      },
      {
        name: "keywords",
        content:
          "Bangladesh travel, Cox's Bazar, Sundarbans, group booking, travel marketplace, escrow payment, verified sellers, tour packages, hotels Bangladesh",
      },
    ],
  }),
});

const SectionSkeleton = () => (
  <div className="container mx-auto py-12 px-4">
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
  return (
    <main className="min-h-screen">
      {/* Above fold - eager load for better LCP */}
      <HeroSection />
      <FlashDeals />
      <SpecialOffers />

      {/* Below fold - lazy load with Suspense boundaries */}
      <Suspense fallback={<SectionSkeleton />}>
        <TrendingListings />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <BrowseCategories />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FeaturedDestinations />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <PopularServices />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <GroupsForming />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <SeasonalPackages />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <HowItWorks />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <BlogPreview />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <PartnersSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FAQSection />
      </Suspense>

      <NewsletterCTA />
    </main>
  );
}
