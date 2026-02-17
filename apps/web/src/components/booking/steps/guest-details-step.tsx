import { useEffect, useState } from 'react';
import { useBooking } from '@/contexts/booking-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { User, Mail, Phone, MessageSquare } from 'lucide-react';
import { useCreateBooking } from '@/lib/api/bookings';
import { toast } from 'sonner';
import type { Listing } from '@/types/listing';

interface GuestDetailsStepProps {
  listing: Listing;
  onValidationChange: (isValid: boolean) => void;
  onNext: () => void;
  onClose: () => void;
}

const BANGLADESHI_PHONE_REGEX = /^01[3-9]\d{8}$/;

function normalizeBangladeshiPhone(value: string) {
  const digitsOnly = value.replace(/\D/g, '');
  const normalized = digitsOnly.startsWith('880') ? `0${digitsOnly.slice(3)}` : digitsOnly;
  return normalized.slice(0, 11);
}

function isValidBangladeshiPhone(value: string) {
  return BANGLADESHI_PHONE_REGEX.test(value);
}

export function GuestDetailsStep({ onValidationChange, onNext }: GuestDetailsStepProps) {
  const { formData, updateFormData, setBookingId } = useBooking();
  const createBookingMutation = useCreateBooking();

  const [name, setName] = useState(formData.guestDetails?.primaryGuest.name || '');
  const [email, setEmail] = useState(formData.guestDetails?.primaryGuest.email || '');
  const [phone, setPhone] = useState(
    normalizeBangladeshiPhone(formData.guestDetails?.primaryGuest.phone || '')
  );
  const [specialRequests, setSpecialRequests] = useState(formData.specialRequests || '');

  // Validate form
  useEffect(() => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = isValidBangladeshiPhone(phone);
    const isValid = !!name && isValidEmail && isValidPhone;

    onValidationChange(isValid);
  }, [name, email, phone, onValidationChange]);

  // Update form data
  useEffect(() => {
    updateFormData({
      guestDetails: {
        ...formData.guestDetails!,
        primaryGuest: {
          name,
          email,
          phone,
        },
      },
      specialRequests,
    });
  }, [name, email, phone, specialRequests]);

  // Create booking when moving to next step
  useEffect(() => {
    if (createBookingMutation.isSuccess && createBookingMutation.data) {
      const bookingId = createBookingMutation.data.data.booking.id;
      setBookingId(bookingId);
      toast.success('Booking created! Please proceed with payment.');
      onNext();
    }
  }, [createBookingMutation.isSuccess, createBookingMutation.data, setBookingId, onNext]);

  useEffect(() => {
    if (createBookingMutation.isError) {
      toast.error(createBookingMutation.error?.message || 'Failed to create booking');
    }
  }, [createBookingMutation.isError, createBookingMutation.error]);

  // Intercept the "Continue" button click to create booking
  useEffect(() => {
    const _handleBeforeNext = async () => {
      if (!createBookingMutation.isPending && name && email && phone) {
        // Create booking request
        const _bookingRequest = {
          listingId: formData.listingId,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          serviceDate: formData.serviceDate,
          guestDetails: {
            primaryGuest: { name, email, phone },
            adults: formData.guestDetails!.adults,
            children: formData.guestDetails!.children,
            totalGuests: formData.guestDetails!.totalGuests,
          },
          specialRequests,
          priceLockEnabled: formData.priceLockEnabled,
          promoCode: formData.promoCode,
        };

        // This will be triggered by the wizard's Continue button
        // We'll handle this in the component that wraps this
      }
    };

    // This is just validation; actual submission handled by parent
  }, [name, email, phone, formData, specialRequests, createBookingMutation.isPending]);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <User className="h-4 w-4" />
          Primary Guest Information
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          This information will be used for booking confirmation and communication.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="guestName">Full Name *</Label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="guestName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="guestEmail">Email Address *</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="guestEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Booking confirmation will be sent to this email
            </p>
          </div>

          <div>
            <Label htmlFor="guestPhone">Phone Number *</Label>
            <div className="relative mt-1.5">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="guestPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(normalizeBangladeshiPhone(e.target.value))}
                placeholder="01712345678"
                className="pl-10"
                inputMode="numeric"
                maxLength={11}
                pattern="01[3-9][0-9]{8}"
                required
              />
            </div>
            {phone && !isValidBangladeshiPhone(phone) ? (
              <p className="text-xs text-destructive mt-1">
                Enter a valid 11-digit Bangladeshi number (e.g., 01712345678)
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Use an 11-digit Bangladeshi mobile number
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Special Requests
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Any special requirements or preferences for your stay?
        </p>
        <Textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="E.g., dietary restrictions, accessibility needs, early check-in, etc."
          rows={4}
        />
      </Card>

      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Next Step:</strong> After providing your details, you'll proceed to payment. Your
          booking will be placed on hold for 10 minutes while you complete the payment process.
        </p>
      </Card>
    </div>
  );
}
