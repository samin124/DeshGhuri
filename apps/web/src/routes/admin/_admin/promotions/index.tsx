import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Plus, Calendar, Clock, Percent, Tag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/admin/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const Route = createFileRoute('/admin/_admin/promotions/')({
  component: RouteComponent,
});

interface Promotion {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  code?: string;
  startDate: string;
  endDate: string;
  targetType: 'all' | 'category' | 'seller' | 'listing';
  targetValue?: string;
  maxUses?: number;
  currentUses: number;
  status: 'active' | 'scheduled' | 'expired' | 'paused';
  createdAt: string;
}

function RouteComponent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock data - replace with actual API call
  const promotions: Promotion[] = [];
  const isLoading = false;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'scheduled':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'expired':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      case 'paused':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const columns: Column<Promotion>[] = [
    {
      id: 'title',
      header: 'Promotion',
      accessor: (promo) => (
        <div>
          <div className="font-medium">{promo.title}</div>
          {promo.code && (
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {promo.code}
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'discount',
      header: 'Discount',
      accessor: (promo) => (
        <div className="flex items-center gap-1">
          <Percent className="h-4 w-4 text-green-600" />
          {promo.discountType === 'percentage'
            ? `${promo.discountValue}%`
            : `৳${promo.discountValue}`}
        </div>
      ),
    },
    {
      id: 'period',
      header: 'Period',
      accessor: (promo) => (
        <div className="text-sm">
          <div>{new Date(promo.startDate).toLocaleDateString()}</div>
          <div className="text-gray-500">to {new Date(promo.endDate).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      id: 'usage',
      header: 'Usage',
      accessor: (promo) => (
        <div className="text-sm">
          {promo.currentUses}
          {promo.maxUses && ` / ${promo.maxUses}`}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (promo) => (
        <Badge className={getStatusColor(promo.status)}>
          {promo.status}
        </Badge>
      ),
      sortable: true,
    },
  ];

  const renderActions = (promo: Promotion) => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm">
        <Eye className="h-4 w-4 mr-1" />
        View
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={promo.status === 'expired'}
      >
        {promo.status === 'paused' ? 'Resume' : 'Pause'}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promotions & Deals</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage flash deals, coupons, and promotional campaigns
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Promotion
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Promotions</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Uses This Month</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Tag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Discounted</p>
              <p className="text-2xl font-bold">৳0</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-between">
              <Percent className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search promotions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <DataTable
          columns={columns}
          data={promotions}
          isLoading={isLoading}
          page={page}
          pageSize={pageSize}
          totalItems={0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          renderActions={renderActions}
        />
      </Card>

      {/* Create Promotion Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Promotion</DialogTitle>
            <DialogDescription>
              Create a new promotional campaign or flash deal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Promotion Title</Label>
              <Input id="title" placeholder="Summer Sale 2026" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this promotion..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discountType">Discount Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discountValue">Discount Value</Label>
                <Input
                  id="discountValue"
                  type="number"
                  placeholder="10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="code">Promo Code (Optional)</Label>
              <Input id="code" placeholder="SUMMER2026" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" />
              </div>
            </div>
            <div>
              <Label htmlFor="targetType">Target</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Listings</SelectItem>
                  <SelectItem value="category">Specific Category</SelectItem>
                  <SelectItem value="seller">Specific Seller</SelectItem>
                  <SelectItem value="listing">Specific Listing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxUses">Max Uses (Optional)</Label>
              <Input
                id="maxUses"
                type="number"
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(false)}>
              Create Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
