import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { MoreVertical, UserX, Trash2, Eye } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useUsers, useUpdateUser, useDeleteUser } from '@/hooks/use-admin-queries';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/_admin/users/')({
  component: RouteComponent,
});

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  roles: Array<{
    id: string;
    role: string;
  }>;
}

function RouteComponent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string | null;
  }>({ isOpen: false, userId: null, userName: null });

  const { data, isLoading, error } = useUsers({
    page,
    limit: pageSize,
    search,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
    sortBy,
    sortOrder,
  });

  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortOrder('asc');
    }
  };

  const handleSuspend = async (userId: string, isBanned: boolean) => {
    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        data: {
          action: isBanned ? 'reactivate' : 'suspend',
          reason: isBanned ? 'Account reactivated by admin' : 'Suspended by admin',
        },
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.userId) return;

    try {
      await deleteUserMutation.mutateAsync({
        id: deleteDialog.userId,
        reason: 'Deleted by admin',
      });
      setDeleteDialog({ isOpen: false, userId: null, userName: null });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const columns: Column<User>[] = [
    {
      id: 'name',
      header: 'Name',
      accessor: (user) => user.name || 'N/A',
      sortable: true,
    },
    {
      id: 'email',
      header: 'Email',
      accessor: (user) => (
        <div className="flex items-center gap-2">
          <span>{user.email}</span>
          {!user.emailVerified && (
            <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
              Unverified
            </span>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'roles',
      header: 'Roles',
      accessor: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles && user.roles.length > 0 ? (
            user.roles.map((r) => (
              <span
                key={r.id}
                className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
              >
                {r.role}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">No roles</span>
          )}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (user) => (
        <span
          className={`text-xs px-2 py-1 rounded ${
            user.banned
              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
          }`}
        >
          {user.banned ? 'Suspended' : 'Active'}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'createdAt',
      header: 'Joined',
      accessor: (user) => new Date(user.createdAt).toLocaleDateString(),
      sortable: true,
    },
  ];

  const renderActions = (user: User) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/admin/users/$userId" params={{ userId: user.id }}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSuspend(user.id, user.banned)}
          disabled={updateUserMutation.isPending}
        >
          <UserX className="h-4 w-4 mr-2" />
          {user.banned ? 'Reactivate' : 'Suspend'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            setDeleteDialog({ isOpen: true, userId: user.id, userName: user.name || user.email })
          }
          className="text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderBulkActions = (selectedIds: Set<string>) => (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => {
        toast.info('Bulk actions coming soon');
      }}
    >
      Bulk Actions
    </Button>
  );

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-red-600 mt-2">Error loading users: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border rounded text-sm min-w-[150px]"
          >
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
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
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="unverified">Unverified Email</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={data?.users || []}
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
        searchPlaceholder="Search by name or email..."
        onSearch={(query) => {
          setSearch(query);
          setPage(1);
        }}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(user) => user.id}
        actions={renderActions}
        bulkActions={renderBulkActions}
        emptyMessage="No users found"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) =>
        !open && setDeleteDialog({ isOpen: false, userId: null, userName: null })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete user "{deleteDialog.userName}"? This action cannot be
              undone and will permanently delete the user's account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
