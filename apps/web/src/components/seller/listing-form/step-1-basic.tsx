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
import { useListingForm } from '@/contexts/listing-form-context';
import { LISTING_CATEGORIES, CATEGORY_DISPLAY_NAMES } from '@/lib/constants/categories';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Step1BasicInformation() {
  const { state, updateFormData } = useListingForm();
  const formData = state.formData;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Provide the essential details about your listing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Listing Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Luxury Beachfront Resort in Cox's Bazar"
              value={formData.title || ''}
              onChange={(e) => updateFormData({ title: e.target.value })}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {formData.title?.length || 0}/100 characters (minimum 10)
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your listing in detail. Include what makes it special, nearby attractions, and what guests can expect..."
              value={formData.description || ''}
              onChange={(e) => updateFormData({ description: e.target.value })}
              rows={8}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description?.length || 0}/2000 characters (minimum 50)
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.category || ''}
              onValueChange={(value) => updateFormData({ category: value as any })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LISTING_CATEGORIES.HOTEL}>
                  {CATEGORY_DISPLAY_NAMES[LISTING_CATEGORIES.HOTEL]}
                </SelectItem>
                <SelectItem value={LISTING_CATEGORIES.TOUR_PACKAGE}>
                  {CATEGORY_DISPLAY_NAMES[LISTING_CATEGORIES.TOUR_PACKAGE]}
                </SelectItem>
                <SelectItem value={LISTING_CATEGORIES.EXPERIENCE}>
                  {CATEGORY_DISPLAY_NAMES[LISTING_CATEGORIES.EXPERIENCE]}
                </SelectItem>
                <SelectItem value={LISTING_CATEGORIES.TRANSPORT}>
                  {CATEGORY_DISPLAY_NAMES[LISTING_CATEGORIES.TRANSPORT]}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>
            Where is your listing located?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                placeholder="e.g., Cox's Bazar"
                value={formData.location?.city || ''}
                onChange={(e) =>
                  updateFormData({
                    location: { ...formData.location, city: e.target.value },
                  })
                }
              />
            </div>

            {/* District */}
            <div className="space-y-2">
              <Label htmlFor="district">
                District <span className="text-destructive">*</span>
              </Label>
              <Input
                id="district"
                placeholder="e.g., Chittagong"
                value={formData.location?.district || ''}
                onChange={(e) =>
                  updateFormData({
                    location: { ...formData.location, district: e.target.value },
                  })
                }
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Street Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              placeholder="e.g., 123 Marine Drive, Kolatoli Beach"
              value={formData.location?.address || ''}
              onChange={(e) =>
                updateFormData({
                  location: { ...formData.location, address: e.target.value },
                })
              }
            />
          </div>

          {/* Landmark */}
          <div className="space-y-2">
            <Label htmlFor="landmark">Landmark (Optional)</Label>
            <Input
              id="landmark"
              placeholder="e.g., Near Sugandha Beach"
              value={formData.location?.landmark || ''}
              onChange={(e) =>
                updateFormData({
                  location: { ...formData.location, landmark: e.target.value },
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Help guests find your location easily
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
