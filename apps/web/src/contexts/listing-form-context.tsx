import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
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

interface ListingFormState {
  currentStep: 1 | 2 | 3 | 4;
  formData: Partial<ListingFormData>;
  isDraft: boolean;
  listingId?: string;
  isSubmitting: boolean;
  lastSaved?: Date;
  errors: Record<number, string[]>;
}

type ListingFormAction =
  | { type: 'SET_STEP'; payload: 1 | 2 | 3 | 4 }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<ListingFormData> }
  | { type: 'SET_LISTING_ID'; payload: string }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: Date }
  | { type: 'SET_ERRORS'; payload: { step: number; errors: string[] } }
  | { type: 'RESET' }
  | { type: 'LOAD_DRAFT'; payload: Partial<ListingFormData> & { id: string; updatedAt: string } };

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

const initialState: ListingFormState = {
  currentStep: 1,
  formData: initialFormData,
  isDraft: true,
  listingId: undefined,
  isSubmitting: false,
  lastSaved: undefined,
  errors: {},
};

// Validation function
function validateStep(step: number, formData: Partial<ListingFormData>): string[] {
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
        formData.groupPricingTiers?.forEach((tier, index) => {
          if (tier.minParticipants >= tier.maxParticipants) {
            errors.push(`Tier ${index + 1}: Min participants must be less than max participants`);
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

  return errors;
}

// Reducer
function listingFormReducer(state: ListingFormState, action: ListingFormAction): ListingFormState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

    case 'NEXT_STEP': {
      const errors = validateStep(state.currentStep, state.formData);
      if (errors.length > 0) {
        return {
          ...state,
          errors: { ...state.errors, [state.currentStep]: errors },
        };
      }
      if (state.currentStep < 4) {
        return {
          ...state,
          currentStep: (state.currentStep + 1) as 1 | 2 | 3 | 4,
          errors: { ...state.errors, [state.currentStep]: [] },
        };
      }
      return state;
    }

    case 'PREV_STEP':
      if (state.currentStep > 1) {
        return {
          ...state,
          currentStep: (state.currentStep - 1) as 1 | 2 | 3 | 4,
        };
      }
      return state;

    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
        lastSaved: undefined,
      };

    case 'SET_LISTING_ID':
      return { ...state, listingId: action.payload };

    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };

    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload };

    case 'SET_ERRORS':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.step]: action.payload.errors },
      };

    case 'LOAD_DRAFT':
      return {
        ...state,
        listingId: action.payload.id,
        formData: {
          title: action.payload.title,
          description: action.payload.description,
          category: action.payload.category,
          location: action.payload.location,
          basePrice: action.payload.basePrice,
          priceUnit: action.payload.priceUnit,
          capacity: action.payload.capacity,
          minGuests: action.payload.minGuests,
          maxGuests: action.payload.maxGuests,
          groupEligible: action.payload.groupEligible,
          groupPricingTiers: action.payload.groupPricingTiers || [],
          images: action.payload.images || [],
          amenities: action.payload.amenities || [],
          inclusions: action.payload.inclusions || [],
          exclusions: action.payload.exclusions || [],
          cancellationPolicy: action.payload.cancellationPolicy,
          houseRules: action.payload.houseRules || '',
          checkInTime: action.payload.checkInTime || '',
          checkOutTime: action.payload.checkOutTime || '',
        },
        lastSaved: new Date(action.payload.updatedAt),
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// Context
interface ListingFormContextValue {
  state: ListingFormState;
  dispatch: React.Dispatch<ListingFormAction>;
  setStep: (step: 1 | 2 | 3 | 4) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<ListingFormData>) => void;
  saveDraft: () => Promise<void>;
  submitForReview: () => Promise<void>;
  loadDraft: (listingId: string) => Promise<void>;
  reset: () => void;
  getValidationErrors: (step: number) => string[];
}

const ListingFormContext = createContext<ListingFormContextValue | undefined>(undefined);

