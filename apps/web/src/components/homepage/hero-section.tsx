import { SearchForm } from '@/components/search';

export default function HeroSection() {
  return (
    <section className="relative min-h-[380px] md:min-h-[480px] flex items-center justify-center overflow-hidden rounded-xl mx-2 md:mx-4 mt-2 md:mt-4 mb-4 md:mb-6">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&q=80"
        >
          <source
            src="https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4"
            type="video/mp4"
          />
          {/* Fallback image if video doesn't load */}
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&q=80"
            alt="Bangladesh landscape"
            className="w-full h-full object-cover"
          />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full flex items-center justify-center px-2 sm:px-3 md:px-4 py-6 md:py-10">
        <div className="w-full max-w-4xl text-center space-y-3 md:space-y-5 box-border">
          {/* Main Headline */}
          <div className="space-y-1 md:space-y-2">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Adventure Simplified
            </h1>
            <p className="text-xs md:text-base lg:text-lg text-white/90 max-w-2xl mx-auto font-light">
              Guides, local transport, accommodation, and like-minded travelers are always included.
            </p>
          </div>

          {/* Search Form - Compact */}
          <div className="w-full max-w-3xl mx-auto overflow-hidden">
            <SearchForm variant="hero" className="w-full max-w-full" />
          </div>

          {/* Trust Badge - Hidden on mobile */}
          <div className="hidden md:flex items-center justify-center gap-2 text-white/90 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Shop <strong>2,500 tour operators</strong> and confidently book{' '}
              <strong>50,000+ organized adventures</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
