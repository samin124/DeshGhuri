import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/search";
import { HERO_IMAGES } from "@/lib/constants";

export default function HeroSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000 }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="relative overflow-hidden bg-muted/30">
      {/* Container to match other sections */}
      <div className="container mx-auto px-4">
        {/* Desktop: 2-column layout (70-30), Tablet: 65-35, Mobile: stacked */}
        <div className="flex flex-col lg:grid lg:grid-cols-[70%_30%] md:grid-cols-[65%_35%] h-[600px] md:h-[500px] lg:h-[600px] py-4">

          {/* Left Column: Carousel with Text Overlays */}
          <div className="relative h-[400px] md:h-full overflow-hidden rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none">
            {/* Carousel */}
            <div ref={emblaRef} className="h-full">
              <div className="flex h-full">
                {HERO_IMAGES.map((image, index) => (
                  <div key={index} className="relative min-w-0 flex-[0_0_100%]">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="h-full w-full object-cover"
                    />
                    {/* Text Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                        {image.title}
                      </h2>
                      <p className="text-sm md:text-base text-white/90">
                        {image.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Controls */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={scrollPrev}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={scrollNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Carousel Dots */}
            <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {HERO_IMAGES.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === selectedIndex
                      ? "w-8 bg-white"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  onClick={() => emblaApi?.scrollTo(index)}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Search Form */}
          <div className="flex items-center justify-center p-2 md:p-4 lg:p-6">
            <SearchForm variant="hero" className="w-full max-w-md" />
          </div>
        </div>
      </div>
    </section>
  );
}
