import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ListingCategory, CancellationPolicy, PriceUnit } from '@/lib/constants/categories';
import type { ListingImage, ListingLocation, GroupPricingTier } from '@/types/listing';

// Form data interface
export interface ListingFormData {
  // Step 1: Basic Information
  title: string;
  description: string;
  category: ListingCategory | '';
  location: Partial<ListingLocation>;

  // Step 2: Pricing & Capacity
  basePrice: string;
  priceUnit: PriceUnit;
  capacity: number;
  minGuests: number;
  maxGuests: number;
  groupEligible: boolean;
  groupPricingTiers: GroupPricingTier[];

  // Step 3: Media & Amenities
  images: ListingImage[];
  amenities: string[];
  inclusions: string[];
  exclusions: string[];

  // Step 4: Policies
  cancellationPolicy: CancellationPolicy;
  houseRules: string;
  checkInTime: string;
  checkOutTime: string;
}

interface ListingFormStore {
  // State
  currentStep: 1 | 2 | 3 | 4;
  formData: Partial<ListingFormData>;
  isDraft: boolean;
  listingId?: string;
  isSubmitting: boolean;
  lastSaved?: Date;

  // Actions
  setStep: (step: 1 | 2 | 3 | 4) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<ListingFormData>) => void;
  setListingId: (id: string) => void;
  saveDraft: () => Promise<void>;
  submitForReview: () => Promise<void>;
  reset: () => void;
  loadDraft: (listingId: string) => Promise<void>;

  // Validation
  validateStep: (step: number) => { isValid: boolean; errors: string[] };
}

const initialFormData: Partial<ListingFormData> = {
  title: '',
  description: '',
  category: '',
  location: {
    city: '',
    district: '',
    address: '',
    landmark: '',
  },
  basePrice: '',
  priceUnit: 'per-person',
  capacity: 10,
  minGuests: 1,
  maxGuests: 10,
  groupEligible: false,
  groupPricingTiers: [],
  images: [],
  amenities: [],
  inclusions: [],
  exclusions: [],
  cancellationPolicy: 'flexible',
  houseRules: '',
  checkInTime: '',
  checkOutTime: '',
};

