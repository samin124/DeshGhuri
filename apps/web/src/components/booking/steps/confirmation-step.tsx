import { useEffect } from 'react';
import { useBooking } from '@/contexts/booking-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Clock, MapPin, Calendar, Users, CreditCard, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBooking as useBookingQuery } from '@/lib/api/bookings';
import type { Listing } from '@/types/listing';

interface ConfirmationStepProps {
  listing: Listing;
  onValidationChange: (isValid: boolean) => void;
  onNext: () => void;
  onClose: () => void;
}

export function ConfirmationStep({ listing, onClose }: ConfirmationStepProps) {
  const { formData, priceBreakdown, bookingId } = useBooking();
  const { data: bookingData, refetch } = useBookingQuery(bookingId || '');

  const booking = bookingData?.data?.booking;

  useEffect(() => {
    // Refresh booking data every 10 seconds to check for approval status
    const interval = setInterval(() => {
      if (bookingId) {
        refetch();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [bookingId, refetch]);

  const locationText =
    typeof listing?.location === 'string'
      ? listing.location
      : `${listing?.location?.city}, ${listing?.location?.district}`;

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <Clock className="h-3.5 w-3.5" />
            Pending Approval
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Payment Submitted!</h2>
        <p className="text-muted-foreground">
          Your booking request has been sent to the seller for approval
        </p>
      </div>

      {/* Booking ID and Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Booking ID</p>
            <p className="text-lg font-mono font-semibold">{bookingId}</p>
          </div>
          {booking?.approvalStatus && getApprovalStatusBadge(booking.approvalStatus)}
        </div>

        <Separator className="my-4" />

        {booking?.approvalStatus === 'pending' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold">Awaiting Seller Approval</p>
              <p className="text-sm mt-1">
                The seller will review your payment details and approve/reject within 24 hours.
                You'll receive an email notification once the decision is made.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {booking?.approvalStatus === 'approved' && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <p className="font-semibold text-green-900 dark:text-green-100">Booking Confirmed!</p>
              <p className="text-sm mt-1">
                Your booking has been approved. Check your email for the confirmation receipt and
                ticket.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {booking?.approvalStatus === 'rejected' && booking?.rejectionReason && (
          <Alert variant="destructive">
            <AlertDescription>
              <p className="font-semibold">Booking Rejected</p>
              <p className="text-sm mt-1">Reason: {booking.rejectionReason}</p>
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Booking Details */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Booking Details</h3>

        <div className="space-y-4">
          {/* Listing Info */}
          <div className="flex gap-4">
            {listing?.images?.[0] && (
              <img
                src={listing.images[0].url}
                alt={listing.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold">{listing?.title}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {locationText}
              </p>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          {(formData.checkInDate || formData.serviceDate) && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                {formData.checkInDate && (
                  <>
                    <p className="font-medium">
                      Check-in: {new Date(formData.checkInDate).toLocaleDateString()}
                    </p>
                    <p className="font-medium">
                      Check-out:{' '}
                      {formData.checkOutDate &&
                        new Date(formData.checkOutDate).toLocaleDateString()}
                    </p>
                  </>
                )}
                {formData.serviceDate && (
                  <p className="font-medium">
                    Service Date: {new Date(formData.serviceDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Guests */}
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{formData.guestDetails?.totalGuests} Guests</p>
              <p className="text-sm text-muted-foreground">
                {formData.guestDetails?.adults} Adults, {formData.guestDetails?.children} Children
              </p>
            </div>
          </div>

          {/* Primary Guest */}
          <div>
            <p className="font-medium mb-2">Primary Guest</p>
            <p className="text-sm">{formData.guestDetails?.primaryGuest.name}</p>
            <p className="text-sm text-muted-foreground">
              {formData.guestDetails?.primaryGuest.email}
            </p>
            <p className="text-sm text-muted-foreground">
              {formData.guestDetails?.primaryGuest.phone}
            </p>
          </div>

          {/* Payment Method */}
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">
                {formData.paymentMethod === 'bkash'
                  ? 'bKash'
                  : formData.paymentMethod === 'nagad'
                    ? 'Nagad'
                    : formData.paymentMethod}
              </p>
              <p className="text-sm text-muted-foreground">
                Transaction ID: {formData.transactionId}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Price Summary */}
      <Card className="p-4 bg-muted/50">
        <h3 className="font-semibold mb-4">Price Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Amount</span>
            <span>৳{parseFloat(priceBreakdown?.baseAmount || '0').toLocaleString()}</span>
          </div>

          {parseFloat(priceBreakdown?.discountAmount || '0') > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-৳{parseFloat(priceBreakdown?.discountAmount || '0').toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>৳{parseFloat(priceBreakdown?.taxAmount || '0').toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform Fee</span>
            <span>৳{parseFloat(priceBreakdown?.platformFee || '0').toLocaleString()}</span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between font-semibold text-base">
            <span>Total Paid</span>
            <span>৳{parseFloat(priceBreakdown?.totalAmount || '0').toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">What's Next?</h3>
        <ul className="text-sm text-blue-900 dark:text-blue-100 space-y-2">
          <li className="flex gap-2">
            <span>1.</span>
            <span>The seller will verify your payment within 24 hours</span>
          </li>
          <li className="flex gap-2">
            <span>2.</span>
            <span>
              Once approved, you'll receive a confirmation email with your booking receipt and
              ticket
            </span>
          </li>
          <li className="flex gap-2">
            <span>3.</span>
            <span>You can track your booking status in your dashboard</span>
          </li>
          <li className="flex gap-2">
            <span>4.</span>
            <span>Contact the seller if you have any questions</span>
          </li>
        </ul>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={onClose} className="flex-1">
          Close
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => (window.location.href = '/bookings')}
        >
          View All Bookings
        </Button>
      </div>
    </div>
  );
}
