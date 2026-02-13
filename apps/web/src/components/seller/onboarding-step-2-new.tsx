import { DocumentUpload } from './document-upload';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface OnboardingStep2NewProps {
  data: {
    tradeLicense?: File;
    nidOrPassport?: File;
    tinCertificate?: File;
    propertyDocs?: File;
    tourLicense?: File;
  };
  category?: string;
  onUpdate: (data: any) => void;
}

export function OnboardingStep2New({ data, category, onUpdate }: OnboardingStep2NewProps) {
  const handleFileChange = (field: string, file: File | null) => {
    onUpdate({ ...data, [field]: file });
  };

  const showPropertyDocs = category === 'hotel';
  const showTourLicense = category === 'tour-operator';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Upload Documents</h2>
        <p className="text-sm text-muted-foreground">
          Upload the required documents for verification. All files must be clear and readable.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Accepted formats: PDF, JPG, PNG. Maximum file size: 25MB per document. All required
          documents must be uploaded to complete registration.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <DocumentUpload
          label="Trade License"
          description="Valid trade license or business registration certificate"
          value={data.tradeLicense || null}
          onChange={(file) => handleFileChange('tradeLicense', file)}
          required
        />

        <DocumentUpload
          label="National ID or Passport"
          description="Government-issued ID of the business owner"
          value={data.nidOrPassport || null}
          onChange={(file) => handleFileChange('nidOrPassport', file)}
          required
        />

        <DocumentUpload
          label="TIN Certificate"
          description="Tax Identification Number certificate"
          value={data.tinCertificate || null}
          onChange={(file) => handleFileChange('tinCertificate', file)}
          required
        />

        {showPropertyDocs && (
          <DocumentUpload
            label="Property Documents"
            description="Ownership or lease documents for your hotel/resort property"
            value={data.propertyDocs || null}
            onChange={(file) => handleFileChange('propertyDocs', file)}
            required
          />
        )}

        {showTourLicense && (
          <DocumentUpload
            label="Tour Operator License"
            description="Valid tour operator license issued by tourism authority"
            value={data.tourLicense || null}
            onChange={(file) => handleFileChange('tourLicense', file)}
            required
          />
        )}
      </div>

      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          All documents will be reviewed by our verification team within 24-48 hours. You'll receive
          an email notification once the review is complete.
        </AlertDescription>
      </Alert>
    </div>
  );
}