export const useListingFormStore = create<ListingFormStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 1,
      formData: initialFormData,
      isDraft: true,
      listingId: undefined,
      isSubmitting: false,
      lastSaved: undefined,

      // Step navigation
      setStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const { currentStep, validateStep } = get();
        const validation = validateStep(currentStep);

        if (!validation.isValid) {
          console.error('Validation errors:', validation.errors);
          return;
        }

        if (currentStep < 4) {
          set({ currentStep: (currentStep + 1) as 1 | 2 | 3 | 4 });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: (currentStep - 1) as 1 | 2 | 3 | 4 });
        }
      },

      // Update form data
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
          lastSaved: undefined, // Mark as unsaved
        })),

      setListingId: (id) => set({ listingId: id }),

      // Save draft to API
      saveDraft: async () => {
        const { formData, listingId } = get();
        set({ isSubmitting: true });

        try {
          const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
          const url = listingId
            ? `${API_URL}/api/seller/listings/${listingId}`
            : `${API_URL}/api/seller/listings`;

          const method = listingId ? 'PATCH' : 'POST';

          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              ...formData,
              status: 'draft',
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to save draft');
          }

          const result = await response.json();

          set({
            listingId: result.data.id,
            lastSaved: new Date(),
            isSubmitting: false,
          });

          console.log('Draft saved successfully');
        } catch (error) {
          console.error('Failed to save draft:', error);
          set({ isSubmitting: false });
          throw error;
        }
      },

      // Submit for review
      submitForReview: async () => {
        const { formData, listingId, validateStep } = get();

        // Validate all steps
        for (let step = 1; step <= 4; step++) {
          const validation = validateStep(step);
          if (!validation.isValid) {
            console.error(`Step ${step} validation errors:`, validation.errors);
            throw new Error(`Please complete Step ${step} before submitting`);
          }
        }

        set({ isSubmitting: true });

        try {
          const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

          // First save/update the listing
          const url = listingId
            ? `${API_URL}/api/seller/listings/${listingId}`
            : `${API_URL}/api/seller/listings`;

          const method = listingId ? 'PATCH' : 'POST';

          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              ...formData,
              status: 'draft', // Will be changed to pending-review in next call
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to save listing');
          }

          const result = await response.json();
          const savedListingId = result.data.id;

          // Then change status to pending-review
          const statusResponse = await fetch(
            `${API_URL}/api/seller/listings/${savedListingId}/status`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                status: 'pending-review',
              }),
            }
          );

          if (!statusResponse.ok) {
            throw new Error('Failed to submit for review');
          }

          set({
            isSubmitting: false,
            isDraft: false,
          });

          console.log('Listing submitted for review successfully');

          // Reset form after successful submission
          get().reset();
        } catch (error) {
          console.error('Failed to submit listing:', error);
          set({ isSubmitting: false });
          throw error;
        }
      },

      // Reset form
      reset: () =>
        set({
          currentStep: 1,
          formData: initialFormData,
          isDraft: true,
          listingId: undefined,
          isSubmitting: false,
          lastSaved: undefined,
        }),

      // Load existing draft
      loadDraft: async (listingId: string) => {
        try {
          const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
          const response = await fetch(`${API_URL}/api/seller/listings/${listingId}`, {
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to load draft');
          }

          const result = await response.json();
          const listing = result.data;

          set({
            listingId: listing.id,
            formData: {
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
            },
            isDraft: listing.status === 'draft',
            lastSaved: new Date(listing.updatedAt),
          });
        } catch (error) {
          console.error('Failed to load draft:', error);
          throw error;
        }
      },

      // Validation
      validateStep: (step) => {
        const { formData } = get();
        const errors: string[] = [];

        switch (step) {
          case 1: // Basic Information
            if (!formData.title || formData.title.length < 10) {
              errors.push('Title must be at least 10 characters');
            }
            if (!formData.description || formData.description.length < 50) {
              errors.push('Description must be at least 50 characters');
            }
            if (!formData.category) {
              errors.push('Category is required');
            }
            if (!formData.location?.city) {
              errors.push('City is required');
            }
            if (!formData.location?.district) {
              errors.push('District is required');
            }
            if (!formData.location?.address) {
              errors.push('Address is required');
            }
            break;

          case 2: // Pricing & Capacity
            if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
              errors.push('Base price must be greater than 0');
            }
            if (!formData.priceUnit) {
              errors.push('Price unit is required');
            }
            if (!formData.maxGuests || formData.maxGuests < 1) {
              errors.push('Max guests must be at least 1');
            }
            if (formData.groupEligible && formData.groupPricingTiers!.length === 0) {
              errors.push('At least one pricing tier is required for group bookings');
            }
            if (formData.groupEligible) {
              // Validate tiers
              formData.groupPricingTiers?.forEach((tier, index) => {
                if (tier.minParticipants >= tier.maxParticipants) {
                  errors.push(
                    `Tier ${index + 1}: Min participants must be less than max participants`
                  );
                }
                if (tier.discountPercentage <= 0 || tier.discountPercentage >= 100) {
                  errors.push(`Tier ${index + 1}: Discount must be between 0% and 100%`);
                }
              });
            }
            break;

          case 3: // Media & Amenities
            if (!formData.images || formData.images.length < 3) {
              errors.push('At least 3 images are required');
            }
            if (formData.images && formData.images.length > 20) {
              errors.push('Maximum 20 images allowed');
            }
            break;

          case 4: // Policies
            if (!formData.cancellationPolicy) {
              errors.push('Cancellation policy is required');
            }
            break;

          default:
            break;
        }

        return {
          isValid: errors.length === 0,
          errors,
        };
      },
    }),
    {
      name: 'listing-form-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        formData: state.formData,
        listingId: state.listingId,
        lastSaved: state.lastSaved,
      }),
    }
  )
);
