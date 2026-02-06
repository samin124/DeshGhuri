import { useForm } from '@tanstack/react-form';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BusinessInfo, SellerCategory } from '@/types/seller';

interface OnboardingStep1Props {
  data: Partial<BusinessInfo>;
  onUpdate: (data: Partial<BusinessInfo>) => void;
}

const categories: { value: SellerCategory; label: string }[] = [
  { value: 'agency', label: 'Travel Agency' },
  { value: 'hotel', label: 'Hotel / Resort' },
  { value: 'tour-operator', label: 'Tour Operator' },
];

const districts = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet',
  'Rangpur', 'Mymensingh', 'Comilla', 'Narayanganj', 'Gazipur',
];

export function OnboardingStep1({ data, onUpdate }: OnboardingStep1Props) {
  const form = useForm({
    defaultValues: {
      businessName: data.businessName || '',
      category: data.category || ('agency' as SellerCategory),
      registrationNumber: data.registrationNumber || '',
      street: data.address?.street || '',
      city: data.address?.city || '',
      district: data.address?.district || '',
      postalCode: data.address?.postalCode || '',
      contactPhone: data.contactPhone || '',
      contactEmail: data.contactEmail || '',
      businessDescription: data.businessDescription || '',
    },
    onSubmit: async ({ value }) => {
      onUpdate({
        businessName: value.businessName,
        category: value.category,
        registrationNumber: value.registrationNumber,
        address: {
          street: value.street,
          city: value.city,
          district: value.district,
          postalCode: value.postalCode,
        },
        contactPhone: value.contactPhone,
        contactEmail: value.contactEmail,
        businessDescription: value.businessDescription,
      });
    },
  });

  // Ensure the default category is propagated to parent on mount
  useEffect(() => {
    if (!data.category) {
      onUpdate({ category: 'agency' as SellerCategory });
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Business Information</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your business. This information will be displayed on your seller profile.
        </p>
      </div>

      <form.Field
        name="businessName"
        validators={{
          onChange: ({ value }) =>
            !value ? 'Business name is required' : undefined,
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Business Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value);
                onUpdate({ businessName: e.target.value });
              }}
              placeholder="Enter your business name"
            />
            {field.state.meta.errors && (
              <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="category">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Business Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={field.state.value}
              onValueChange={(value) => {
                field.handleChange(value as SellerCategory);
                onUpdate({ category: value as SellerCategory });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <form.Field
        name="registrationNumber"
        validators={{
          onChange: ({ value }) =>
            !value ? 'Registration number is required' : undefined,
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Trade License / Registration Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value);
                onUpdate({ registrationNumber: e.target.value });
              }}
              placeholder="Enter registration number"
            />
            {field.state.meta.errors && (
              <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Business Address</h3>

        <form.Field name="street">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                Street Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  onUpdate({
                    address: {
                      street: e.target.value,
                      city: data.address?.city || '',
                      district: data.address?.district || '',
                      postalCode: data.address?.postalCode,
                    },
                  });
                }}
                placeholder="House/Flat no, Road no, Area"
              />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field name="city">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    onUpdate({
                      address: {
                        street: data.address?.street || '',
                        city: e.target.value,
                        district: data.address?.district || '',
                        postalCode: data.address?.postalCode,
                      },
                    });
                  }}
                  placeholder="Enter city"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="district">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  District <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value);
                    onUpdate({
                      address: {
                        street: data.address?.street || '',
                        city: data.address?.city || '',
                        district: value,
                        postalCode: data.address?.postalCode,
                      },
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="postalCode">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Postal Code</Label>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  onUpdate({
                    address: {
                      street: data.address?.street || '',
                      city: data.address?.city || '',
                      district: data.address?.district || '',
                      postalCode: e.target.value,
                    },
                  });
                }}
                placeholder="e.g., 1200"
              />
            </div>
          )}
        </form.Field>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contact Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field name="contactPhone">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={field.name}
                  type="tel"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    onUpdate({ contactPhone: e.target.value });
                  }}
                  placeholder="+880 1XXX-XXXXXX"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="contactEmail">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={field.name}
                  type="email"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    onUpdate({ contactEmail: e.target.value });
                  }}
                  placeholder="business@example.com"
                />
              </div>
            )}
          </form.Field>
        </div>
      </div>

      <form.Field name="businessDescription">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Business Description (Optional)</Label>
            <Textarea
              id={field.name}
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
                onUpdate({ businessDescription: e.target.value });
              }}
              placeholder="Tell us about your business, services, and what makes you unique..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This will be displayed on your seller profile
            </p>
          </div>
        )}
      </form.Field>
    </div>
  );
}
