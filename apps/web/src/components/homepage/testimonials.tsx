import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from '@/components/common/rating-stars';
import { mockTestimonials } from '@/lib/mock-data';

export default function TestimonialsSection() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);

  return (
    <section className="py-20 bg-gradient-to-b from-background-subtle to-background">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            What Travelers Say
          </h2>
          <p className="text-muted-foreground text-xl">Real experiences from our community</p>
        </div>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {mockTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="min-w-0 flex-[0_0_100%] px-4 md:flex-[0_0_33.33%]"
              >
                <Card className="border shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-8">
                    {/* Quote Icon */}
                    <div className="mb-6 text-6xl text-muted-foreground/30 font-serif leading-none">
                      "
                    </div>

                    {/* Avatar and Info */}
                    <div className="mb-6 flex items-center gap-4">
                      <Avatar className="h-16 w-16 ring-4 ring-primary/20">
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback className="text-xl font-bold gradient-primary text-primary-foreground">
                          {testimonial.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-lg text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-4">
                      <RatingStars
                        rating={testimonial.rating}
                        size="md"
                        className="justify-start"
                      />
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-base text-foreground/90 leading-relaxed mb-6">
                      {testimonial.text}
                    </p>

                    {/* Package Badge */}
                    <Badge variant="secondary">{testimonial.location} Trip</Badge>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
