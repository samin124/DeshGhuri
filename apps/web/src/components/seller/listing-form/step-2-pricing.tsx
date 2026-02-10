import { Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useListingForm } from '@/contexts/listing-form-context';
import type { GroupPricingTier } from '@/types/listing';

export function Step2Pricing() {
  const { state, updateFormData } = useListingForm();
  const formData = state.formData;

  const addTier = () => {
    const existingTiers = formData.groupPricingTiers || [];
    const lastTier = existingTiers[existingTiers.length - 1];

    const newTier: GroupPricingTier = {
      minParticipants: lastTier ? lastTier.maxParticipants + 1 : 5,
      maxParticipants: lastTier ? lastTier.maxParticipants + 5 : 10,
      discountPercentage: 10,
      pricePerPerson: formData.basePrice
        ? parseFloat(formData.basePrice) * 0.9
        : 0,
    };

    updateFormData({
      groupPricingTiers: [...existingTiers, newTier],
    });
  };

  const removeTier = (index: number) => {
    const tiers = [...(formData.groupPricingTiers || [])];
    tiers.splice(index, 1);
    updateFormData({ groupPricingTiers: tiers });
  };

  const updateTier = (index: number, updates: Partial<GroupPricingTier>) => {
    const tiers = [...(formData.groupPricingTiers || [])];
    tiers[index] = { ...tiers[index], ...updates };

    // Auto-calculate price per person
    if (updates.discountPercentage !== undefined && formData.basePrice) {
      tiers[index].pricePerPerson =
        parseFloat(formData.basePrice) * (1 - tiers[index].discountPercentage / 100);
    }

    updateFormData({ groupPricingTiers: tiers });
  };

  return (
    <div className="space-y-6">
      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>Set your base price and pricing model</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Base Price */}
            <div className="space-y-2">
              <Label htmlFor="basePrice">
                Base Price (BDT) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="basePrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="5000"
                value={formData.basePrice || ''}
                onChange={(e) => updateFormData({ basePrice: e.target.value })}
              />
            </div>

            {/* Price Unit */}
            <div className="space-y-2">
              <Label htmlFor="priceUnit">
                Price Unit <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.priceUnit || 'per-person'}
                onValueChange={(value) => updateFormData({ priceUnit: value as any })}
              >
                <SelectTrigger id="priceUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per-person">Per Person</SelectItem>
                  <SelectItem value="per-night">Per Night</SelectItem>
                  <SelectItem value="per-booking">Per Booking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacity */}
      <Card>
        <CardHeader>
          <CardTitle>Capacity</CardTitle>
          <CardDescription>How many guests can you accommodate?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Min Guests */}
            <div className="space-y-2">
              <Label htmlFor="minGuests">Minimum Guests</Label>
              <Input
                id="minGuests"
                type="number"
                min="1"
                value={formData.minGuests || 1}
                onChange={(e) =>
                  updateFormData({ minGuests: parseInt(e.target.value) || 1 })
                }
              />
            </div>

            {/* Max Guests */}
            <div className="space-y-2">
              <Label htmlFor="maxGuests">
                Maximum Guests <span className="text-destructive">*</span>
              </Label>
              <Input
                id="maxGuests"
                type="number"
                min="1"
                value={formData.maxGuests || 10}
                onChange={(e) =>
                  updateFormData({ maxGuests: parseInt(e.target.value) || 10 })
                }
              />
            </div>

            {/* Total Capacity */}
            <div className="space-y-2">
              <Label htmlFor="capacity">Total Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity || 10}
                onChange={(e) =>
                  updateFormData({ capacity: parseInt(e.target.value) || 10 })
                }
              />
              <p className="text-xs text-muted-foreground">
                Max inventory available
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Group Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Group Pricing (Optional)</CardTitle>
          <CardDescription>
            Offer discounts for larger groups to attract more bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable Group Pricing Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="groupEligible" className="text-base font-semibold">
                Enable Group Discounts
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to get discounts when booking for larger groups
              </p>
            </div>
            <Switch
              id="groupEligible"
              checked={formData.groupEligible || false}
              onCheckedChange={(checked) =>
                updateFormData({ groupEligible: checked })
              }
            />
          </div>

          {/* Pricing Tiers */}
          {formData.groupEligible && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Pricing Tiers</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTier}
                  disabled={(formData.groupPricingTiers?.length || 0) >= 5}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tier
                </Button>
              </div>

              {formData.groupPricingTiers?.map((tier, index) => (
                <Card key={index} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Tier {index + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTier(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      {/* Min Participants */}
                      <div className="space-y-1.5">
                        <Label className="text-xs">Min Participants</Label>
                        <Input
                          type="number"
                          min="1"
                          value={tier.minParticipants}
                          onChange={(e) =>
                            updateTier(index, {
                              minParticipants: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>

                      {/* Max Participants */}
                      <div className="space-y-1.5">
                        <Label className="text-xs">Max Participants</Label>
                        <Input
                          type="number"
                          min="1"
                          value={tier.maxParticipants}
                          onChange={(e) =>
                            updateTier(index, {
                              maxParticipants: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Discount Percentage */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Discount Percentage</Label>
                      <Input
                        type="number"
                        min="0"
                        max="99"
                        step="1"
                        value={tier.discountPercentage}
                        onChange={(e) =>
                          updateTier(index, {
                            discountPercentage: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    {/* Calculated Price */}
                    <div className="rounded-md bg-muted p-3">
                      <p className="text-xs text-muted-foreground">
                        Price per person with discount:
                      </p>
                      <p className="text-lg font-bold">
                        ৳{tier.pricePerPerson.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(!formData.groupPricingTiers ||
                formData.groupPricingTiers.length === 0) && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No pricing tiers yet. Click "Add Tier" to create one.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
