import { useEffect, useState } from 'react';
import { useBooking } from '@/contexts/booking-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Users, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Listing } from '@/types/listing';

interface DateGuestStepProps {
  listing: Listing;
  onValidationChange: (isValid: boolean) => void;
  onNext: () => void;
  onClose: () => void;
}

export function DateGuestStep({ listing, onValidationChange }: DateGuestStepProps) {
  const { formData, updateFormData, setPriceBreakdown } = useBooking();

  const [checkInDate, setCheckInDate] = useState(formData.checkInDate || '');
  const [checkOutDate, setCheckOutDate] = useState(formData.checkOutDate || '');
  const [serviceDate, setServiceDate] = useState(formData.serviceDate || '');
  const [adults, setAdults] = useState(formData.guestDetails?.adults || 1);
  const [children, setChildren] = useState(formData.guestDetails?.children || 0);
  const [promoCode, setPromoCode] = useState(formData.promoCode || '');
  const [promoApplied, setPromoApplied] = useState(false);

  const category = listing?.category;
  const needsDates = ['hotel', 'resort', 'homestay'].includes(category);
  const needsServiceDate = ['tour-package', 'experience', 'activity'].includes(category);

  const basePrice = parseFloat(listing?.basePrice || '0');
  const totalGuests = adults + children;
  const minGuests = listing?.minGuests || 1;
  const maxGuests = listing?.maxGuests || 100;

  // Calculate pricing
  const calculatePrice = () => {
    const base = basePrice * totalGuests;
    const discount = 0; // Promo discount would be applied here
    const tax = base * 0.05; // 5% tax
    const platformFee = base * 0.03; // 3% platform fee
    const total = base - discount + tax + platformFee;

    return {
      baseAmount: base.toFixed(2),
      discountAmount: discount.toFixed(2),
      taxAmount: tax.toFixed(2),
      platformFee: platformFee.toFixed(2),
      totalAmount: total.toFixed(2),
    };
  };

  const priceBreakdown = calculatePrice();

  // Validate form
  useEffect(() => {
    let isValid = totalGuests >= minGuests && totalGuests <= maxGuests;

    if (needsDates) {
      isValid = isValid && !!checkInDate && !!checkOutDate;
      isValid = isValid && new Date(checkOutDate) > new Date(checkInDate);
    }

    if (needsServiceDate) {
      isValid = isValid && !!serviceDate;
    }

    onValidationChange(isValid);
  }, [
    checkInDate,
    checkOutDate,
    serviceDate,
    totalGuests,
    minGuests,
    maxGuests,
    needsDates,
    needsServiceDate,
    onValidationChange,
  ]);

  // Update form data and price breakdown
  useEffect(() => {
    updateFormData({
      checkInDate: needsDates ? checkInDate : undefined,
      checkOutDate: needsDates ? checkOutDate : undefined,
      serviceDate: needsServiceDate ? serviceDate : undefined,
      guestDetails: {
        primaryGuest: formData.guestDetails?.primaryGuest || {
          name: '',
          email: '',
          phone: '',
        },
        adults,
        children,
        totalGuests,
      },
      promoCode: promoApplied ? promoCode : undefined,
    });
    setPriceBreakdown(priceBreakdown);
  }, [
    checkInDate,
    checkOutDate,
    serviceDate,
    adults,
    children,
    totalGuests,
    promoCode,
    promoApplied,
    needsDates,
    needsServiceDate,
  ]);

  const handleApplyPromo = () => {
    // In a real implementation, this would validate the promo code with the API
    // For now, we'll just mark it as applied
    if (promoCode) {
      setPromoApplied(true);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      {needsDates && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Select Dates
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkIn">Check-in</Label>
              <Input
                id="checkIn"
                type="date"
                min={today}
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="checkOut">Check-out</Label>
              <Input
                id="checkOut"
                type="date"
                min={checkInDate || today}
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
        </Card>
      )}

      {needsServiceDate && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Service Date
          </h3>
          <div>
            <Label htmlFor="serviceDate">Select Date</Label>
            <Input
              id="serviceDate"
              type="date"
              min={today}
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </Card>
      )}

      {/* Guest Selection */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Number of Guests
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Adults</p>
              <p className="text-sm text-muted-foreground">Age 13+</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAdults(Math.max(1, adults - 1))}
                disabled={adults <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{adults}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAdults(adults + 1)}
                disabled={totalGuests >= maxGuests}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Children</p>
              <p className="text-sm text-muted-foreground">Age 0-12</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setChildren(Math.max(0, children - 1))}
                disabled={children <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{children}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setChildren(children + 1)}
                disabled={totalGuests >= maxGuests}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {totalGuests < minGuests && (
            <p className="text-sm text-destructive">
              Minimum guests is {minGuests}
            </p>
          )}

          {totalGuests > maxGuests && (
            <p className="text-sm text-destructive">
              Maximum capacity is {maxGuests} guests
            </p>
          )}
        </div>
      </Card>

      {/* Promo Code */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Promo Code</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value);
              setPromoApplied(false);
            }}
            disabled={promoApplied}
          />
          <Button
            variant="outline"
            onClick={handleApplyPromo}
            disabled={!promoCode || promoApplied}
          >
            {promoApplied ? 'Applied' : 'Apply'}
          </Button>
        </div>
        {promoApplied && (
          <p className="text-sm text-green-600 mt-2">Promo code applied successfully!</p>
        )}
      </Card>

      {/* Price Breakdown */}
      <Card className="p-4 bg-muted/50">
        <h3 className="font-semibold mb-4">Price Breakdown</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              ৳{basePrice.toLocaleString()} × {totalGuests}{' '}
              {listing?.priceUnit === 'per-night' ? 'nights' : 'guests'}
            </span>
            <span>৳{parseFloat(priceBreakdown.baseAmount).toLocaleString()}</span>
          </div>

          {parseFloat(priceBreakdown.discountAmount) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-৳{parseFloat(priceBreakdown.discountAmount).toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (5%)</span>
            <span>৳{parseFloat(priceBreakdown.taxAmount).toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform fee (3%)</span>
            <span>৳{parseFloat(priceBreakdown.platformFee).toLocaleString()}</span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>৳{parseFloat(priceBreakdown.totalAmount).toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
