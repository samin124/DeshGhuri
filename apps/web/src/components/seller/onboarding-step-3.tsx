import { useForm } from '@tanstack/react-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';
import type { BankAccount } from '@/types/seller';

interface OnboardingStep3Props {
  data: Partial<BankAccount>;
  onUpdate: (data: Partial<BankAccount>) => void;
}

const banks = [
  'Sonali Bank',
  'Janata Bank',
  'Agrani Bank',
  'Rupali Bank',
  'BASIC Bank',
  'Bangladesh Development Bank',
  'Dutch-Bangla Bank',
  'BRAC Bank',
  'Eastern Bank',
  'Islami Bank Bangladesh',
  'Prime Bank',
  'City Bank',
  'United Commercial Bank',
  'Standard Chartered Bank',
  'HSBC Bangladesh',
  'Mutual Trust Bank',
  'Standard Bank',
  'One Bank',
  'Mercantile Bank',
  'Southeast Bank',
  'Trust Bank',
  'Bank Asia',
  'Midland Bank',
  'Jamuna Bank',
];

export function OnboardingStep3({ data, onUpdate }: OnboardingStep3Props) {
  const form = useForm({
    defaultValues: {
      bankName: data.bankName || '',
      accountHolderName: data.accountHolderName || '',
      accountNumber: data.accountNumber || '',
      routingNumber: data.routingNumber || '',
      branchName: data.branchName || '',
      accountType: data.accountType || ('savings' as const),
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Bank Account Details</h2>
        <p className="text-sm text-muted-foreground">
          Add your bank account to receive payouts from your sales
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your banking information is encrypted and securely stored. We use micro-deposit verification to confirm your account.
        </AlertDescription>
      </Alert>

      <form.Field name="bankName">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Bank Name <span className="text-red-500">*</span>
            </Label>
            <Select
              value={field.state.value}
              onValueChange={(value) => {
                field.handleChange(value);
                onUpdate({ ...data, bankName: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <form.Field name="branchName">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Branch Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id={field.name}
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
                onUpdate({ ...data, branchName: e.target.value });
              }}
              placeholder="Enter branch name"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="accountHolderName">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Account Holder Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id={field.name}
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
                onUpdate({ ...data, accountHolderName: e.target.value });
              }}
              placeholder="Name as per bank account"
            />
            <p className="text-xs text-muted-foreground">
              Must match the name on your bank account
            </p>
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field name="accountType">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                Account Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value as 'savings' | 'current');
                  onUpdate({ ...data, accountType: value as 'savings' | 'current' });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings Account</SelectItem>
                  <SelectItem value="current">Current Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <form.Field name="accountNumber">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                Account Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  onUpdate({ ...data, accountNumber: e.target.value });
                }}
                placeholder="Enter account number"
              />
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="routingNumber">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Routing Number (Optional)</Label>
            <Input
              id={field.name}
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
                onUpdate({ ...data, routingNumber: e.target.value });
              }}
              placeholder="9-digit routing number"
            />
            <p className="text-xs text-muted-foreground">
              Required for some banks for faster transactions
            </p>
          </div>
        )}
      </form.Field>

      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          <div className="space-y-2">
            <p className="font-medium">Verification Process:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>We'll send a small test deposit (BDT 1-5) to your account</li>
              <li>You'll receive the exact amount via SMS</li>
              <li>Confirm the amount to verify your account</li>
              <li>Verification typically completes within 24 hours</li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
