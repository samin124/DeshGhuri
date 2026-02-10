import { useState } from 'react';
import { Upload, X, Star, Image as ImageIcon, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useListingForm } from '@/contexts/listing-form-context';
import type { ListingImage } from '@/types/listing';

const COMMON_AMENITIES = [
  'WiFi',
  'Air Conditioning',
  'Parking',
  'Swimming Pool',
  'Restaurant',
  'Room Service',
  'Spa',
  'Gym',
  'Sea View',
  'Mountain View',
  'Beach Access',
  'Conference Room',
  'Breakfast Included',
  'Airport Transfer',
  'Guide Service',
  '24/7 Security',
  'Wheelchair Accessible',
  'Pet Friendly',
];

export function Step3Media() {
  const { state, updateFormData } = useListingForm();
  const formData = state.formData;
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  // Image upload handler
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const existingImages = formData.images || [];
    if (existingImages.length + files.length > 20) {
      alert('Maximum 20 images allowed');
      return;
    }

    setUploading(true);

    try {
      const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
      const uploadedImages: ListingImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        // Simulate progress
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        const response = await fetch(`${API_URL}/api/seller/upload-image`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const result = await response.json();

        uploadedImages.push({
          url: result.url,
          storageKey: result.key,
          isPrimary: existingImages.length === 0 && i === 0, // First image is primary
          caption: '',
        });

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
      }

      updateFormData({
        images: [...existingImages, ...uploadedImages],
      });

      setUploadProgress({});
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const images = [...(formData.images || [])];
    images.splice(index, 1);

    // If we removed the primary image, make the first image primary
    if (images.length > 0 && !images.some((img) => img.isPrimary)) {
      images[0].isPrimary = true;
    }

    updateFormData({ images });
  };

  const setPrimaryImage = (index: number) => {
    const images = [...(formData.images || [])];
    images.forEach((img, i) => {
      img.isPrimary = i === index;
    });
    updateFormData({ images });
  };

  const toggleAmenity = (amenity: string) => {
    const amenities = formData.amenities || [];
    const index = amenities.indexOf(amenity);

    if (index > -1) {
      amenities.splice(index, 1);
    } else {
      amenities.push(amenity);
    }

    updateFormData({ amenities: [...amenities] });
  };

  const addInclusion = () => {
    if (!newInclusion.trim()) return;
    const inclusions = [...(formData.inclusions || []), newInclusion.trim()];
    updateFormData({ inclusions });
    setNewInclusion('');
  };

  const removeInclusion = (index: number) => {
    const inclusions = [...(formData.inclusions || [])];
    inclusions.splice(index, 1);
    updateFormData({ inclusions });
  };

  const addExclusion = () => {
    if (!newExclusion.trim()) return;
    const exclusions = [...(formData.exclusions || []), newExclusion.trim()];
    updateFormData({ exclusions });
    setNewExclusion('');
  };

  const removeExclusion = (index: number) => {
    const exclusions = [...(formData.exclusions || [])];
    exclusions.splice(index, 1);
    updateFormData({ exclusions });
  };

  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>
            Upload at least 3 high-quality images (max 20). First image will be the cover.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              id="image-upload"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => handleImageUpload(e.target.files)}
              disabled={uploading || (formData.images?.length || 0) >= 20}
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WebP up to 5MB each
              </p>
            </label>
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([filename, progress]) => (
                <div key={filename} className="space-y-1">
                  <p className="text-sm">{filename}</p>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Image Grid */}
          {formData.images && formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-border">
                  <img
                    src={image.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Primary Badge */}
                  {image.isPrimary && (
                    <Badge className="absolute top-2 left-2 bg-primary">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Primary
                    </Badge>
                  )}

                  {/* Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!image.isPrimary && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setPrimaryImage(index)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {formData.images?.length || 0}/20 images uploaded (minimum 3 required)
          </p>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
          <CardDescription>
            Select all amenities that apply to your listing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {COMMON_AMENITIES.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity}`}
                  checked={formData.amenities?.includes(amenity) || false}
                  onCheckedChange={() => toggleAmenity(amenity)}
                />
                <label
                  htmlFor={`amenity-${amenity}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inclusions */}
      <Card>
        <CardHeader>
          <CardTitle>What's Included</CardTitle>
          <CardDescription>
            List what's included in the price (e.g., meals, guide, equipment)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Breakfast included"
              value={newInclusion}
              onChange={(e) => setNewInclusion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclusion())}
            />
            <Button type="button" onClick={addInclusion}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.inclusions && formData.inclusions.length > 0 && (
            <div className="space-y-2">
              {formData.inclusions.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md border"
                >
                  <span className="text-sm">{item}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInclusion(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exclusions */}
      <Card>
        <CardHeader>
          <CardTitle>What's Not Included</CardTitle>
          <CardDescription>
            List what's NOT included (e.g., lunch, personal expenses)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Lunch and dinner"
              value={newExclusion}
              onChange={(e) => setNewExclusion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExclusion())}
            />
            <Button type="button" onClick={addExclusion}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.exclusions && formData.exclusions.length > 0 && (
            <div className="space-y-2">
              {formData.exclusions.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md border"
                >
                  <span className="text-sm">{item}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExclusion(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
