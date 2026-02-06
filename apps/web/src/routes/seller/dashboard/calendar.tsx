import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Calendar as CalendarIcon } from 'lucide-react';

export const Route = createFileRoute('/seller/dashboard/calendar')({
  component: CalendarPlaceholder,
});

function CalendarPlaceholder() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">
          Manage your listing availability
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            Availability Management
          </CardTitle>
          <CardDescription>
            Set and manage availability for your listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Coming Soon in Epic 12</AlertTitle>
            <AlertDescription>
              The calendar and availability management feature is currently under development and will be available in Epic 12 (Listing Management).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
