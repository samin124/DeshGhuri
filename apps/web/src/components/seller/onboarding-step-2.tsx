import { useState } from 'react';
import { DocumentUpload } from './document-upload';
import type { SellerCategory } from '@/types/seller';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { uploadDocument } from '@/lib/api/seller';
import { toast } from 'sonner';

interface OnboardingStep2Props {
  data: {
    tradeLicense?: File;
    nidOrPassport?: File;
    tinCertificate?: File;
    propertyDocs?: File;
    tourLicense?: File;
  };
  category?: SellerCategory;
  sellerId: string;
  onUpdate: (data: any) => void;
}

// Map frontend field names to database document types
const documentTypeMap: Record<string, string> = {
  tradeLicense: 'trade-license',
  nidOrPassport: 'nid',
  tinCertificate: 'tin-certificate',
  propertyDocs: 'property-docs',
  tourLicense: 'tour-license',
};

export function OnboardingStep2({ data, category, sellerId, onUpdate }: OnboardingStep2Props) {
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const handleFileChange = async (field: string, file: File | null) => {
    if (!file) {
      onUpdate({ ...data, [field]: null });
      return;
    }

    if (!sellerId) {
      toast.error('Session error. Please refresh the page.');
      return;
    }

    // Set uploading state
    setUploading((prev) => ({ ...prev, [field]: true }));

    try {
      // Convert field name to database document type
      const documentType = documentTypeMap[field] || field;

      // Upload to backend
      const result = await uploadDocument(file, sellerId, documentType);

      if (result.error) {
        // Check if seller not found error
        if (
          result.error.includes('Seller not found') ||
          result.error.includes('SELLER_NOT_FOUND')
        ) {
          toast.error('Session expired. Please restart the onboarding process.');
          localStorage.removeItem('sellerId');
          // Reload page to reinitialize
          setTimeout(() => window.location.reload(), 2000);
        } else {
          toast.error(result.error);
        }
        setUploading((prev) => ({ ...prev, [field]: false }));
        return;
      }

      toast.success(`${file.name} uploaded successfully`);
      onUpdate({ ...data, [field]: file });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
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
          Accepted formats: PDF, JPG, PNG. Maximum file size: 25MB per document.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <DocumentUpload
          label="Trade License"
          description="Valid trade license or business registration certificate"
          value={data.tradeLicense}
          onChange={(file) => handleFileChange('tradeLicense', file)}
          required
        />

        <DocumentUpload
          label="National ID or Passport"
          description="Government-issued ID of the business owner"
          value={data.nidOrPassport}
          onChange={(file) => handleFileChange('nidOrPassport', file)}
          required
        />

        <DocumentUpload
          label="TIN Certificate"
          description="Tax Identification Number certificate (required for revenue over BDT 50K/month)"
          value={data.tinCertificate}
          onChange={(file) => handleFileChange('tinCertificate', file)}
        />

        {showPropertyDocs && (
          <DocumentUpload
            label="Property Documents"
            description="Ownership or lease documents for your hotel/resort property"
            value={data.propertyDocs}
            onChange={(file) => handleFileChange('propertyDocs', file)}
            required
          />
        )}

        {showTourLicense && (
          <DocumentUpload
            label="Tour Operator License"
            description="Valid tour operator license issued by tourism authority"
            value={data.tourLicense}
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
