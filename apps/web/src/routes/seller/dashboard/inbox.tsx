import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Mail } from 'lucide-react';

export const Route = createFileRoute('/seller/dashboard/inbox')({
  component: InboxPlaceholder,
});

function InboxPlaceholder() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Inbox</h1>
        <p className="text-muted-foreground">Messages and inquiries from customers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Customer Messages
          </CardTitle>
          <CardDescription>Communicate with customers about bookings and inquiries</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Coming Soon in Epic 12</AlertTitle>
            <AlertDescription>
              The messaging and inbox feature is currently under development and will be available
              in Epic 12 (Listing Management).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
