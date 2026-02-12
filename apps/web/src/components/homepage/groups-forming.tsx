import { Users, Calendar, MapPin } from 'lucide-react';
import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockGroupBookings } from '@/lib/mock-data';

interface GroupsFormingProps {
  onListingClick?: (listingId: string) => void;
}

export default function GroupsForming({ onListingClick: _onListingClick }: GroupsFormingProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Groups Forming Now</h2>
          <p className="text-muted-foreground">Join a group and save up to 40%</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
          {mockGroupBookings.map((group) => (
            <div
              key={group.id}
              className="group overflow-hidden rounded-xl bg-[#f8f7f4] transition-all hover:shadow-lg"
            >
              {/* Image Section */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={group.listing.image}
                  alt={group.destination}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Group Discount Badge */}
                <div className="absolute left-3 top-3">
                  <Badge className="bg-[#e85c4c] hover:bg-[#d94c3c] text-white font-semibold shadow-md rounded-full px-3 py-1 text-sm">
                    40% OFF
                  </Badge>
                </div>

                {/* Members Progress */}
                <div className="absolute left-3 bottom-3">
                  <div className="bg-black/70 text-white text-sm font-medium rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md">
                    <Users className="w-4 h-4" />
                    <span>
                      {group.currentMembers}/{group.maxMembers} joined
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 space-y-2">
                {/* Location */}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{group.destination}</span>
                </div>

                {/* Title/Destination */}
                <h3 className="font-semibold text-base text-foreground leading-snug line-clamp-1">
                  {group.destination} Group Trip
                </h3>

                {/* Travel Date */}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(group.travelDate).toLocaleDateString()}</span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${Math.min((group.currentMembers / group.minMembers) * 100, 100)}%`,
                    }}
                  />
                </div>

                {/* Pricing */}
                <div className="pt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-foreground">
                    ৳{group.pricePerPerson.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">per person</span>
                </div>

                <Button className="w-full mt-3" asChild>
                  <Link to={`/listing/${group.listing.id || group.id}`}>Book Now</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button size="lg" variant="outline" asChild>
            <Link to="/groups/create">Start a New Group</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
