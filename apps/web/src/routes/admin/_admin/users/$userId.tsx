import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, UserX, Trash2, Mail, Calendar, Shield, X, Plus } from 'lucide-react';
import {
  useUser,
  useUpdateUser,
  useDeleteUser,
  useAddUserRole,
  useRemoveUserRole,
} from '@/hooks/use-admin-queries';
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/admin/_admin/users/$userId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useUser(userId);
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const addRoleMutation = useAddUserRole();
  const removeRoleMutation = useRemoveUserRole();

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [addRoleDialog, setAddRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState('customer');

  const handleSuspend = async () => {
    if (!data?.user) return;

    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        data: {
          action: data.user.banned ? 'reactivate' : 'suspend',
          reason: data.user.banned ? 'Account reactivated by admin' : 'Suspended by admin',
        },
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUserMutation.mutateAsync({
        id: userId,
        reason: 'Deleted by admin',
      });
      setDeleteDialog(false);
      navigate({ to: '/admin/users' });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleAddRole = async () => {
    try {
      await addRoleMutation.mutateAsync({
        id: userId,
        role: selectedRole,
      });
      setAddRoleDialog(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      await removeRoleMutation.mutateAsync({
        id: userId,
        roleId,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">User Details</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Loading user details...</p>
      </div>
    );
  }

  if (error || !data?.user) {
    return (
      <div>
        <h1 className="text-2xl font-bold">User Details</h1>
        <p className="text-red-600 mt-2">
          Error loading user: {error?.message || 'User not found'}
        </p>
      </div>
    );
  }

  const { user, seller } = data;
  const availableRoles = ['customer', 'seller', 'admin', 'super_admin'].filter(
    (role) => !user.roles?.some((r: any) => r.role === role)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{user.name || 'N/A'}</h1>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={user.banned ? 'default' : 'outline'}
            onClick={handleSuspend}
            disabled={updateUserMutation.isPending}
          >
            <UserX className="h-4 w-4 mr-2" />
            {user.banned ? 'Reactivate' : 'Suspend'}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialog(true)}
            disabled={deleteUserMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {user.banned && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">Account Suspended</p>
          {user.banReason && (
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">Reason: {user.banReason}</p>
          )}
          {user.banExpires && (
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Expires: {new Date(user.banExpires).toLocaleString()}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <dl className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                  <dd className="text-sm mt-1 flex items-center gap-2">
                    {user.email}
                    {user.emailVerified ? (
                      <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                        Verified
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                        Unverified
                      </span>
                    )}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined</dt>
                  <dd className="text-sm mt-1">{new Date(user.createdAt).toLocaleString()}</dd>
                </div>
              </div>
              {user.updatedAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Last Updated
                    </dt>
                    <dd className="text-sm mt-1">{new Date(user.updatedAt).toLocaleString()}</dd>
                  </div>
                </div>
              )}
            </dl>
          </div>

          {/* Seller Information */}
          {seller && (
            <div className="border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Seller Information</h2>
                <Link to="/admin/sellers/$sellerId" params={{ sellerId: seller.id }}>
                  <Button variant="outline" size="sm">
                    View Seller Details
                  </Button>
                </Link>
              </div>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Business Name
                  </dt>
                  <dd className="text-sm mt-1">{seller.businessName || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Verification Status
                  </dt>
                  <dd className="text-sm mt-1">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        seller.verificationStatus === 'approved'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : seller.verificationStatus === 'rejected'
                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            : seller.verificationStatus === 'in-review'
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}
                    >
                      {seller.verificationStatus}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Contact Email
                  </dt>
                  <dd className="text-sm mt-1">{seller.contactEmail || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Contact Phone
                  </dt>
                  <dd className="text-sm mt-1">{seller.contactPhone || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Roles */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Roles</h2>
              </div>
              {availableRoles.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setAddRoleDialog(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((role: any) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded"
                  >
                    <span className="text-sm font-medium capitalize">{role.role}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRole(role.id)}
                      disabled={removeRoleMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No roles assigned</p>
              )}
            </div>
          </div>

          {/* Account Status */}
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Account Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    user.banned
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  }`}
                >
                  {user.banned ? 'Suspended' : 'Active'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Email Verified</span>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    user.emailVerified
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  }`}
                >
                  {user.emailVerified ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{user.name || user.email}"? This action cannot be
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

      {/* Add Role Dialog */}
      <Dialog open={addRoleDialog} onOpenChange={setAddRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
            <DialogDescription>Select a role to assign to this user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRole} disabled={addRoleMutation.isPending}>
              {addRoleMutation.isPending ? 'Adding...' : 'Add Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
