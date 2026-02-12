import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, FileCheck } from 'lucide-react';

export const Route = createFileRoute('/seller/dashboard/proof-center')({
  component: ProofCenterPlaceholder,
});

function ProofCenterPlaceholder() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Proof Center</h1>
        <p className="text-muted-foreground">Submit service completion proof</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-6 w-6" />
            Service Proof Submission
          </CardTitle>
          <CardDescription>
            Upload photos and documents to verify service completion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Coming Soon in Epic 12</AlertTitle>
            <AlertDescription>
              The proof center feature is currently under development and will be available in Epic
              12 (Listing Management).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
