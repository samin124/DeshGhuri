import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { ListingFormProvider, useListingForm } from '@/contexts/listing-form-context';
import { Step1BasicInformation } from '@/components/seller/listing-form/step-1-basic';
import { Step2Pricing } from '@/components/seller/listing-form/step-2-pricing';
import { Step3Media } from '@/components/seller/listing-form/step-3-media';
import { Step4Policies } from '@/components/seller/listing-form/step-4-policies';
import { FormNavigation } from '@/components/seller/listing-form/form-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/seller/dashboard/listings/new')({
  component: () => (
    <ListingFormProvider>
      <NewListingComponent />
    </ListingFormProvider>
  ),
});

function NewListingComponent() {
  const { state, reset } = useListingForm();

  // Reset form when creating a new listing
  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Listing</h1>
        <p className="text-muted-foreground">
          Fill out the form below to create a new listing. You can save your progress and continue later.
        </p>
      </div>

      {/* Form Navigation */}
      <FormNavigation />

      {/* Form Content */}
      <div className="mt-8">
        {state.currentStep === 1 && <Step1BasicInformation />}
        {state.currentStep === 2 && <Step2Pricing />}
        {state.currentStep === 3 && <Step3Media />}
        {state.currentStep === 4 && <Step4Policies />}
      </div>

      {/* Form Navigation - Bottom */}
      <div className="mt-8">
        <FormNavigation />
      </div>
    </div>
  );
}
