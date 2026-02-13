import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Building2, FileText, Wallet, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingStep1 } from '@/components/seller/onboarding-step-1';
import { OnboardingStep2New } from '@/components/seller/onboarding-step-2-new';
import { OnboardingStep3 } from '@/components/seller/onboarding-step-3';
import { OnboardingStep4New } from '@/components/seller/onboarding-step-4-new';
import type { SellerCategory } from '@/types/seller';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const searchSchema = z.object({
  category: z.enum(['agency', 'hotel', 'tour-operator']).optional(),
});

export const Route = createFileRoute('/seller/onboarding-new')({
  component: RouteComponent,
  validateSearch: searchSchema,
});

const steps = [
  { id: 1, title: 'Business Information', icon: Building2 },
  { id: 2, title: 'Upload Documents (Optional)', icon: FileText },
  { id: 3, title: 'Payment Methods', icon: Wallet },
  { id: 4, title: 'Review & Submit', icon: CheckCircle },
];

interface OnboardingFormData {
  businessInfo: {
    businessName?: string;
    category?: SellerCategory;
    registrationNumber?: string;
    address?: {
      street: string;
      city: string;
      district: string;
      postalCode?: string;
    };
    contactPhone?: string;
    contactEmail?: string;
    businessDescription?: string;
  };
  documents: any;
  bankAccount?: any;
  paymentMethods?: Array<{
    type: 'bkash' | 'nagad';
    accountNumber: string;
    accountName: string;
  }>;
}

