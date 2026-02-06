import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Info } from 'lucide-react';

interface OnboardingStep2NewProps {
  data: any;
  category?: string;
  onUpdate: (data: any) => void;
}

export function OnboardingStep2New({ data, category, onUpdate }: OnboardingStep2NewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Upload Documents</h2>
        <p className="text-sm text-muted-foreground">
          Document verification can be completed later from your seller dashboard
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Required Documents (can be uploaded later):</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Trade License - Valid business registration</li>
              <li>NID/Passport - Government-issued ID of owner</li>
              <li>TIN Certificate - Tax identification number</li>
              {category === 'hotel' && <li>Property Documents - Hotel/resort ownership proof</li>}
              {category === 'tour-operator' && <li>Tour License - Tourism operator license</li>}
            </ul>
            <p className="mt-2 font-medium">
              You can complete your application now and upload documents from your dashboard once approved.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <div className="p-6 border-2 border-dashed rounded-lg text-center">
        <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <h3 className="font-medium mb-1">Document Upload Optional</h3>
        <p className="text-sm text-muted-foreground">
          Skip this step and upload your documents after your account is created
        </p>
      </div>
    </div>
  );
}
