import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Download, Eye, Activity, TrendingUp } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useAuditLogs, useAuditLogStats, exportAuditLogs } from '@/hooks/use-admin-queries';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const Route = createFileRoute('/admin/_admin/audit-logs/')({
  component: RouteComponent,
});

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: any;
  newValue: any;
  metadata: any;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

function RouteComponent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error } = useAuditLogs({
    page,
    limit: pageSize,
    action: actionFilter || undefined,
    entityType: entityTypeFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortOrder,
  });

  const { data: stats } = useAuditLogStats();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportAuditLogs({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('reject')) {
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
    }
    if (action.includes('create') || action.includes('approve')) {
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    }
    if (action.includes('update') || action.includes('review')) {
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    }
    return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  };

  const columns: Column<AuditLog>[] = [
    {
      id: 'createdAt',
      header: 'Timestamp',
      accessor: (log) => new Date(log.createdAt).toLocaleString(),
      sortable: true,
    },
    {
      id: 'user',
      header: 'User',
      accessor: (log) => (
        <div className="text-sm">
          <p className="font-medium">{log.user?.name || 'System'}</p>
          <p className="text-gray-500 text-xs">{log.user?.email || 'N/A'}</p>
        </div>
      ),
    },
    {
      id: 'action',
      header: 'Action',
      accessor: (log) => (
        <Badge className={getActionColor(log.action)}>
          {log.action}
        </Badge>
      ),
    },
    {
      id: 'entityType',
      header: 'Entity Type',
      accessor: (log) => (
        <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {log.entityType}
        </span>
      ),
    },
    {
      id: 'entityId',
      header: 'Entity ID',
      accessor: (log) => (
        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
          {log.entityId.substring(0, 12)}...
        </span>
      ),
    },
  ];

  const renderActions = (log: AuditLog) => (
    <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
      <Eye className="h-4 w-4 mr-2" />
      Details
    </Button>
  );

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-red-600 mt-2">Error loading audit logs: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track all administrative actions and changes
          </p>
        </div>
        <Button onClick={handleExport} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Logs</p>
                <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last 24 Hours</p>
                <p className="text-2xl font-bold">{stats.last24h.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last 7 Days</p>
                <p className="text-2xl font-bold">{stats.last7days.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Top Actions</p>
              <div className="space-y-1">
                {stats.topActions.slice(0, 3).map((item: any, idx: number) => (
                  <div key={idx} className="text-xs flex justify-between">
                    <span className="truncate">{item.action}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Action</label>
          <input
            type="text"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by action..."
            className="px-3 py-2 border rounded text-sm min-w-[200px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Entity Type</label>
          <select
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border rounded text-sm min-w-[150px]"
          >
            <option value="">All Types</option>
            <option value="user">User</option>
            <option value="seller">Seller</option>
            <option value="document">Document</option>
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

        <div>
          <label className="block text-sm font-medium mb-1">Sort Order</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-3 py-2 border rounded text-sm"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={data?.logs || []}
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
        getRowId={(log) => log.id}
        actions={renderActions}
        emptyMessage="No audit logs found"
      />

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Timestamp
                  </label>
                  <p className="text-sm">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    User
                  </label>
                  <p className="text-sm">
                    {selectedLog.user?.name || 'System'} ({selectedLog.user?.email || 'N/A'})
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Action
                  </label>
                  <p className="text-sm">
                    <Badge className={getActionColor(selectedLog.action)}>
                      {selectedLog.action}
                    </Badge>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Entity Type
                  </label>
                  <p className="text-sm font-mono">{selectedLog.entityType}</p>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Entity ID
                  </label>
                  <p className="text-sm font-mono">{selectedLog.entityId}</p>
                </div>
              </div>

              {selectedLog.oldValue && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                    Old Value
                  </label>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.oldValue, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newValue && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                    New Value
                  </label>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.newValue, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                    Metadata
                  </label>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
