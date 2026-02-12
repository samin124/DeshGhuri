import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  adminDashboard,
  adminUsers,
  adminSellers,
  adminDocuments,
  adminAuditLogs,
  adminListings,
  adminBookings,
  adminTransactions,
} from '@/lib/api/admin';

// Dashboard Queries
export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: adminDashboard.getStats,
  });
}

export function usePendingActions() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'pending-actions'],
    queryFn: adminDashboard.getPendingActions,
  });
}

// User Queries
export function useUsers(params?: Parameters<typeof adminUsers.list>[0]) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminUsers.list(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => adminUsers.getById(id),
    enabled: !!id,
  });
}

// User Mutations
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminUsers.update>[1] }) =>
      adminUsers.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminUsers.delete(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });
}

export function useAddUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminUsers.addRole(id, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Role added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add role');
    },
  });
}

export function useRemoveUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) =>
      adminUsers.removeRole(id, roleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Role removed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove role');
    },
  });
}

// Seller Queries
export function useSellers(params?: Parameters<typeof adminSellers.list>[0]) {
  return useQuery({
    queryKey: ['admin', 'sellers', params],
    queryFn: () => adminSellers.list(params),
  });
}

export function useSellerVerificationQueue(
  params?: Parameters<typeof adminSellers.getVerificationQueue>[0]
) {
  return useQuery({
    queryKey: ['admin', 'sellers', 'verification-queue', params],
    queryFn: () => adminSellers.getVerificationQueue(params),
  });
}

export function useSeller(id: string) {
  return useQuery({
    queryKey: ['admin', 'sellers', id],
    queryFn: () => adminSellers.getById(id),
    enabled: !!id,
  });
}

// Seller Mutations
export function useUpdateSellerVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof adminSellers.updateVerification>[1];
    }) => adminSellers.updateVerification(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Seller verification updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update seller verification');
    },
  });
}

export function useUpdateSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminSellers.update>[1] }) =>
      adminSellers.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
      toast.success('Seller updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update seller');
    },
  });
}

// Document Queries
export function useDocuments(params?: Parameters<typeof adminDocuments.list>[0]) {
  return useQuery({
    queryKey: ['admin', 'documents', params],
    queryFn: () => adminDocuments.list(params),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['admin', 'documents', id],
    queryFn: () => adminDocuments.getById(id),
    enabled: !!id,
  });
}

// Document Mutations
export function useReviewDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminDocuments.review>[1] }) =>
      adminDocuments.review(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'documents', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Document reviewed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to review document');
    },
  });
}

export function useBulkReviewDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sellerId,
      data,
    }: {
      sellerId: string;
      data: Parameters<typeof adminDocuments.bulkReview>[1];
    }) => adminDocuments.bulkReview(sellerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Documents reviewed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to bulk review documents');
    },
  });
}

// Audit Log Queries
export function useAuditLogs(params?: Parameters<typeof adminAuditLogs.list>[0]) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => adminAuditLogs.list(params),
  });
}

export function useAuditLogStats() {
  return useQuery({
    queryKey: ['admin', 'audit-logs', 'stats'],
    queryFn: adminAuditLogs.getStats,
  });
}

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', id],
    queryFn: () => adminAuditLogs.getById(id),
    enabled: !!id,
  });
}

// Export Audit Logs
export async function exportAuditLogs(params?: Parameters<typeof adminAuditLogs.export>[0]) {
  try {
    const blob = await adminAuditLogs.export(params);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Audit logs exported successfully');
  } catch (error) {
    toast.error('Failed to export audit logs');
    throw error;
  }
}

// Listing Queries
export function useListings(params?: Parameters<typeof adminListings.list>[0]) {
  return useQuery({
    queryKey: ['admin', 'listings', params],
    queryFn: () => adminListings.list(params),
  });
}

export function useListingReviewQueue(params?: Parameters<typeof adminListings.getReviewQueue>[0]) {
  return useQuery({
    queryKey: ['admin', 'listings', 'review-queue', params],
    queryFn: () => adminListings.getReviewQueue(params),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['admin', 'listings', id],
    queryFn: () => adminListings.getById(id),
    enabled: !!id,
  });
}

// Listing Mutations
export function useReviewListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminListings.review>[1] }) =>
      adminListings.review(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });
      toast.success('Listing reviewed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to review listing');
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminListings.update>[1] }) =>
      adminListings.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });
      toast.success('Listing updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update listing');
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminListings.delete(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });
      toast.success('Listing deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete listing');
    },
  });
}

// Booking Queries
export function useBookings(params?: Parameters<typeof adminBookings.list>[0]) {
  return useQuery({
    queryKey: ['admin', 'bookings', params],
    queryFn: () => adminBookings.list(params),
  });
}

export function useBookingStats() {
  return useQuery({
    queryKey: ['admin', 'bookings', 'stats'],
    queryFn: adminBookings.getStats,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['admin', 'bookings', id],
    queryFn: () => adminBookings.getById(id),
    enabled: !!id,
  });
}

// Booking Mutations
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminBookings.cancel>[1] }) =>
      adminBookings.cancel(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      toast.success('Booking cancelled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel booking');
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof adminBookings.updateStatus>[1];
    }) => adminBookings.updateStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      toast.success('Booking status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update booking status');
    },
  });
}

export function useAddBookingNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => adminBookings.addNote(id, note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings', variables.id] });
      toast.success('Note added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add note');
    },
  });
}

// Transaction Queries
export function useTransactions(params?: Parameters<typeof adminTransactions.list>[0]) {
  return useQuery({
    queryKey: ['admin', 'transactions', params],
    queryFn: () => adminTransactions.list(params),
  });
}

export function useTransactionStats() {
  return useQuery({
    queryKey: ['admin', 'transactions', 'stats'],
    queryFn: adminTransactions.getStats,
  });
}

export function useEscrowOverview() {
  return useQuery({
    queryKey: ['admin', 'escrow', 'overview'],
    queryFn: adminTransactions.getEscrowOverview,
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['admin', 'transactions', id],
    queryFn: () => adminTransactions.getById(id),
    enabled: !!id,
  });
}

// Transaction Mutations
export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof adminTransactions.processRefund>[0]) =>
      adminTransactions.processRefund(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      toast.success('Refund processed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to process refund');
    },
  });
}

export function useReleaseEscrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof adminTransactions.releaseEscrow>[1];
    }) => adminTransactions.releaseEscrow(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'escrow'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] });
      toast.success('Escrow released successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to release escrow');
    },
  });
}

export function useHoldEscrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminTransactions.holdEscrow(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'escrow'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] });
      toast.success('Escrow held successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to hold escrow');
    },
  });
}
