import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { useListingForm } from '@/contexts/listing-form-context';
import { CANCELLATION_POLICIES, CANCELLATION_POLICY_DESCRIPTIONS } from '@/lib/constants/categories';

export function Step4Policies() {
  const { state, updateFormData } = useListingForm();
  const formData = state.formData;

  // For preview
  const primaryImage = formData.images?.find((img) => img.isPrimary) || formData.images?.[0];
  const locationText = formData.location
    ? `${formData.location.city}, ${formData.location.district}`
    : '';

  return (
    <div className="space-y-6">
      {/* Cancellation Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Cancellation Policy</CardTitle>
          <CardDescription>
            Set your cancellation policy. This will be shown to customers before booking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancellationPolicy">
              Policy <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.cancellationPolicy || 'flexible'}
              onValueChange={(value) =>
                updateFormData({ cancellationPolicy: value as any })
              }
            >
              <SelectTrigger id="cancellationPolicy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CANCELLATION_POLICIES.FLEXIBLE}>
                  Flexible - Full refund up to 24 hours before
                </SelectItem>
                <SelectItem value={CANCELLATION_POLICIES.MODERATE}>
                  Moderate - Full refund up to 5 days before
                </SelectItem>
                <SelectItem value={CANCELLATION_POLICIES.STRICT}>
                  Strict - 50% refund up to 7 days before
                </SelectItem>
                <SelectItem value={CANCELLATION_POLICIES.NON_REFUNDABLE}>
                  Non-refundable - No refunds
                </SelectItem>
              </SelectContent>
            </Select>

            {formData.cancellationPolicy && (
              <p className="text-sm text-muted-foreground">
                {CANCELLATION_POLICY_DESCRIPTIONS[formData.cancellationPolicy]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Check-in/Check-out Times (for hotels) */}
      {(formData.category === 'hotel' || formData.priceUnit === 'per-night') && (
        <Card>
          <CardHeader>
            <CardTitle>Check-in & Check-out</CardTitle>
            <CardDescription>
              Specify your check-in and check-out times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="checkInTime">Check-in Time</Label>
                <Input
                  id="checkInTime"
                  type="time"
                  value={formData.checkInTime || ''}
                  onChange={(e) =>
                    updateFormData({ checkInTime: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOutTime">Check-out Time</Label>
                <Input
                  id="checkOutTime"
                  type="time"
                  value={formData.checkOutTime || ''}
                  onChange={(e) =>
                    updateFormData({ checkOutTime: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* House Rules */}
      <Card>
        <CardHeader>
          <CardTitle>House Rules (Optional)</CardTitle>
          <CardDescription>
            Additional rules or guidelines for guests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="houseRules"
            placeholder="e.g., No smoking, No pets, Quiet hours from 10 PM to 7 AM..."
            value={formData.houseRules || ''}
            onChange={(e) =>
              updateFormData({ houseRules: e.target.value })
            }
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            This is how your listing will appear to customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            {/* Image */}
            {primaryImage ? (
              <div className="aspect-video w-full">
                <img
                  src={primaryImage.url}
                  alt={formData.title || 'Listing preview'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No image uploaded yet</p>
              </div>
            )}

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Title and Category */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-2xl font-bold">
                    {formData.title || 'Untitled Listing'}
                  </h3>
                  {formData.category && (
                    <Badge variant="secondary">{formData.category}</Badge>
                  )}
                </div>

                {locationText && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{locationText}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {formData.description || 'No description provided'}
                </p>
              </div>

              <Separator />

              {/* Pricing */}
              {formData.basePrice && (
                <div>
                  <h4 className="font-semibold mb-2">Pricing</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      ৳{parseFloat(formData.basePrice).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      {formData.priceUnit === 'per-night'
                        ? 'per night'
                        : formData.priceUnit === 'per-person'
                        ? 'per person'
                        : 'per booking'}
                    </span>
                  </div>

                  {formData.groupEligible && formData.groupPricingTiers && formData.groupPricingTiers.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Group Discounts:</p>
                      <div className="space-y-1">
                        {formData.groupPricingTiers.map((tier, index) => (
                          <div key={index} className="text-sm text-muted-foreground">
                            {tier.minParticipants}-{tier.maxParticipants} people:{' '}
                            <span className="font-semibold text-primary">
                              {tier.discountPercentage}% off
                            </span>{' '}
                            (৳{tier.pricePerPerson.toLocaleString()} per person)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              {/* Amenities */}
              {formData.amenities && formData.amenities.length > 0 && (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Amenities</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Inclusions/Exclusions */}
              {((formData.inclusions && formData.inclusions.length > 0) ||
                (formData.exclusions && formData.exclusions.length > 0)) && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    {formData.inclusions && formData.inclusions.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-green-600">
                          What's Included
                        </h4>
                        <ul className="space-y-1">
                          {formData.inclusions.map((item, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              ✓ {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {formData.exclusions && formData.exclusions.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-destructive">
                          What's Not Included
                        </h4>
                        <ul className="space-y-1">
                          {formData.exclusions.map((item, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              ✗ {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Separator />
                </>
              )}

              {/* Policies */}
              <div>
                <h4 className="font-semibold mb-2">Policies</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Cancellation: </span>
                    <span className="text-muted-foreground">
                      {formData.cancellationPolicy || 'Not specified'}
                    </span>
                  </div>

                  {formData.checkInTime && (
                    <div>
                      <span className="font-medium">Check-in: </span>
                      <span className="text-muted-foreground">
                        {formData.checkInTime}
                      </span>
                    </div>
                  )}

                  {formData.checkOutTime && (
                    <div>
                      <span className="font-medium">Check-out: </span>
                      <span className="text-muted-foreground">
                        {formData.checkOutTime}
                      </span>
                    </div>
                  )}

                  {formData.houseRules && (
                    <div>
                      <span className="font-medium">House Rules: </span>
                      <p className="text-muted-foreground whitespace-pre-wrap mt-1">
                        {formData.houseRules}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
