import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/common/rating-stars";
import { mockTestimonials } from "@/lib/mock-data";

export default function TestimonialsSection() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">What Our Customers Say</h2>
          <p className="text-muted-foreground">Real experiences from real travelers</p>
        </div>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {mockTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="min-w-0 flex-[0_0_100%] px-4 md:flex-[0_0_33.33%]">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                      </div>
                    </div>
                    <RatingStars rating={testimonial.rating} size="sm" className="mb-3" />
                    <p className="text-sm text-muted-foreground">{testimonial.text}</p>
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
