import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Eye, Download, FileCheck, XCircle } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useDocuments } from '@/hooks/use-admin-queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const Route = createFileRoute('/admin/_admin/documents/')({
  component: RouteComponent,
});

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  status: string;
  rejectionReason: string | null;
  uploadedAt: string;
  reviewedAt: string | null;
  seller: {
    id: string;
    businessName: string;
    verificationStatus: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  reviewer: {
    id: string;
    name: string;
    email: string;
  } | null;
}

function RouteComponent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const { data, isLoading, error } = useDocuments({
    page,
    limit: pageSize,
    search,
    status: statusFilter || undefined,
    documentType: typeFilter || undefined,
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
      default:
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'trade-license': 'Trade License',
      nid: 'National ID',
      passport: 'Passport',
      'tin-certificate': 'TIN Certificate',
      'property-docs': 'Property Documents',
      'tour-license': 'Tour License',
    };
    return labels[type] || type;
  };

  const columns: Column<Document>[] = [
    {
      id: 'documentType',
      header: 'Document Type',
      accessor: (doc) => getDocumentTypeLabel(doc.documentType),
      sortable: true,
    },
    {
      id: 'fileName',
      header: 'File Name',
      accessor: (doc) => (
        <span className="text-sm truncate max-w-xs block" title={doc.fileName}>
          {doc.fileName}
        </span>
      ),
    },
    {
      id: 'seller',
      header: 'Seller',
      accessor: (doc) => (
        <div className="text-sm">
          <p className="font-medium">{doc.seller.businessName}</p>
          <p className="text-gray-500 text-xs">{doc.seller.user.email}</p>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (doc) => <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>,
      sortable: true,
    },
    {
      id: 'uploadedAt',
      header: 'Uploaded',
      accessor: (doc) => new Date(doc.uploadedAt).toLocaleDateString(),
      sortable: true,
    },
    {
      id: 'reviewedAt',
      header: 'Reviewed',
      accessor: (doc) => (doc.reviewedAt ? new Date(doc.reviewedAt).toLocaleDateString() : '-'),
    },
  ];

  const renderActions = (doc: Document) => (
    <div className="flex gap-2">
      <Button variant="ghost" size="sm" onClick={() => setSelectedDocument(doc)}>
        <Eye className="h-4 w-4 mr-2" />
        View
      </Button>
    </div>
  );

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="text-red-600 mt-2">Error loading documents: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Document Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and manage seller verification documents
          </p>
        </div>
      </div>
      {/* Stats */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {data.documents.filter((d: Document) => d.status === 'pending').length}
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">Approved</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {data.documents.filter((d: Document) => d.status === 'approved').length}
            </p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">Rejected</p>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">
              {data.documents.filter((d: Document) => d.status === 'rejected').length}
            </p>
          </div>
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
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Document Type</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border rounded text-sm min-w-[200px]"
          >
            <option value="">All Types</option>
            <option value="trade-license">Trade License</option>
            <option value="nid">National ID</option>
            <option value="passport">Passport</option>
            <option value="tin-certificate">TIN Certificate</option>
            <option value="property-docs">Property Documents</option>
            <option value="tour-license">Tour License</option>
          </select>
        </div>
      </div>
      {/* Data Table */}
      <DataTable
        data={data?.documents || []}
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
        searchPlaceholder="Search by file name..."
        onSearch={(query) => {
          setSearch(query);
          setPage(1);
        }}
        getRowId={(doc) => doc.id}
        actions={renderActions}
        emptyMessage="No documents found"
      />
      {/* Document Detail Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDocument && getDocumentTypeLabel(selectedDocument.documentType)}
            </DialogTitle>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              {/* Document Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    File Name
                  </label>
                  <p className="text-sm">{selectedDocument.fileName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Status
                  </label>
                  <p className="text-sm">
                    <Badge className={getStatusColor(selectedDocument.status)}>
                      {selectedDocument.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Uploaded
                  </label>
                  <p className="text-sm">
                    {new Date(selectedDocument.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Reviewed
                  </label>
                  <p className="text-sm">
                    {selectedDocument.reviewedAt
                      ? new Date(selectedDocument.reviewedAt).toLocaleString()
                      : 'Not reviewed'}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Seller
                  </label>
                  <p className="text-sm">
                    {selectedDocument.seller.businessName} ({selectedDocument.seller.user.email})
                  </p>
                </div>
                {selectedDocument.reviewer && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Reviewed By
                    </label>
                    <p className="text-sm">
                      {selectedDocument.reviewer.name || selectedDocument.reviewer.email}
                    </p>
                  </div>
                )}
                {selectedDocument.rejectionReason && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-red-600 dark:text-red-400">
                      Rejection Reason
                    </label>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {selectedDocument.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Document Preview */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 flex items-center justify-between">
                  <p className="text-sm font-medium">Document Preview</p>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={selectedDocument.fileUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
                <div className="p-4">
                  {selectedDocument.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={selectedDocument.fileUrl}
                      alt={selectedDocument.fileName}
                      className="w-full h-auto rounded"
                    />
                  ) : selectedDocument.fileUrl.match(/\.pdf$/i) ? (
                    <iframe
                      src={selectedDocument.fileUrl}
                      className="w-full h-[600px]"
                      title={selectedDocument.fileName}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-gray-500">Preview not available</p>
                      <Button
                        variant="link"
                        onClick={() => window.open(selectedDocument.fileUrl, '_blank')}
                        className="mt-2"
                      >
                        Open in new tab
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
