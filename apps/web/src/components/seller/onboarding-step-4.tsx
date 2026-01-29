import { Check, Building2, FileText, Wallet, MapPin, Mail, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { OnboardingFormData } from '@/types/seller';

interface OnboardingStep4Props {
  data: OnboardingFormData;
}

const categoryLabels = {
  agency: 'Travel Agency',
  hotel: 'Hotel / Resort',
  'tour-operator': 'Tour Operator',
};

export function OnboardingStep4({ data }: OnboardingStep4Props) {
  const { businessInfo, documents, bankAccount } = data;

  const uploadedDocs = Object.entries(documents).filter(([_, file]) => file !== undefined);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Review Your Application</h2>
        <p className="text-sm text-muted-foreground">
          Please review all information before submitting. You can go back to edit any section.
        </p>
      </div>

      {/* Business Information */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Business Information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Business Name</p>
              <p className="font-medium">{businessInfo.businessName || 'Not provided'}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Category</p>
              <Badge variant="secondary">
                {businessInfo.category ? categoryLabels[businessInfo.category] : 'Not provided'}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Registration Number</p>
              <p className="font-medium">{businessInfo.registrationNumber || 'Not provided'}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-2">Address</p>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  {businessInfo.address?.street && <p>{businessInfo.address.street}</p>}
                  {businessInfo.address?.city && businessInfo.address?.district && (
                    <p>
                      {businessInfo.address.city}, {businessInfo.address.district}
                    </p>
                  )}
                  {businessInfo.address?.postalCode && <p>{businessInfo.address.postalCode}</p>}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Contact Phone</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{businessInfo.contactPhone || 'Not provided'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Contact Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{businessInfo.contactEmail || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {businessInfo.businessDescription && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{businessInfo.businessDescription}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Uploaded Documents</h3>
          </div>

          <div className="space-y-3">
            {uploadedDocs.length > 0 ? (
              uploadedDocs.map(([key, file]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {file?.name || 'Unnamed document'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {file?.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2 flex-shrink-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Ready
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No documents uploaded
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bank Account */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Bank Account</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Bank Name</p>
                <p className="font-medium">{bankAccount.bankName || 'Not provided'}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Branch</p>
                <p className="font-medium">{bankAccount.branchName || 'Not provided'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Account Holder Name</p>
              <p className="font-medium">{bankAccount.accountHolderName || 'Not provided'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Account Type</p>
                <Badge variant="secondary">
                  {bankAccount.accountType === 'savings' ? 'Savings Account' : bankAccount.accountType === 'current' ? 'Current Account' : 'Not provided'}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Account Number</p>
                <p className="font-mono text-sm">
                  {bankAccount.accountNumber ? `****${bankAccount.accountNumber.slice(-4)}` : 'Not provided'}
                </p>
              </div>
            </div>

            {bankAccount.routingNumber && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Routing Number</p>
                <p className="font-mono text-sm">{bankAccount.routingNumber}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="p-6">
          <div className="space-y-3">
            <h3 className="font-semibold">Before you submit:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>All information provided is accurate and up-to-date</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>I agree to DeshGhuri's Terms of Service and Seller Agreement</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>I understand that verification may take 24-48 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>I will be notified via email once the verification is complete</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
