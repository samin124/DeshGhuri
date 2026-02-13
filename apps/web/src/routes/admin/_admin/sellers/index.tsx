import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Eye, FileCheck, AlertCircle } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useSellers } from '@/hooks/use-admin-queries';
import { Button } from '@/components/ui/button';
import { VerifiedBadge } from '@/components/seller/verified-badge';

export const Route = createFileRoute('/admin/_admin/sellers/')({
  component: RouteComponent,
});

interface Seller {
  id: string;
  businessName: string;
  category: string;
  contactEmail: string;
  contactPhone: string;
  verificationStatus: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  documents: Array<{
    id: string;
    documentType: string;
    status: string;
  }>;
}

function RouteComponent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, error } = useSellers({
    page,
    limit: pageSize,
    search,
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    sortBy,
    sortOrder,
  });

  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortOrder('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'in-review':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'incomplete':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
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
      id: 'businessName',
      header: 'Business Name',
      accessor: (seller) => (
        <div className="flex items-center gap-2">
          <span>{seller.businessName}</span>
          {seller.verificationStatus === 'approved' && <VerifiedBadge size="sm" showText={false} />}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'category',
      header: 'Category',
      accessor: (seller) => getCategoryLabel(seller.category),
      sortable: true,
    },
    {
      id: 'contactEmail',
      header: 'Contact Email',
      accessor: (seller) => seller.contactEmail,
      sortable: true,
    },
    {
      id: 'verificationStatus',
      header: 'Status',
      accessor: (seller) => (
        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(seller.verificationStatus)}`}>
          {seller.verificationStatus}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'documents',
      header: 'Documents',
      accessor: (seller) => {
        const total = seller.documents.length;
        const approved = seller.documents.filter((d) => d.status === 'approved').length;
        const pending = seller.documents.filter((d) => d.status === 'pending').length;

        return (
          <div className="flex items-center gap-2 text-sm">
            <FileCheck className="h-4 w-4 text-green-600" />
            <span>
              {approved}/{total}
            </span>
            {pending > 0 && (
              <>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-600">{pending} pending</span>
              </>
            )}
          </div>
        );
      },
    },
    {
      id: 'createdAt',
      header: 'Applied',
      accessor: (seller) => new Date(seller.createdAt).toLocaleDateString(),
      sortable: true,
    },
  ];

  const renderActions = (seller: Seller) => (
    <Link to="/admin/sellers/$sellerId" params={{ sellerId: seller.id }}>
      <Button variant="ghost" size="sm">
        <Eye className="h-4 w-4 mr-2" />
        Review
      </Button>
    </Link>
  );

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Seller Verification</h1>
        <p className="text-red-600 mt-2">Error loading sellers: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Seller Verification</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and manage seller applications and verification status
          </p>
        </div>
        <Link to="/admin/sellers/verification-queue">
          <Button>
            <FileCheck className="h-4 w-4 mr-2" />
            Verification Queue
          </Button>
        </Link>
      </div>

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
            className="w-full sm:w-auto px-3 py-2 border rounded text-sm sm:min-w-[150px]"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto px-3 py-2 border rounded text-sm sm:min-w-[150px]"
          >
            <option value="">All Categories</option>
            <option value="agency">Travel Agency</option>
            <option value="hotel">Hotel</option>
            <option value="tour-operator">Tour Operator</option>
          </select>
        </div>
      </div>

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
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        searchable
        searchPlaceholder="Search by business name, email, or registration..."
        onSearch={(query) => {
          setSearch(query);
          setPage(1);
        }}
        getRowId={(seller) => seller.id}
        actions={renderActions}
        emptyMessage="No sellers found"
      />
    </div>
  );
}
