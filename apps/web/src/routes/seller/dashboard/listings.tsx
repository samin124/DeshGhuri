import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Package } from 'lucide-react';

export const Route = createFileRoute('/seller/dashboard/listings')({
  component: ListingsPlaceholder,
});

function ListingsPlaceholder() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Listings</h1>
        <p className="text-muted-foreground">
          Manage your property and tour listings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            Listing Management
          </CardTitle>
          <CardDescription>
            Create and manage your listings for hotels, tours, and experiences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Coming Soon in Epic 12</AlertTitle>
            <AlertDescription>
              The listing management feature is currently under development and will be available in Epic 12 (Listing Management).
              <br /><br />
              This feature will include:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Create and edit listings for hotels, tours, and experiences</li>
                <li>Upload photos and set pricing</li>
                <li>Manage availability and booking rules</li>
                <li>Set seasonal pricing and special offers</li>
                <li>Track listing performance and views</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
