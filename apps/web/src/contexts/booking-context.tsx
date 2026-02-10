import { createContext, useContext, useState, ReactNode } from 'react';

export interface GuestDetails {
  primaryGuest: {
    name: string;
    email: string;
    phone: string;
  };
  adults: number;
  children: number;
  totalGuests: number;
}

export interface BookingFormData {
  listingId: string;
  checkInDate?: string;
  checkOutDate?: string;
  serviceDate?: string;
  guestDetails?: GuestDetails;
  specialRequests?: string;
  priceLockEnabled: boolean;
  promoCode?: string;
  paymentMethod?: 'bkash' | 'nagad' | 'card' | 'bank-transfer';
  transactionId?: string;
  paymentDetails?: {
    accountNumber?: string;
    accountHolderName?: string;
    transactionDate?: string;
    notes?: string;
  };
}

export interface PriceBreakdown {
  baseAmount: string;
  discountAmount: string;
  taxAmount: string;
  platformFee: string;
  totalAmount: string;
}

interface BookingContextValue {
  formData: BookingFormData;
  priceBreakdown: PriceBreakdown | null;
  currentStep: number;
  bookingId: string | null;
  updateFormData: (data: Partial<BookingFormData>) => void;
  setPriceBreakdown: (breakdown: PriceBreakdown) => void;
  setCurrentStep: (step: number) => void;
  setBookingId: (id: string) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

const initialFormData: BookingFormData = {
  listingId: '',
  priceLockEnabled: false,
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const updateFormData = (data: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetBooking = () => {
    setFormData(initialFormData);
    setPriceBreakdown(null);
    setCurrentStep(1);
    setBookingId(null);
  };

  return (
    <BookingContext.Provider
      value={{
        formData,
        priceBreakdown,
        currentStep,
        bookingId,
        updateFormData,
        setPriceBreakdown,
        setCurrentStep,
        setBookingId,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