function RouteComponent() {
  const navigate = useNavigate();
  const { category } = Route.useSearch();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  const [formData, setFormData] = useState<OnboardingFormData>({
    businessInfo: {
      category: (category as SellerCategory) || undefined,
    },
    documents: {},
    paymentMethods: [],
  });

  // Check if user came from signup page
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('seller_signup_email');
    const storedPassword = sessionStorage.getItem('seller_signup_password');
    const storedCategory = sessionStorage.getItem('seller_signup_category');

    if (!storedEmail || !storedPassword) {
      toast.error('Please start from the signup page');
      navigate({ to: '/seller/signup' });
      return;
    }

    setEmail(storedEmail);
    setPassword(storedPassword);

    if (storedCategory && !category) {
      setFormData((prev) => ({
        ...prev,
        businessInfo: {
          ...prev.businessInfo,
          category: storedCategory as SellerCategory,
        },
      }));
    }
  }, [navigate, category]);

  const updateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    // Validate Step 2 (Documents) before allowing next
    if (currentStep === 2) {
      const missingDocs = [];

      if (!formData.documents?.tradeLicense) missingDocs.push('Trade License');
      if (!formData.documents?.nidOrPassport) missingDocs.push('National ID or Passport');
      if (!formData.documents?.tinCertificate) missingDocs.push('TIN Certificate');

      if (formData.businessInfo.category === 'hotel' && !formData.documents?.propertyDocs) {
        missingDocs.push('Property Documents');
      }

      if (formData.businessInfo.category === 'tour-operator' && !formData.documents?.tourLicense) {
        missingDocs.push('Tour License');
      }

      if (missingDocs.length > 0) {
        toast.error('Please upload all required documents: ' + missingDocs.join(', '), {
          duration: 6000,
        });
        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error('Session expired. Please start again.');
      navigate({ to: '/seller/signup' });
      return;
    }

    // Validate required business information
    const businessInfo = formData.businessInfo;
    const missingBusinessFields = [];

    if (!businessInfo.businessName?.trim()) missingBusinessFields.push('Business Name');
    if (!businessInfo.category) missingBusinessFields.push('Business Category');
    if (!businessInfo.registrationNumber?.trim()) missingBusinessFields.push('Registration Number');
    if (!businessInfo.address?.street?.trim()) missingBusinessFields.push('Street Address');
    if (!businessInfo.address?.city?.trim()) missingBusinessFields.push('City');
    if (!businessInfo.address?.district?.trim()) missingBusinessFields.push('District');
    if (!businessInfo.contactPhone?.trim()) missingBusinessFields.push('Contact Phone');
    if (!businessInfo.contactEmail?.trim()) missingBusinessFields.push('Contact Email');

    // Validate payment methods
    if (!formData.paymentMethods || formData.paymentMethods.length === 0) {
      missingBusinessFields.push('At least one payment method (Bkash or Nagad)');
    }

    // Validate required documents
    if (!formData.documents?.tradeLicense) missingBusinessFields.push('Trade License');
    if (!formData.documents?.nidOrPassport) missingBusinessFields.push('National ID or Passport');
    if (!formData.documents?.tinCertificate) missingBusinessFields.push('TIN Certificate');

    if (businessInfo.category === 'hotel' && !formData.documents?.propertyDocs) {
      missingBusinessFields.push('Property Documents');
    }

    if (businessInfo.category === 'tour-operator' && !formData.documents?.tourLicense) {
      missingBusinessFields.push('Tour License');
    }

    // If any required fields are missing, show error and return
    if (missingBusinessFields.length > 0) {
      toast.error('Please complete all required fields: ' + missingBusinessFields.join(', '), {
        duration: 8000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the seller signup API
      const requestBody: any = {
        email,
        password,
        businessName: businessInfo.businessName,
        category: businessInfo.category,
        registrationNumber: businessInfo.registrationNumber,
        address: businessInfo.address,
        contactPhone: businessInfo.contactPhone,
        contactEmail: businessInfo.contactEmail,
        businessDescription: businessInfo.businessDescription,
        paymentMethods: formData.paymentMethods,
      };

      // Only add bankAccount if it has values
      if (formData.bankAccount?.bankName && formData.bankAccount?.accountNumber) {
        requestBody.bankAccount = formData.bankAccount;
      }

      const response = await fetch('http://localhost:3000/api/seller/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || 'Failed to create seller account');
        return;
      }

      // Now upload documents
      toast.info('Uploading documents...');

      const sellerId = result.data.sellerId;
      const documentTypeMap: Record<string, string> = {
        tradeLicense: 'trade-license',
        nidOrPassport: 'nid',
        tinCertificate: 'tin-certificate',
        propertyDocs: 'property-docs',
        tourLicense: 'tour-license',
      };

      const uploadPromises: Promise<void>[] = [];

      // Upload each document
      for (const [key, file] of Object.entries(formData.documents)) {
        if (file && file instanceof File) {
          const documentType = documentTypeMap[key] || key;

          const uploadPromise = (async () => {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('sellerId', sellerId);
            uploadFormData.append('documentType', documentType);

            const uploadResponse = await fetch(
              'http://localhost:3000/api/seller/documents/upload',
              {
                method: 'POST',
                credentials: 'include',
                body: uploadFormData,
              }
            );

            if (!uploadResponse.ok) {
              const uploadError = await uploadResponse.json();
              throw new Error(`Failed to upload ${key}: ${uploadError.error || 'Unknown error'}`);
            }
          })();

          uploadPromises.push(uploadPromise);
        }
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      // Clear stored credentials
      sessionStorage.removeItem('seller_signup_email');
      sessionStorage.removeItem('seller_signup_password');
      sessionStorage.removeItem('seller_signup_category');

      toast.success(
        'Seller account created and documents uploaded successfully! Please verify your email and sign in.'
      );

      // Redirect to login
      navigate({ to: '/login' });
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit application. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking session
  if (!email || !password) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Validating session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Seller Onboarding</h1>
          <p className="text-muted-foreground">
            Complete your profile to start selling on DeshGhuri
          </p>
          <p className="text-sm text-primary mt-2">Registering as: {email}</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-colors',
                      currentStep > step.id
                        ? 'bg-primary border-primary text-primary-foreground'
                        : currentStep === step.id
                          ? 'border-primary text-primary bg-primary/10'
                          : 'border-muted-foreground/30 text-muted-foreground bg-background'
                    )}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                    ) : (
                      <step.icon className="w-5 h-5 md:w-6 md:h-6" />
                    )}
                  </div>
                  <div className="mt-2 text-center hidden md:block">
                    <p
                      className={cn(
                        'text-xs md:text-sm font-medium',
                        currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 mx-2 transition-colors',
                      currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/30'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="mb-6">
          <CardContent className="p-6 md:p-8">
            {currentStep === 1 && (
              <OnboardingStep1
                data={formData.businessInfo}
                onUpdate={(data) =>
                  updateFormData({ businessInfo: { ...formData.businessInfo, ...data } })
                }
              />
            )}
            {currentStep === 2 && (
              <OnboardingStep2New
                data={formData.documents}
                category={formData.businessInfo.category}
                onUpdate={(data) =>
                  updateFormData({ documents: { ...formData.documents, ...data } })
                }
              />
            )}
            {currentStep === 3 && (
              <OnboardingStep3
                data={{ ...formData.bankAccount, paymentMethods: formData.paymentMethods }}
                onUpdate={(data) => {
                  const { paymentMethods, ...bankData } = data as any;
                  updateFormData({
                    bankAccount: bankData,
                    paymentMethods: paymentMethods,
                  });
                }}
              />
            )}
            {currentStep === 4 && <OnboardingStep4New data={formData} email={email} />}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </div>
          {currentStep < steps.length ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
