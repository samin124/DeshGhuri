import { createFileRoute } from '@tanstack/react-router';
import { ListingFormProvider, useListingForm } from '@/contexts/listing-form-context';
import { Step1BasicInformation } from '@/components/seller/listing-form/step-1-basic';
import { Step2Pricing } from '@/components/seller/listing-form/step-2-pricing';
import { Step3Media } from '@/components/seller/listing-form/step-3-media';
import { Step4Policies } from '@/components/seller/listing-form/step-4-policies';
import { FormNavigation } from '@/components/seller/listing-form/form-navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export const Route = createFileRoute('/seller/dashboard/listings/$listingId/edit')({
  component: () => (
    <ListingFormProvider>
      <EditListingComponent />
    </ListingFormProvider>
  ),
});

function EditListingComponent() {
  const { listingId } = Route.useParams();
  const { state, dispatch } = useListingForm();

  // Fetch existing listing data
  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/seller/listings/${listingId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch listing');
      const result = await res.json();
      return result.data;
    },
  });

  // Populate form with existing data
  useEffect(() => {
    if (listing) {
      dispatch({
        type: 'LOAD_DRAFT',
        payload: {
          id: listing.id,
          title: listing.title,
          description: listing.description,
          category: listing.category,
          location: listing.location,
          basePrice: listing.basePrice,
          priceUnit: listing.priceUnit,
          capacity: listing.capacity,
          minGuests: listing.minGuests,
          maxGuests: listing.maxGuests,
          groupEligible: listing.groupEligible,
          groupPricingTiers: listing.groupPricingTiers || [],
          images: listing.images || [],
          amenities: listing.amenities || [],
          inclusions: listing.inclusions || [],
          exclusions: listing.exclusions || [],
          cancellationPolicy: listing.cancellationPolicy,
          houseRules: listing.houseRules || '',
          checkInTime: listing.checkInTime || '',
          checkOutTime: listing.checkOutTime || '',
          updatedAt: listing.updatedAt,
        },
      });
    }
  }, [listing, dispatch]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="text-lg text-muted-foreground">Loading listing...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Listing</h1>
        <p className="text-muted-foreground">
          Update your listing information. Changes will be saved as you proceed.
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
