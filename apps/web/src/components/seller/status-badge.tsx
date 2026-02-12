import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, AlertCircle, FileCheck } from 'lucide-react';

type BookingStatus = 'confirmed' | 'completed' | 'cancelled' | 'disputed' | 'pending';
type PaymentStatus =
  | 'created'
  | 'pending-proof'
  | 'proof-submitted'
  | 'proof-verified'
  | 'released'
  | 'failed';
type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface StatusBadgeProps {
  status: BookingStatus | PaymentStatus | PayoutStatus | string;
  type: 'booking' | 'payment' | 'payout';
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const getBookingStyle = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return {
          variant: 'default' as const,
          className: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
          icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
          label: 'Confirmed',
        };
      case 'completed':
        return {
          variant: 'default' as const,
          className: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
          icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
          label: 'Completed',
        };
      case 'cancelled':
        return {
          variant: 'default' as const,
          className: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20',
          icon: <XCircle className="h-3 w-3 mr-1" />,
          label: 'Cancelled',
        };
      case 'disputed':
        return {
          variant: 'default' as const,
          className: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          label: 'Disputed',
        };
      case 'pending':
        return {
          variant: 'default' as const,
          className: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
          icon: <Clock className="h-3 w-3 mr-1" />,
          label: 'Pending',
        };
      default:
        return {
          variant: 'secondary' as const,
          className: '',
          icon: null,
          label: status,
        };
    }
  };

  const getPaymentStyle = (status: PaymentStatus) => {
    switch (status) {
      case 'created':
        return {
          variant: 'default' as const,
          className: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20',
          icon: <Clock className="h-3 w-3 mr-1" />,
          label: 'Created',
        };
      case 'pending-proof':
        return {
          variant: 'default' as const,
          className: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          label: 'Pending Proof',
        };
      case 'proof-submitted':
        return {
          variant: 'default' as const,
          className: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
          icon: <FileCheck className="h-3 w-3 mr-1" />,
          label: 'Proof Submitted',
        };
      case 'proof-verified':
        return {
          variant: 'default' as const,
          className: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20',
          icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
          label: 'Verified',
        };
      case 'released':
        return {
          variant: 'default' as const,
          className: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
          icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
          label: 'Released',
        };
      case 'failed':
        return {
          variant: 'default' as const,
          className: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
          icon: <XCircle className="h-3 w-3 mr-1" />,
          label: 'Failed',
        };
      default:
        return {
          variant: 'secondary' as const,
          className: '',
          icon: null,
          label: status,
        };
    }
  };

  const getPayoutStyle = (status: PayoutStatus) => {
    switch (status) {
      case 'pending':
        return {
          variant: 'default' as const,
          className: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
          icon: <Clock className="h-3 w-3 mr-1" />,
          label: 'Pending',
        };
      case 'processing':
        return {
          variant: 'default' as const,
          className: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
          icon: <Clock className="h-3 w-3 mr-1" />,
          label: 'Processing',
        };
      case 'completed':
        return {
          variant: 'default' as const,
          className: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
          icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
          label: 'Completed',
        };
      case 'failed':
        return {
          variant: 'default' as const,
          className: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
          icon: <XCircle className="h-3 w-3 mr-1" />,
          label: 'Failed',
        };
      default:
        return {
          variant: 'secondary' as const,
          className: '',
          icon: null,
          label: status,
        };
    }
  };

  let style;
  switch (type) {
    case 'booking':
      style = getBookingStyle(status as BookingStatus);
      break;
    case 'payment':
      style = getPaymentStyle(status as PaymentStatus);
      break;
    case 'payout':
      style = getPayoutStyle(status as PayoutStatus);
      break;
    default:
      style = {
        variant: 'secondary' as const,
        className: '',
        icon: null,
        label: status,
      };
  }

  return (
    <Badge variant={style.variant} className={style.className}>
      {style.icon}
      {style.label}
    </Badge>
  );
}
