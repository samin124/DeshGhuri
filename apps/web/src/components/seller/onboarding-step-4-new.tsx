import { CheckCircle2, Building2, Mail, MapPin, CreditCard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OnboardingStep4NewProps {
  data: any;
  email: string;
}

export function OnboardingStep4New({ data, email }: OnboardingStep4NewProps) {
  const { businessInfo, paymentMethods, bankAccount } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Review Your Information</h2>
        <p className="text-sm text-muted-foreground">
          Please review all details before submitting your seller application
        </p>
      </div>

      {/* Account Information */}
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Account Information
        </h3>
        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Login Email:</span>
            <span className="font-medium">{email}</span>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Business Information
        </h3>
        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Business Name:</span>
            <span className="font-medium">{businessInfo.businessName || '-'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Category:</span>
            <span className="font-medium capitalize">
              {businessInfo.category?.replace('-', ' ') || '-'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Registration Number:</span>
            <span className="font-medium">{businessInfo.registrationNumber || '-'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Contact Phone:</span>
            <span className="font-medium">{businessInfo.contactPhone || '-'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Contact Email:</span>
            <span className="font-medium">{businessInfo.contactEmail || '-'}</span>
          </div>
        </div>
      </div>

      {/* Address */}
      {businessInfo.address && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Business Address
          </h3>
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Street:</span>
              <span className="font-medium">{businessInfo.address.street || '-'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">City:</span>
              <span className="font-medium">{businessInfo.address.city || '-'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">District:</span>
              <span className="font-medium">{businessInfo.address.district || '-'}</span>
            </div>
            {businessInfo.address.postalCode && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Postal Code:</span>
                <span className="font-medium">{businessInfo.address.postalCode}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {paymentMethods && paymentMethods.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Methods
          </h3>
          <div className="bg-muted/30 p-4 rounded-lg space-y-3">
            {paymentMethods.map((pm: any, index: number) => (
              <div key={index} className="border-l-2 border-primary pl-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium uppercase">{pm.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Account Number:</span>
                  <span className="font-medium">{pm.accountNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Account Name:</span>
                  <span className="font-medium">{pm.accountName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bank Account (if provided) */}
      {bankAccount && bankAccount.bankName && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Bank Account
          </h3>
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bank Name:</span>
              <span className="font-medium">{bankAccount.bankName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Branch:</span>
              <span className="font-medium">{bankAccount.branchName || '-'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Account Holder:</span>
              <span className="font-medium">{bankAccount.accountHolderName || '-'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Account Number:</span>
              <span className="font-medium">{bankAccount.accountNumber || '-'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Submission Note */}
      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          <p className="font-medium mb-2">What happens next?</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Your application will be submitted with status "Pending"</li>
            <li>You'll receive an email verification link</li>
            <li>Our team will review your application</li>
            <li>Once approved, you'll be able to sign in and start selling</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
}
