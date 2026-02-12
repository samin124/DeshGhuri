import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface Column<T> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  // Pagination
  page?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  // Selection
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  getRowId?: (row: T) => string;
  // Actions
  actions?: (row: T) => React.ReactNode;
  bulkActions?: (selectedIds: Set<string>) => React.ReactNode;
  // Empty state
  emptyMessage?: string;
  // Mobile
  mobileCardRender?: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  page = 1,
  pageSize = 10,
  totalItems,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortOrder = 'asc',
  onSort,
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  getRowId = (row: T) => (row as { id: string }).id,
  actions,
  bulkActions,
  emptyMessage = 'No data available',
  mobileCardRender,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');

  const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : 1;
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems || data.length);

  const handleSort = (columnId: string) => {
    if (onSort) {
      onSort(columnId);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    const allIds = new Set(data.map(getRowId));
    if (selectedIds.size === data.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(allIds);
    }
  };

  const handleSelectRow = (id: string) => {
    if (!onSelectionChange) return;

    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    onSelectionChange(newSelection);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search and bulk actions */}
      {(searchable || (bulkActions && selectedIds.size > 0)) && (
        <div className="flex items-center justify-between gap-4">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {bulkActions && selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedIds.size} selected
              </span>
              {bulkActions(selectedIds)}
            </div>
          )}
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 ${column.className || ''}`}
                >
                  {column.sortable && onSort ? (
                    <button
                      onClick={() => handleSort(column.id)}
                      className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                      {column.header}
                      {sortBy === column.id &&
                        (sortOrder === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((row, _index) => {
              const rowId = getRowId(row);
              const isSelected = selectedIds.has(rowId);

              return (
                <tr
                  key={rowId}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowId)}
                        className="rounded border-gray-300"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={`px-4 py-3 text-sm text-gray-900 dark:text-gray-100 ${column.className || ''}`}
                    >
                      {column.accessor(row)}
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.map((row) => {
          const rowId = getRowId(row);
          const isSelected = selectedIds.has(rowId);

          return (
            <div
              key={rowId}
              className={`p-4 border rounded-lg ${
                isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' : ''
              }`}
            >
              {selectable && (
                <div className="mb-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectRow(rowId)}
                    className="rounded border-gray-300"
                  />
                </div>
              )}

              {mobileCardRender ? (
                mobileCardRender(row)
              ) : (
                <div className="space-y-2">
                  {columns.map((column) => (
                    <div key={column.id}>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {column.header}:
                      </span>{' '}
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {column.accessor(row)}
                      </span>
                    </div>
                  ))}
                  {actions && <div className="mt-3 pt-3 border-t">{actions(row)}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {onPageChange && totalItems && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startItem} to {endItem} of {totalItems} results
          </div>

          <div className="flex items-center gap-2">
            {onPageSizeChange && (
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>

            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
