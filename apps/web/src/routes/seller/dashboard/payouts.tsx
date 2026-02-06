import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getPayouts } from '@/lib/api/seller-dashboard';

export const Route = createFileRoute('/seller/dashboard/payouts')({
  component: SellerPayouts,
});
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { format } from 'date-fns';
import type { PayoutStatus } from '@/types/dashboard';

const statusColors: Record<PayoutStatus, string> = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

const statusLabels: Record<PayoutStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

function SellerPayouts() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['seller-payouts', page],
    queryFn: () => getPayouts({ page, limit }),
  });

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load payout history. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
          <p className="text-muted-foreground">
            View your payout history and track withdrawals
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Request Payout
        </Button>
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>
            {data && `${data.total} Payout${data.total !== 1 ? 's' : ''}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : data && data.payouts.length > 0 ? (
            <>
              <div className="space-y-4">
                {data.payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-start justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          {payout.id}
                        </span>
                        <Badge
                          variant="secondary"
                          className={statusColors[payout.status]}
                        >
                          {statusLabels[payout.status]}
                        </Badge>
                      </div>

                      <div className="text-sm">
                        <div className="font-medium">
                          {payout.bankDetails.bankName} -{' '}
                          {payout.bankDetails.accountNumber.replace(/\d(?=\d{4})/g, '*')}
                        </div>
                        <div className="text-muted-foreground">
                          {payout.bankDetails.accountHolderName}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {payout.status === 'completed' && payout.completedAt && (
                          <span>
                            Completed:{' '}
                            {format(new Date(payout.completedAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        )}
                        {payout.status === 'processing' && payout.processedAt && (
                          <span>
                            Processing since:{' '}
                            {format(new Date(payout.processedAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        )}
                        {payout.status === 'failed' && payout.failedAt && (
                          <span>
                            Failed:{' '}
                            {format(new Date(payout.failedAt), 'MMM dd, yyyy HH:mm')}
                            {payout.failureReason && ` - ${payout.failureReason}`}
                          </span>
                        )}
                        {payout.status === 'pending' && (
                          <span>
                            Requested:{' '}
                            {format(new Date(payout.createdAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        )}
                      </div>

                      {payout.transactionReference && (
                        <div className="text-xs text-muted-foreground">
                          Reference: {payout.transactionReference}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        {payout.escrowTransactionIds.length} transaction(s)
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ৳{parseFloat(payout.amount).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payout.currency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {data.page} of {data.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(data.totalPages, p + 1))
                      }
                      disabled={page === data.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No payout history yet.
              </p>
              <Button className="mt-4" variant="outline">
                Request Your First Payout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            • Payouts are processed within 3-5 business days
          </p>
          <p>
            • Minimum payout amount: ৳1,000
          </p>
          <p>
            • Payouts are sent to your verified bank account
          </p>
          <p>
            • You can request a payout when you have released earnings
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
