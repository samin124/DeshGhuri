import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Building2, FileText, Wallet, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingStep1 } from '@/components/seller/onboarding-step-1';
import { OnboardingStep2 } from '@/components/seller/onboarding-step-2';
import { OnboardingStep3 } from '@/components/seller/onboarding-step-3';
import { OnboardingStep4 } from '@/components/seller/onboarding-step-4';
import type { OnboardingFormData, SellerCategory } from '@/types/seller';
import { cn } from '@/lib/utils';
import { registerSeller, completeOnboarding, getSellerByUserId } from '@/lib/api/seller';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

const searchSchema = z.object({
  category: z.enum(['agency', 'hotel', 'tour-operator']).optional(),
});

export const Route = createFileRoute('/seller/onboarding')({
  component: RouteComponent,
  validateSearch: searchSchema,
});

const steps = [
  { id: 1, title: 'Business Information', icon: Building2 },
  { id: 2, title: 'Upload Documents', icon: FileText },
  { id: 3, title: 'Bank Account', icon: Wallet },
  { id: 4, title: 'Review & Submit', icon: CheckCircle },
];

function RouteComponent() {
  const navigate = useNavigate();
  const { category } = Route.useSearch();
  const { data: session, isPending } = authClient.useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>({
    step: 1,
    businessInfo: {
      category: (category as SellerCategory) || undefined,
    },
    documents: {},
    bankAccount: {},
  });

  // Get user session and create seller record
  useEffect(() => {
    const initSeller = async () => {
      // Wait for session to load
      if (isPending) return;

      if (!session?.user) {
        toast.error('Please log in to continue');
        navigate({ to: '/login' });
        return;
      }

      setUserId(session.user.id);

      // Check if seller exists in database for this user
      const existingSellerResult = await getSellerByUserId(session.user.id);

      if (existingSellerResult.data?.seller) {
        // Seller exists in database, use it
        const dbSellerId = existingSellerResult.data.seller.id;
        setSellerId(dbSellerId);
        localStorage.setItem('sellerId', dbSellerId);
        console.log('✅ Using existing seller:', dbSellerId);
      } else {
        // No seller in database, create new one
        console.log('📝 Creating new seller for user:', session.user.id);
        const result = await registerSeller(session.user.id);

        if (result.error) {
          console.error('❌ Failed to register seller:', result.error);
          toast.error(result.error);
          // Clear any stale sellerId
          localStorage.removeItem('sellerId');

          // If admin user tried to register as seller, redirect to dashboard
          if (result.error.includes('Admin users cannot register')) {
            setTimeout(() => {
              navigate({ to: '/dashboard' });
            }, 3000);
          }
          return;
        }

        if (result.data) {
          console.log('✅ Seller created:', result.data.sellerId);
          setSellerId(result.data.sellerId);
          localStorage.setItem('sellerId', result.data.sellerId);
        }
      }
    };

    initSeller();
  }, [session, isPending, navigate]);

  const updateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
      updateFormData({ step: currentStep + 1 });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      updateFormData({ step: currentStep - 1 });
    }
  };

  const handleSubmit = async () => {
    if (!sellerId || !userId) {
      toast.error('Session error. Please refresh the page.');
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

    // Validate required bank account information
    const bankAccount = formData.bankAccount;
    const missingBankFields = [];

    if (!bankAccount.bankName?.trim()) missingBankFields.push('Bank Name');
    if (!bankAccount.branchName?.trim()) missingBankFields.push('Branch Name');
    if (!bankAccount.accountHolderName?.trim()) missingBankFields.push('Account Holder Name');
    if (!bankAccount.accountNumber?.trim()) missingBankFields.push('Account Number');
    if (!bankAccount.accountType) missingBankFields.push('Account Type');

    // If any required fields are missing, show error and return
    if (missingBusinessFields.length > 0 || missingBankFields.length > 0) {
      const errorMessage = [
        missingBusinessFields.length > 0 && `Business Info: ${missingBusinessFields.join(', ')}`,
        missingBankFields.length > 0 && `Bank Account: ${missingBankFields.join(', ')}`,
      ]
        .filter(Boolean)
        .join('\n');

      toast.error('Please complete all required fields:\n' + errorMessage, {
        duration: 8000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await completeOnboarding({
        sellerId,
        userId,
        businessInfo: formData.businessInfo,
        bankAccount: formData.bankAccount,
      });

      if (result.error) {
        toast.error(result.error);
        if (result.details) {
          console.error('Validation errors:', result.details);
        }
        return;
      }

      toast.success('Application submitted successfully!');
      localStorage.removeItem('sellerId');
      navigate({ to: '/seller/verification-status', search: { sellerId } });
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while initializing
  if (isPending || !sellerId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading your seller profile...</p>
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
              <OnboardingStep2
                data={formData.documents}
                category={formData.businessInfo.category}
                sellerId={sellerId || ''}
                onUpdate={(data) =>
                  updateFormData({ documents: { ...formData.documents, ...data } })
                }
              />
            )}
            {currentStep === 3 && (
              <OnboardingStep3
                data={formData.bankAccount}
                onUpdate={(data) =>
                  updateFormData({ bankAccount: { ...formData.bankAccount, ...data } })
                }
              />
            )}
            {currentStep === 4 && <OnboardingStep4 data={formData} />}
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
            <Button type="button" onClick={handleSubmit} disabled={isLoading || !sellerId}>
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
