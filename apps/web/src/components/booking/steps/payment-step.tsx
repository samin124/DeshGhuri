import { useEffect, useState } from 'react';
import { useBooking } from '@/contexts/booking-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { CreditCard, Smartphone, AlertCircle, CheckCircle2, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useSubmitPayment, useCreateBooking } from '@/lib/api/bookings';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import type { Listing } from '@/types/listing';

interface PaymentStepProps {
  listing: Listing;
  onValidationChange: (isValid: boolean) => void;
  onNext: () => void;
  onClose: () => void;
}

// Seller's payment numbers (would come from listing or seller data)
const PAYMENT_NUMBERS = {
  bkash: '01712-345678',
  nagad: '01812-345678',
};

export function PaymentStep({ listing: _listing, onValidationChange, onNext }: PaymentStepProps) {
  const { formData, updateFormData, priceBreakdown, bookingId, setBookingId } = useBooking();
  const submitPaymentMutation = useSubmitPayment();
  const createBookingMutation = useCreateBooking();

  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'card' | 'bank-transfer'>(
    formData.paymentMethod || 'bkash'
  );
  const [transactionId, setTransactionId] = useState(formData.transactionId || '');
  const [accountNumber, setAccountNumber] = useState(formData.paymentDetails?.accountNumber || '');
  const [accountHolderName, setAccountHolderName] = useState(
    formData.paymentDetails?.accountHolderName || ''
  );
  const [transactionDate, setTransactionDate] = useState(
    formData.paymentDetails?.transactionDate || ''
  );
  const [notes, setNotes] = useState(formData.paymentDetails?.notes || '');
  const [bookingCreated, setBookingCreated] = useState(!!bookingId);

  const isMobilePayment = paymentMethod === 'bkash' || paymentMethod === 'nagad';
  const totalAmount = priceBreakdown?.totalAmount || '0';

  // Step 1: Create booking if not already created
  useEffect(() => {
    if (!bookingCreated && !createBookingMutation.isPending && !bookingId) {
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
    }
  }, [bookingCreated, bookingId, formData, createBookingMutation]);

  // Handle booking creation success
  useEffect(() => {
    if (createBookingMutation.isSuccess && createBookingMutation.data) {
      const newBookingId = createBookingMutation.data.data.booking.id;
      setBookingId(newBookingId);
      setBookingCreated(true);
      toast.success('Booking created! Please complete payment.');
    }
  }, [createBookingMutation.isSuccess, createBookingMutation.data, setBookingId]);

  // Handle booking creation error
  useEffect(() => {
    if (createBookingMutation.isError) {
      toast.error(createBookingMutation.error?.message || 'Failed to create booking');
    }
  }, [createBookingMutation.isError, createBookingMutation.error]);

  // Validate form
  useEffect(() => {
    let isValid = !!paymentMethod && !!transactionId && bookingCreated;

    if (isMobilePayment) {
      isValid = isValid && !!accountNumber;
    }

    onValidationChange(isValid);
  }, [
    paymentMethod,
    transactionId,
    accountNumber,
    isMobilePayment,
    bookingCreated,
    onValidationChange,
  ]);

  // Update form data
  useEffect(() => {
    updateFormData({
      paymentMethod,
      transactionId,
      paymentDetails: {
        accountNumber,
        accountHolderName,
        transactionDate,
        notes,
      },
    });
  }, [
    paymentMethod,
    transactionId,
    accountNumber,
    accountHolderName,
    transactionDate,
    notes,
    updateFormData,
  ]);

  // Handle payment submission success
  useEffect(() => {
    if (submitPaymentMutation.isSuccess) {
      toast.success('Payment submitted for seller approval!');
      onNext();
    }
  }, [submitPaymentMutation.isSuccess, onNext]);

  // Handle payment submission error
  useEffect(() => {
    if (submitPaymentMutation.isError) {
      toast.error(submitPaymentMutation.error?.message || 'Failed to submit payment');
    }
  }, [submitPaymentMutation.isError, submitPaymentMutation.error]);

  const today = new Date().toISOString().split('T')[0];

  if (createBookingMutation.isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Creating your booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Select Payment Method
        </h3>

        <div className="space-y-3">
          <button
            onClick={() => setPaymentMethod('bkash')}
            className={cn(
              'w-full flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors text-left',
              paymentMethod === 'bkash' && 'border-primary bg-primary/5'
            )}
          >
            <div
              className={cn(
                'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                paymentMethod === 'bkash' ? 'border-primary bg-primary' : 'border-muted-foreground'
              )}
            >
              {paymentMethod === 'bkash' && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
            <Smartphone className="h-5 w-5 text-pink-600" />
            <div className="flex-1">
              <p className="font-medium">bKash</p>
              <p className="text-sm text-muted-foreground">Mobile payment</p>
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('nagad')}
            className={cn(
              'w-full flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors text-left',
              paymentMethod === 'nagad' && 'border-primary bg-primary/5'
            )}
          >
            <div
              className={cn(
                'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                paymentMethod === 'nagad' ? 'border-primary bg-primary' : 'border-muted-foreground'
              )}
            >
              {paymentMethod === 'nagad' && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
            <Smartphone className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <p className="font-medium">Nagad</p>
              <p className="text-sm text-muted-foreground">Mobile payment</p>
            </div>
          </button>
        </div>
      </Card>

      {/* Payment Instructions */}
      {isMobilePayment && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Payment Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Open your {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} app</li>
              <li>
                Send ৳{parseFloat(totalAmount).toLocaleString()} to:{' '}
                <strong>{PAYMENT_NUMBERS[paymentMethod]}</strong>
              </li>
              <li>Copy the transaction ID from your payment confirmation</li>
              <li>Fill in the transaction details below</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      {/* Amount Summary */}
      <Card className="p-4 bg-muted/50">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Amount to Pay</span>
          <span className="text-2xl font-bold text-primary">
            ৳{parseFloat(totalAmount).toLocaleString()}
          </span>
        </div>
      </Card>

      {/* Transaction Details Form */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Transaction Details</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="transactionId">Transaction ID *</Label>
            <Input
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g., 9A5B7C2D1E"
              className="mt-1.5"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the transaction ID from your payment confirmation
            </p>
          </div>

          {isMobilePayment && (
            <>
              <div>
                <Label htmlFor="accountNumber">
                  Your {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Number *
                </Label>
                <Input
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="accountHolderName">Account Holder Name (Optional)</Label>
                <Input
                  id="accountHolderName"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Your name as registered"
                  className="mt-1.5"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="transactionDate">Transaction Date (Optional)</Label>
            <Input
              id="transactionDate"
              type="date"
              max={today}
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information about your payment"
              rows={3}
              className="mt-1.5"
            />
          </div>
        </div>
      </Card>

      {/* Booking ID Display */}
      {bookingId && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <p className="font-semibold text-green-900 dark:text-green-100">Booking Created</p>
            <p className="text-sm mt-1">
              Your booking ID: <strong>{bookingId}</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This booking will be held for 10 minutes. Please complete the payment to confirm.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Seller Approval Notice */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>What happens next?</strong>
        </p>
        <ul className="text-sm text-blue-900 dark:text-blue-100 mt-2 space-y-1 list-disc list-inside">
          <li>Your payment details will be sent to the seller for verification</li>
          <li>The seller will check the transaction and approve/reject within 24 hours</li>
          <li>You'll receive a confirmation email once approved</li>
          <li>You can track the status in your bookings dashboard</li>
        </ul>
      </Card>
    </div>
  );
}
