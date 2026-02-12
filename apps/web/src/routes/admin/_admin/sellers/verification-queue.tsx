import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Eye, Clock, AlertTriangle } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useSellerVerificationQueue } from '@/hooks/use-admin-queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/admin/_admin/sellers/verification-queue')({
  component: RouteComponent,
});

interface Seller {
  id: string;
  businessName: string;
  category: string;
  contactEmail: string;
  verificationStatus: string;
  createdAt: string;
  daysPending: number;
  priority: 'low' | 'medium' | 'high';
  user: {
    id: string;
    name: string;
    email: string;
  };
  documents: Array<{
    id: string;
    documentType: string;
    status: string;
    uploadedAt: string;
  }>;
}

function RouteComponent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data, isLoading, error } = useSellerVerificationQueue({
    page,
    limit: pageSize,
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-review':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'agency':
        return 'Travel Agency';
      case 'hotel':
        return 'Hotel';
      case 'tour-operator':
        return 'Tour Operator';
      default:
        return category;
    }
  };

  const columns: Column<Seller>[] = [
    {
      id: 'priority',
      header: 'Priority',
      accessor: (seller) => (
        <div className="flex items-center gap-2">
          <Badge className={getPriorityColor(seller.priority)}>
            {seller.priority.toUpperCase()}
          </Badge>
          {seller.priority === 'high' && <AlertTriangle className="h-4 w-4 text-red-600" />}
        </div>
      ),
    },
    {
      id: 'daysPending',
      header: 'Waiting',
      accessor: (seller) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span>
            {seller.daysPending} {seller.daysPending === 1 ? 'day' : 'days'}
          </span>
        </div>
      ),
    },
    {
      id: 'businessName',
      header: 'Business Name',
      accessor: (seller) => seller.businessName,
    },
    {
      id: 'category',
      header: 'Category',
      accessor: (seller) => getCategoryLabel(seller.category),
    },
    {
      id: 'contactEmail',
      header: 'Contact Email',
      accessor: (seller) => seller.contactEmail,
    },
    {
      id: 'verificationStatus',
      header: 'Status',
      accessor: (seller) => (
        <Badge className={getStatusColor(seller.verificationStatus)}>
          {seller.verificationStatus}
        </Badge>
      ),
    },
    {
      id: 'documents',
      header: 'Documents',
      accessor: (seller) => {
        const total = seller.documents.length;
        const pending = seller.documents.filter((d) => d.status === 'pending').length;
        const approved = seller.documents.filter((d) => d.status === 'approved').length;

        return (
          <div className="text-sm">
            <span className="text-green-600 font-medium">{approved}</span> / <span>{total}</span>
            {pending > 0 && <span className="ml-2 text-yellow-600">({pending} pending)</span>}
          </div>
        );
      },
    },
  ];

  const renderActions = (seller: Seller) => (
    <Link to="/admin/sellers/$sellerId" params={{ sellerId: seller.id }}>
      <Button variant="default" size="sm">
        <Eye className="h-4 w-4 mr-2" />
        Review Now
      </Button>
    </Link>
  );

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Verification Queue</h1>
        <p className="text-red-600 mt-2">Error loading queue: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Verification Queue</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sellers pending verification, sorted by wait time (oldest first)
          </p>
        </div>
        <Link to="/admin/sellers">
          <Button variant="outline">View All Sellers</Button>
        </Link>
      </div>

      {/* Priority Legend */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <span className="text-sm font-medium">Priority Legend:</span>
        <div className="flex items-center gap-2">
          <Badge className={getPriorityColor('high')}>HIGH</Badge>
          <span className="text-sm text-gray-600 dark:text-gray-400">&gt; 7 days</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getPriorityColor('medium')}>MEDIUM</Badge>
          <span className="text-sm text-gray-600 dark:text-gray-400">3-7 days</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getPriorityColor('low')}>LOW</Badge>
          <span className="text-sm text-gray-600 dark:text-gray-400">&lt; 3 days</span>
        </div>
      </div>

      {/* Queue Stats */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total in Queue</p>
            <p className="text-2xl font-bold">{data.pagination.total}</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
            <p className="text-2xl font-bold text-red-600">
              {data.sellers.filter((s: Seller) => s.priority === 'high').length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Wait Time</p>
            <p className="text-2xl font-bold">
              {data.sellers.length > 0
                ? Math.round(
                    data.sellers.reduce((acc: number, s: Seller) => acc + s.daysPending, 0) /
                      data.sellers.length
                  )
                : 0}{' '}
              days
            </p>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={data?.sellers || []}
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
        getRowId={(seller) => seller.id}
        actions={renderActions}
        emptyMessage="No sellers in verification queue"
      />
    </div>
  );
}
