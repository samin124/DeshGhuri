import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useDashboardStats, usePendingActions } from '@/hooks/use-admin-queries';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Store, FileText, Shield, AlertCircle, Clock, CheckCircle } from 'lucide-react';

export const Route = createFileRoute('/admin/_admin/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: pending, isLoading: pendingLoading } = usePendingActions();

  // Redirect if user is not authorized
  useEffect(() => {
    if (statsError && 'status' in statsError && (statsError.status === 401 || statsError.status === 403)) {
      navigate({ to: '/dashboard' });
    }
  }, [statsError, navigate]);

  if (statsLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Loading dashboard stats...
        </p>
      </div>
    );
  }

  if (statsError) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-red-600 mt-2">
          Error loading dashboard: {statsError.message || 'Unauthorized'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome to the DeshGhuri admin panel
        </p>
      </div>

      {/* Main Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-3xl font-bold mt-2">{stats.users.total}</p>
                {stats.users.newToday > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    +{stats.users.newToday} today
                  </p>
                )}
              </div>
              <Users className="h-10 w-10 text-blue-500 opacity-75" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sellers</p>
                <p className="text-3xl font-bold mt-2">{stats.sellers.total}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {stats.sellers.approved} approved
                </p>
              </div>
              <Store className="h-10 w-10 text-purple-500 opacity-75" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Verification</p>
                <p className="text-3xl font-bold mt-2">{stats.sellers.pendingVerification}</p>
                {stats.sellers.inReview > 0 && (
                  <p className="text-sm text-blue-600 mt-1">
                    {stats.sellers.inReview} in review
                  </p>
                )}
              </div>
              <AlertCircle className="h-10 w-10 text-yellow-500 opacity-75" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Documents</p>
                <p className="text-3xl font-bold mt-2">{stats.documents.pending}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  of {stats.documents.total} total
                </p>
              </div>
              <FileText className="h-10 w-10 text-orange-500 opacity-75" />
            </div>
          </Card>
        </div>
      )}

      {/* Pending Actions */}
      {pending && !pendingLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Sellers */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Seller Verifications
              </h2>
              <Link to="/admin/sellers/verification-queue">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            {pending.pendingSellers && pending.pendingSellers.length > 0 ? (
              <div className="space-y-3">
                {pending.pendingSellers.slice(0, 5).map((seller: any) => (
                  <Link
                    key={seller.id}
                    to="/admin/sellers/$sellerId"
                    params={{ sellerId: seller.id }}
                    className="block p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{seller.businessName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {seller.contactEmail}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {seller.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Applied {new Date(seller.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending verifications</p>
              </div>
            )}
          </Card>

          {/* In Review Sellers */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                In Review
              </h2>
              <Link to="/admin/sellers">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            {pending.inReviewSellers && pending.inReviewSellers.length > 0 ? (
              <div className="space-y-3">
                {pending.inReviewSellers.slice(0, 5).map((seller: any) => (
                  <Link
                    key={seller.id}
                    to="/admin/sellers/$sellerId"
                    params={{ sellerId: seller.id }}
                    className="block p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{seller.businessName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {seller.contactEmail}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        In Review
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Started {new Date(seller.updatedAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No sellers in review</p>
              </div>
            )}
          </Card>

          {/* Pending Documents */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pending Documents
              </h2>
              <Link to="/admin/documents">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            {pending.pendingDocuments && pending.pendingDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pending.pendingDocuments.slice(0, 6).map((doc: any) => (
                  <div
                    key={doc.id}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm">{doc.documentType}</p>
                      <Badge variant="secondary" className="text-xs">
                        Pending
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {doc.seller.businessName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending documents</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
