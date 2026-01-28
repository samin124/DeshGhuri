import { Users, Calendar, TrendingDown } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockGroupBookings } from "@/lib/mock-data";

export default function GroupsForming() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Groups Forming Now</h2>
          <p className="text-muted-foreground">Join a group and save up to 40%</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {mockGroupBookings.map((group) => (
            <Card key={group.id} className="overflow-hidden">
              <img
                src={group.listing.image}
                alt={group.destination}
                className="h-48 w-full object-cover"
                loading="lazy"
              />
              <CardContent className="p-4">
                <h3 className="mb-2 font-semibold">{group.destination}</h3>

                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(group.travelDate).toLocaleDateString()}</span>
                </div>

                <div className="mb-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {group.currentMembers}/{group.maxMembers} members
                    </span>
                    <Badge variant="secondary">Tier {group.currentTier}</Badge>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(group.currentMembers / group.minMembers) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">
                    ৳{group.pricePerPerson.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">per person</span>
                  <TrendingDown className="h-4 w-4 text-green-500" />
                </div>

                <Button className="w-full" asChild>
                  <Link to={`/groups/${group.id}`}>Join Group</Link>
                </Button>
              </CardContent>
            </Card>
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