// Provider
export function ListingFormProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(listingFormReducer, initialState, (initial) => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('listing-form-storage');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...initial,
            currentStep: parsed.currentStep || initial.currentStep,
            formData: parsed.formData || initial.formData,
            listingId: parsed.listingId,
            lastSaved: parsed.lastSaved ? new Date(parsed.lastSaved) : undefined,
          };
        } catch (e) {
          console.error('Failed to parse saved form data:', e);
        }
      }
    }
    return initial;
  });

  // Save to localStorage on state change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'listing-form-storage',
        JSON.stringify({
          currentStep: state.currentStep,
          formData: state.formData,
          listingId: state.listingId,
          lastSaved: state.lastSaved,
        })
      );
    }
  }, [state.currentStep, state.formData, state.listingId, state.lastSaved]);

  const setStep = useCallback((step: 1 | 2 | 3 | 4) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const updateFormData = useCallback((data: Partial<ListingFormData>) => {
    dispatch({ type: 'UPDATE_FORM_DATA', payload: data });
  }, []);

  const saveDraft = useCallback(async () => {
    dispatch({ type: 'SET_SUBMITTING', payload: true });

    try {
      const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
      const url = state.listingId
        ? `${API_URL}/api/seller/listings/${state.listingId}`
        : `${API_URL}/api/seller/listings`;

      const method = state.listingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...state.formData,
          status: 'draft',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      const _result = await response.json();

      dispatch({ type: 'SET_LISTING_ID', payload: result.data.id });
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
      dispatch({ type: 'SET_SUBMITTING', payload: false });

      console.log('Draft saved successfully');
    } catch (error) {
      console.error('Failed to save draft:', error);
      dispatch({ type: 'SET_SUBMITTING', payload: false });
      throw error;
    }
  }, [state.formData, state.listingId]);

  const submitForReview = useCallback(async () => {
    // Validate all steps
    for (let step = 1; step <= 4; step++) {
      const errors = validateStep(step, state.formData);
      if (errors.length > 0) {
        dispatch({ type: 'SET_ERRORS', payload: { step, errors } });
        throw new Error(`Please complete Step ${step} before submitting`);
      }
    }

    dispatch({ type: 'SET_SUBMITTING', payload: true });

    try {
      const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

      // Save/update the listing with pending-review status
      const url = state.listingId
        ? `${API_URL}/api/seller/listings/${state.listingId}`
        : `${API_URL}/api/seller/listings`;

      const method = state.listingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...state.formData,
          status: 'pending-review', // Submit directly for review
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit for review');
      }

      const _result = await response.json();

      dispatch({ type: 'SET_SUBMITTING', payload: false });
      console.log('Listing submitted for review successfully');

      // Clear localStorage (form will be reset when navigating away)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('listing-form-storage');
      }
    } catch (error) {
      console.error('Failed to submit listing:', error);
      dispatch({ type: 'SET_SUBMITTING', payload: false });
      throw error;
    }
  }, [state.formData, state.listingId]);

  const loadDraft = useCallback(async (listingId: string) => {
    try {
      const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/seller/listings/${listingId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load draft');
      }

      const _result = await response.json();
      const listing = result.data;

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
    } catch (error) {
      console.error('Failed to load draft:', error);
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    // Clear localStorage when resetting
    if (typeof window !== 'undefined') {
      localStorage.removeItem('listing-form-storage');
    }
  }, []);

  const getValidationErrors = useCallback(
    (step: number) => {
      return state.errors[step] || [];
    },
    [state.errors]
  );

  const value: ListingFormContextValue = {
    state,
    dispatch,
    setStep,
    nextStep,
    prevStep,
    updateFormData,
    saveDraft,
    submitForReview,
    loadDraft,
    reset,
    getValidationErrors,
  };

  return <ListingFormContext.Provider value={value}>{children}</ListingFormContext.Provider>;
}

// Hook to use the context
export function useListingForm() {
  const context = useContext(ListingFormContext);
  if (!context) {
    throw new Error('useListingForm must be used within a ListingFormProvider');
  }
  return context;
}
