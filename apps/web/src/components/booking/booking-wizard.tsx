import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/contexts/booking-context';
import { DateGuestStep } from './steps/date-guest-step';
import { GuestDetailsStep } from './steps/guest-details-step';
import { PaymentStep } from './steps/payment-step';
import { ConfirmationStep } from './steps/confirmation-step';
import { ChevronLeft } from 'lucide-react';
import { useCreateBooking, useSubmitPayment } from '@/lib/api/bookings';
import { toast } from 'sonner';
import type { Listing } from '@/types/listing';

interface BookingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing;
}

const STEPS = [
  { id: 1, title: 'Date & Guests', component: DateGuestStep },
  { id: 2, title: 'Guest Details', component: GuestDetailsStep },
  { id: 3, title: 'Payment', component: PaymentStep },
  { id: 4, title: 'Confirmation', component: ConfirmationStep },
];

export function BookingWizard({ open, onOpenChange, listing }: BookingWizardProps) {
  const {
    currentStep,
    setCurrentStep,
    resetBooking,
    updateFormData,
    formData,
    bookingId,
    setBookingId,
  } = useBooking();
  const [canProceed, setCanProceed] = useState(false);
  const createBookingMutation = useCreateBooking();
  const submitPaymentMutation = useSubmitPayment();

  useEffect(() => {
    if (open && listing) {
      updateFormData({ listingId: listing.id });
    }
  }, [open, listing, updateFormData]);

  useEffect(() => {
    if (!open) {
      // Reset booking when wizard closes, unless we're on confirmation step
      if (currentStep !== 4) {
        setTimeout(() => resetBooking(), 300);
      }
    }
  }, [open, currentStep, resetBooking]);

  // Handle booking creation success (step 2 -> 3)
  useEffect(() => {
    if (createBookingMutation.isSuccess && createBookingMutation.data) {
      const newBookingId = createBookingMutation.data.data.booking.id;
      setBookingId(newBookingId);
      toast.success('Booking created! Please proceed with payment.');
      setCurrentStep(3);
      setCanProceed(false);
    }
  }, [createBookingMutation.isSuccess, createBookingMutation.data, setBookingId, setCurrentStep]);

  // Handle booking creation error
  useEffect(() => {
    if (createBookingMutation.isError) {
      toast.error(createBookingMutation.error?.message || 'Failed to create booking');
    }
  }, [createBookingMutation.isError, createBookingMutation.error]);

  // Handle payment submission success (step 3 -> 4)
  useEffect(() => {
    if (submitPaymentMutation.isSuccess) {
      toast.success('Payment submitted for seller approval!');
      setCurrentStep(4);
      setCanProceed(false);
    }
  }, [submitPaymentMutation.isSuccess, setCurrentStep]);

  // Handle payment submission error
  useEffect(() => {
    if (submitPaymentMutation.isError) {
      toast.error(submitPaymentMutation.error?.message || 'Failed to submit payment');
    }
  }, [submitPaymentMutation.isError, submitPaymentMutation.error]);

  const handleNext = async () => {
    // Step 2 -> 3: Create booking
    if (currentStep === 2 && !createBookingMutation.isPending) {
      const bookingRequest = {
        listingId: formData.listingId,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        serviceDate: formData.serviceDate,
        guestDetails: formData.guestDetails!,
        specialRequests: formData.specialRequests,
        priceLockEnabled: formData.priceLockEnabled,
        promoCode: formData.promoCode,
      };

      createBookingMutation.mutate(bookingRequest);
      return;
    }

    // Step 3 -> 4: Submit payment
    if (currentStep === 3 && bookingId && !submitPaymentMutation.isPending) {
      const paymentRequest = {
        bookingId,
        paymentMethod: formData.paymentMethod!,
        transactionId: formData.transactionId!,
        paymentDetails: formData.paymentDetails,
      };

      submitPaymentMutation.mutate(paymentRequest);
      return;
    }

    // Other steps: just move forward
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      setCanProceed(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep !== 4) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const CurrentStepComponent = STEPS[currentStep - 1]?.component;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {currentStep > 1 && currentStep !== 4 && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <span>Book {listing?.title}</span>
          </SheetTitle>
          <SheetDescription>
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.title}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {CurrentStepComponent && (
            <CurrentStepComponent
              listing={listing}
              onValidationChange={setCanProceed}
              onNext={handleNext}
              onClose={handleClose}
            />
          )}
        </div>

        {currentStep < 4 && (
          <div className="mt-6 flex justify-end gap-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={createBookingMutation.isPending || submitPaymentMutation.isPending}
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={
                !canProceed || createBookingMutation.isPending || submitPaymentMutation.isPending
              }
            >
              {currentStep === 2 && createBookingMutation.isPending
                ? 'Creating Booking...'
                : currentStep === 3 && submitPaymentMutation.isPending
                  ? 'Submitting...'
                  : currentStep === 3
                    ? 'Submit Payment'
                    : 'Continue'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
