import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Calendar, DollarSign, XCircle, FileText } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/data-table';
import {
  useBookings,
  useBookingStats,
  useCancelBooking,
  useUpdateBookingStatus,
  useAddBookingNote,
} from '@/hooks/use-admin-queries';
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

export const Route = createFileRoute('/admin/_admin/bookings/')({
  component: RouteComponent,
});

interface Booking {
  id: string;
  bookingNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  listing: {
    id: string;
    title: string;
  };
  seller: {
    id: string;
    businessName: string;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

function RouteComponent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; booking: Booking | null }>({
    open: false,
    booking: null,
  });
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; booking: Booking | null }>({
    open: false,
    booking: null,
  });
  const [noteDialog, setNoteDialog] = useState<{ open: boolean; booking: Booking | null }>({
    open: false,
    booking: null,
  });
  const [cancelReason, setCancelReason] = useState('');
  const [refundAmount, setRefundAmount] = useState<number | ''>('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [newStatus, setNewStatus] = useState<
    'confirmed' | 'completed' | 'cancelled' | 'disputed' | ''
  >('');
  const [statusReason, setStatusReason] = useState('');
  const [note, setNote] = useState('');

  const { data, isLoading, error } = useBookings({
    page,
    limit: pageSize,
    search,
    status: statusFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortBy,
    sortOrder,
  });

  const { data: stats } = useBookingStats();
  const cancelMutation = useCancelBooking();
  const updateStatusMutation = useUpdateBookingStatus();
  const addNoteMutation = useAddBookingNote();

  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortOrder('asc');
    }
  };

  const handleCancel = async () => {
    if (!cancelDialog.booking || !cancelReason.trim()) return;

    await cancelMutation.mutateAsync({
      id: cancelDialog.booking.id,
      data: {
        reason: cancelReason.trim(),
        refundAmount: refundAmount !== '' ? Number(refundAmount) : undefined,
        notifyCustomer,
      },
    });

    setCancelDialog({ open: false, booking: null });
    setCancelReason('');
    setRefundAmount('');
    setNotifyCustomer(true);
  };

  const handleUpdateStatus = async () => {
    if (!statusDialog.booking || !newStatus || !statusReason.trim()) return;

    await updateStatusMutation.mutateAsync({
      id: statusDialog.booking.id,
      data: {
        status: newStatus,
        reason: statusReason.trim(),
      },
    });

    setStatusDialog({ open: false, booking: null });
    setNewStatus('');
    setStatusReason('');
  };

  const handleAddNote = async () => {
    if (!noteDialog.booking || !note.trim()) return;

    await addNoteMutation.mutateAsync({
      id: noteDialog.booking.id,
      note: note.trim(),
    });

    setNoteDialog({ open: false, booking: null });
    setNote('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'disputed':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const columns: Column<Booking>[] = [
    {
      id: 'bookingNumber',
      header: 'Booking #',
      accessor: (booking) => booking.bookingNumber || 'N/A',
      sortable: true,
    },
    {
      id: 'customer',
      header: 'Customer',
      accessor: (booking) => booking.customer?.name || 'N/A',
    },
    {
      id: 'listing',
      header: 'Listing',
      accessor: (booking) => booking.listing?.title || 'N/A',
    },
    {
      id: 'seller',
      header: 'Seller',
      accessor: (booking) => booking.seller?.businessName || 'N/A',
    },
    {
      id: 'checkIn',
      header: 'Check-in',
      accessor: (booking) => new Date(booking.checkIn).toLocaleDateString(),
      sortable: true,
    },
    {
      id: 'totalAmount',
      header: 'Amount',
      accessor: (booking) => `BDT ${booking.totalAmount?.toLocaleString() || 0}`,
      sortable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (booking) => (
        <Badge className={getStatusColor(booking.status)}>{booking.status || 'pending'}</Badge>
      ),
      sortable: true,
    },
    {
      id: 'createdAt',
      header: 'Booked',
      accessor: (booking) => new Date(booking.createdAt).toLocaleDateString(),
      sortable: true,
    },
  ];

  const renderActions = (booking: Booking) => (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => setStatusDialog({ open: true, booking })}>
        Update Status
      </Button>
      <Button variant="outline" size="sm" onClick={() => setNoteDialog({ open: true, booking })}>
        <FileText className="h-4 w-4" />
      </Button>
      {booking.status !== 'cancelled' && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setCancelDialog({ open: true, booking })}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Booking Management</h1>
        <Card className="mt-4 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error.message || 'Booking management requires database schema implementation.'}
          </p>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Required Implementation:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Create bookings table in database schema</li>
              <li>Link bookings to listings and users</li>
              <li>Add booking status field (pending, confirmed, completed, cancelled, disputed)</li>
              <li>Implement booking cancellation and refund logic</li>
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
          <h1 className="text-2xl font-bold">Booking Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage customer bookings
          </p>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue (Month)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                BDT {stats.revenue?.thisMonth?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
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
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="disputed">Disputed</option>
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
        data={data?.bookings || []}
        columns={columns}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        totalItems={data?.pagination.total}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        searchable
        searchPlaceholder="Search by booking number, customer, or listing..."
        onSearch={(query) => {
          setSearch(query);
          setPage(1);
        }}
        getRowId={(booking) => booking.id}
        actions={renderActions}
        emptyMessage="No bookings found"
      />

      {/* Cancel Booking Dialog */}
      <Dialog
        open={cancelDialog.open}
        onOpenChange={(open) => !open && setCancelDialog({ open: false, booking: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Cancel this booking and optionally process a refund
            </DialogDescription>
          </DialogHeader>

          {cancelDialog.booking && (
            <div className="space-y-4">
              <div>
                <Label>Booking</Label>
                <p className="text-sm">{cancelDialog.booking.bookingNumber}</p>
              </div>

              <div>
                <Label>Cancellation Reason *</Label>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Explain why this booking is being cancelled..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Refund Amount (BDT)</Label>
                <Input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Leave empty for no refund"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total booking amount: BDT {cancelDialog.booking.totalAmount?.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notifyCustomer"
                  checked={notifyCustomer}
                  onChange={(e) => setNotifyCustomer(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="notifyCustomer" className="cursor-pointer">
                  Notify customer via email
                </Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setCancelDialog({ open: false, booking: null });
                setCancelReason('');
                setRefundAmount('');
                setNotifyCustomer(true);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={!cancelReason.trim() || cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={statusDialog.open}
        onOpenChange={(open) => !open && setStatusDialog({ open: false, booking: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>Change the status of this booking</DialogDescription>
          </DialogHeader>

          {statusDialog.booking && (
            <div className="space-y-4">
              <div>
                <Label>Booking</Label>
                <p className="text-sm">{statusDialog.booking.bookingNumber}</p>
              </div>

              <div>
                <Label>New Status *</Label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="">Select status...</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="disputed">Disputed</option>
                </select>
              </div>

              <div>
                <Label>Reason *</Label>
                <Textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Explain why the status is being changed..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setStatusDialog({ open: false, booking: null });
                setNewStatus('');
                setStatusReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={!newStatus || !statusReason.trim() || updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog
        open={noteDialog.open}
        onOpenChange={(open) => !open && setNoteDialog({ open: false, booking: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>Add an internal note to this booking</DialogDescription>
          </DialogHeader>

          {noteDialog.booking && (
            <div className="space-y-4">
              <div>
                <Label>Booking</Label>
                <p className="text-sm">{noteDialog.booking.bookingNumber}</p>
              </div>

              <div>
                <Label>Note *</Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter your note..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setNoteDialog({ open: false, booking: null });
                setNote('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!note.trim() || addNoteMutation.isPending}>
              {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
