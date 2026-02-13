import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Download, Calendar, TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const Route = createFileRoute('/admin/_admin/reports/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [dateRange, setDateRange] = useState('30days');
  const [exportFormat, setExportFormat] = useState('csv');

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting report in format:', exportFormat);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Business intelligence and performance reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <Label>Date Range:</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="sellers">Sellers</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-3xl font-bold mt-2">à§³0</p>
                  <p className="text-sm text-green-600 mt-1">+0% from last period</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Platform Fees</p>
                  <p className="text-3xl font-bold mt-2">à§³0</p>
                  <p className="text-sm text-green-600 mt-1">+0% from last period</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Booking Value</p>
                  <p className="text-3xl font-bold mt-2">à§³0</p>
                  <p className="text-sm text-gray-600 mt-1">0% from last period</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Chart will be displayed here
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Chart will be displayed here
            </div>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
                <p className="text-3xl font-bold mt-2">0</p>
                <p className="text-sm text-green-600 mt-1">+0% from last period</p>
              </div>
            </Card>

            <Card className="p-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
                <p className="text-3xl font-bold mt-2">0</p>
                <p className="text-sm text-gray-600 mt-1">0% of total</p>
              </div>
            </Card>

            <Card className="p-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
                <p className="text-3xl font-bold mt-2">0</p>
                <p className="text-sm text-gray-600 mt-1">0% of total</p>
              </div>
            </Card>

            <Card className="p-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                <p className="text-3xl font-bold mt-2">0%</p>
                <p className="text-sm text-gray-600 mt-1">0% from last period</p>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Bookings by Status</h3>
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Chart will be displayed here
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Booking Trend</h3>
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Chart will be displayed here
            </div>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-3xl font-bold mt-2">0</p>
                  <p className="text-sm text-green-600 mt-1">+0 new users</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-3xl font-bold mt-2">0</p>
                <p className="text-sm text-gray-600 mt-1">In last 30 days</p>
              </div>
            </Card>

            <Card className="p-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">New Registrations</p>
                <p className="text-3xl font-bold mt-2">0</p>
                <p className="text-sm text-green-600 mt-1">+0% from last period</p>
              </div>
            </Card>

            <Card className="p-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Retention Rate</p>
                <p className="text-3xl font-bold mt-2">0%</p>
                <p className="text-sm text-gray-600 mt-1">0% from last period</p>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">User Growth</h3>
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Chart will be displayed here
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">User Activity</h3>
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Chart will be displayed here
            </div>
          </Card>
        </TabsContent>

        {/* Sellers Tab */}
        <TabsContent value="sellers" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sellers</p>
                <p className="text-3xl font-bold mt-2">0</p>
                <p className="text-sm text-green-600 mt-1">+0 new sellers</p>
              </div>
            </Card>

            <Card className="p-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Verified Sellers</p>
                <p className="text-3xl font-bold mt-2">0</p>
                <p className="text-sm text-gray-600 mt-1">0% of total</p>
              </div>
            </Card>

            <Card className="p-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Verification</p>
                <p className="text-3xl font-bold mt-2">0</p>
                <p className="text-sm text-gray-600 mt-1">Action required</p>
              </div>
            </Card>

            <Card className="p-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Listings</p>
                <p className="text-3xl font-bold mt-2">0</p>
                <p className="text-sm text-gray-600 mt-1">Total listings</p>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Seller Performance</h3>
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Chart will be displayed here
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sellers by Category</h3>
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Chart will be displayed here
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
