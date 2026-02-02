import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { DollarSign, TrendingUp, Lock, AlertCircle } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useTransactions, useTransactionStats, useEscrowOverview, useProcessRefund, useReleaseEscrow, useHoldEscrow } from '@/hooks/use-admin-queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Route = createFileRoute('/admin/_admin/transactions/')({
  component: RouteComponent,
});

interface Transaction {
  id: string;
  transactionNumber: string;
  type: string;
  amount: number;
  status: string;
  booking?: {
    id: string;
    bookingNumber: string;
  };
  user: {
    id: string;
    name: string;
  };
  paymentMethod?: string;
  createdAt: string;
}

interface Escrow {
  id: string;
  booking: {
    id: string;
    bookingNumber: string;
  };
  amount: number;
  platformFee: number;
  status: string;
  releaseDate?: string;
  createdAt: string;
}

function RouteComponent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [refundDialog, setRefundDialog] = useState(false);
  const [releaseDialog, setReleaseDialog] = useState<{ open: boolean; escrow: Escrow | null }>({
    open: false,
    escrow: null,
  });
  const [holdDialog, setHoldDialog] = useState<{ open: boolean; escrow: Escrow | null }>({
    open: false,
    escrow: null,
  });

  const [refundBookingId, setRefundBookingId] = useState('');
  const [refundAmount, setRefundAmount] = useState<number | ''>('');
  const [refundReason, setRefundReason] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [releaseReason, setReleaseReason] = useState('');
  const [releaseAmount, setReleaseAmount] = useState<number | ''>('');
  const [holdReason, setHoldReason] = useState('');

  const { data, isLoading, error } = useTransactions({
    page,
    limit: pageSize,
    search,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortOrder,
  });

  const { data: stats } = useTransactionStats();
  const { data: escrowData } = useEscrowOverview();
  const refundMutation = useProcessRefund();
  const releaseMutation = useReleaseEscrow();
  const holdMutation = useHoldEscrow();

  const handleRefund = async () => {
    if (!refundBookingId || !refundAmount || !refundReason.trim()) return;

    await refundMutation.mutateAsync({
      bookingId: refundBookingId,
      amount: Number(refundAmount),
      reason: refundReason.trim(),
      notifyCustomer,
    });

    setRefundDialog(false);
    setRefundBookingId('');
    setRefundAmount('');
    setRefundReason('');
    setNotifyCustomer(true);
  };

  const handleRelease = async () => {
    if (!releaseDialog.escrow || !releaseReason.trim()) return;

    await releaseMutation.mutateAsync({
      id: releaseDialog.escrow.id,
      data: {
        reason: releaseReason.trim(),
        amount: releaseAmount !== '' ? Number(releaseAmount) : undefined,
      },
    });

    setReleaseDialog({ open: false, escrow: null });
    setReleaseReason('');
    setReleaseAmount('');
  };

  const handleHold = async () => {
    if (!holdDialog.escrow || !holdReason.trim()) return;

    await holdMutation.mutateAsync({
      id: holdDialog.escrow.id,
      reason: holdReason.trim(),
    });

    setHoldDialog({ open: false, escrow: null });
    setHoldReason('');
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'refund':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'payout':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'fee':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getEscrowStatusColor = (status: string) => {
    switch (status) {
      case 'released':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'on_hold':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'pending_proof':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'created':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const transactionColumns: Column<Transaction>[] = [
    {
      id: 'transactionNumber',
      header: 'Transaction #',
      accessor: (tx) => tx.transactionNumber || 'N/A',
      sortable: true,
    },
    {
      id: 'type',
      header: 'Type',
      accessor: (tx) => (
        <Badge className={getTransactionTypeColor(tx.type)}>{tx.type || 'N/A'}</Badge>
      ),
    },
    {
      id: 'user',
      header: 'User',
      accessor: (tx) => tx.user?.name || 'N/A',
    },
    {
      id: 'booking',
      header: 'Booking',
      accessor: (tx) => tx.booking?.bookingNumber || 'N/A',
    },
    {
      id: 'amount',
      header: 'Amount',
      accessor: (tx) => `BDT ${tx.amount?.toLocaleString() || 0}`,
      sortable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (tx) => (
        <Badge className={getStatusColor(tx.status)}>{tx.status || 'pending'}</Badge>
      ),
    },
    {
      id: 'paymentMethod',
      header: 'Method',
      accessor: (tx) => tx.paymentMethod || 'N/A',
    },
    {
      id: 'createdAt',
      header: 'Date',
      accessor: (tx) => new Date(tx.createdAt).toLocaleDateString(),
      sortable: true,
    },
  ];

  const escrowColumns: Column<Escrow>[] = [
    {
      id: 'booking',
      header: 'Booking',
      accessor: (escrow) => escrow.booking?.bookingNumber || 'N/A',
    },
    {
      id: 'amount',
      header: 'Amount',
      accessor: (escrow) => `BDT ${escrow.amount?.toLocaleString() || 0}`,
      sortable: true,
    },
    {
      id: 'platformFee',
      header: 'Platform Fee',
      accessor: (escrow) => `BDT ${escrow.platformFee?.toLocaleString() || 0}`,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (escrow) => (
        <Badge className={getEscrowStatusColor(escrow.status)}>{escrow.status?.replace('_', ' ') || 'N/A'}</Badge>
      ),
    },
    {
      id: 'releaseDate',
      header: 'Release Date',
      accessor: (escrow) => escrow.releaseDate ? new Date(escrow.releaseDate).toLocaleDateString() : 'N/A',
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessor: (escrow) => new Date(escrow.createdAt).toLocaleDateString(),
      sortable: true,
    },
  ];

  const renderEscrowActions = (escrow: Escrow) => (
    <div className="flex gap-2">
      {escrow.status !== 'released' && escrow.status !== 'on_hold' && (
        <>
          <Button
            variant="default"
            size="sm"
            onClick={() => setReleaseDialog({ open: true, escrow })}
          >
            Release
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setHoldDialog({ open: true, escrow })}
          >
            <Lock className="h-4 w-4" />
          </Button>
        </>
      )}
      {escrow.status === 'on_hold' && (
        <Button
          variant="default"
          size="sm"
          onClick={() => setReleaseDialog({ open: true, escrow })}
        >
          Release
        </Button>
      )}
    </div>
  );

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Transaction & Escrow Management</h1>
        <Card className="mt-4 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error.message || 'Transaction management requires database schema implementation.'}
          </p>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Required Implementation:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Create transactions table in database schema</li>
              <li>Create escrow table in database schema</li>
              <li>Link transactions to bookings and users</li>
              <li>Implement payment gateway integration</li>
              <li>Add escrow lifecycle management</li>
            </ul>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaction & Escrow Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor transactions and manage escrow funds
          </p>
        </div>
        <Button onClick={() => setRefundDialog(true)}>
          Process Manual Refund
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total?.payments || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total?.refunds || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth?.payments || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">BDT {stats.volume?.total?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="escrow">Escrow</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border rounded text-sm min-w-[150px]"
              >
                <option value="">All Types</option>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
                <option value="payout">Payout</option>
                <option value="fee">Fee</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border rounded text-sm min-w-[150px]"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border rounded text-sm"
              />
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            data={data?.transactions || []}
            columns={transactionColumns}
            loading={isLoading}
            page={page}
            pageSize={pageSize}
            totalItems={data?.pagination.total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            sortBy="createdAt"
            sortOrder={sortOrder}
            onSort={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            searchable
            searchPlaceholder="Search by transaction number, user, or booking..."
            onSearch={(query) => {
              setSearch(query);
              setPage(1);
            }}
            getRowId={(tx) => tx.id}
            emptyMessage="No transactions found"
          />
        </TabsContent>

        <TabsContent value="escrow" className="space-y-4">
          {/* Escrow Summary */}
          {escrowData && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total in Escrow</CardTitle>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">BDT {escrowData.summary?.totalInEscrow?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Release</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">BDT {escrowData.summary?.pendingRelease?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Proof</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">BDT {escrowData.summary?.pendingProof?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On Hold</CardTitle>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">BDT {escrowData.summary?.onHold?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Escrow Table */}
          <DataTable
            data={escrowData?.escrows || []}
            columns={escrowColumns}
            loading={false}
            page={1}
            pageSize={25}
            totalItems={escrowData?.escrows?.length || 0}
            onPageChange={() => {}}
            onPageSizeChange={() => {}}
            sortBy="createdAt"
            sortOrder="desc"
            onSort={() => {}}
            getRowId={(escrow) => escrow.id}
            actions={renderEscrowActions}
            emptyMessage="No escrow records found"
          />
        </TabsContent>
      </Tabs>

      {/* Manual Refund Dialog */}
      <Dialog open={refundDialog} onOpenChange={setRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Manual Refund</DialogTitle>
            <DialogDescription>
              Issue a refund for a booking
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Booking ID *</Label>
              <Input
                value={refundBookingId}
                onChange={(e) => setRefundBookingId(e.target.value)}
                placeholder="Enter booking ID"
              />
            </div>

            <div>
              <Label>Refund Amount (BDT) *</Label>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="Enter amount to refund"
              />
            </div>

            <div>
              <Label>Reason *</Label>
              <Textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Explain why this refund is being processed..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notifyCustomerRefund"
                checked={notifyCustomer}
                onChange={(e) => setNotifyCustomer(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="notifyCustomerRefund" className="cursor-pointer">
                Notify customer via email
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setRefundDialog(false);
                setRefundBookingId('');
                setRefundAmount('');
                setRefundReason('');
                setNotifyCustomer(true);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              disabled={
                !refundBookingId ||
                !refundAmount ||
                !refundReason.trim() ||
                refundMutation.isPending
              }
            >
              {refundMutation.isPending ? 'Processing...' : 'Process Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Escrow Dialog */}
      <Dialog open={releaseDialog.open} onOpenChange={(open) => !open && setReleaseDialog({ open: false, escrow: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Escrow</DialogTitle>
            <DialogDescription>
              Manually release escrow funds to seller
            </DialogDescription>
          </DialogHeader>

          {releaseDialog.escrow && (
            <div className="space-y-4">
              <div>
                <Label>Booking</Label>
                <p className="text-sm">{releaseDialog.escrow.booking?.bookingNumber}</p>
              </div>

              <div>
                <Label>Total Escrow Amount</Label>
                <p className="text-sm">BDT {releaseDialog.escrow.amount?.toLocaleString()}</p>
              </div>

              <div>
                <Label>Amount to Release (BDT)</Label>
                <Input
                  type="number"
                  value={releaseAmount}
                  onChange={(e) => setReleaseAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Leave empty to release full amount"
                />
              </div>

              <div>
                <Label>Reason *</Label>
                <Textarea
                  value={releaseReason}
                  onChange={(e) => setReleaseReason(e.target.value)}
                  placeholder="Explain why the escrow is being released..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setReleaseDialog({ open: false, escrow: null });
                setReleaseReason('');
                setReleaseAmount('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRelease}
              disabled={!releaseReason.trim() || releaseMutation.isPending}
            >
              {releaseMutation.isPending ? 'Releasing...' : 'Release Escrow'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hold Escrow Dialog */}
      <Dialog open={holdDialog.open} onOpenChange={(open) => !open && setHoldDialog({ open: false, escrow: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hold Escrow</DialogTitle>
            <DialogDescription>
              Place escrow funds on hold
            </DialogDescription>
          </DialogHeader>

          {holdDialog.escrow && (
            <div className="space-y-4">
              <div>
                <Label>Booking</Label>
                <p className="text-sm">{holdDialog.escrow.booking?.bookingNumber}</p>
              </div>

              <div>
                <Label>Escrow Amount</Label>
                <p className="text-sm">BDT {holdDialog.escrow.amount?.toLocaleString()}</p>
              </div>

              <div>
                <Label>Hold Reason *</Label>
                <Textarea
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  placeholder="Explain why the escrow is being held..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setHoldDialog({ open: false, escrow: null });
                setHoldReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleHold}
              disabled={!holdReason.trim() || holdMutation.isPending}
            >
              {holdMutation.isPending ? 'Holding...' : 'Hold Escrow'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
