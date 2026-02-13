import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import {
  CalendarClock,
  Flame,
  Pencil,
  PlusCircle,
  Search,
  TimerReset,
  Trash2,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminListings, useUpdateFlashDeal } from '@/lib/api/admin-listings';

export const Route = createFileRoute('/admin/_admin/promotions/')({
  component: RouteComponent,
});

interface DealDraftState {
  listingId: string;
  discountPercent: string;
  endsAtLocal: string;
}

function toLocalDateTimeValue(isoDate?: string | null): string {
  if (!isoDate) {
    return '';
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

function fromLocalDateTimeValue(localValue: string): string | null {
  if (!localValue) {
    return null;
  }

  const parsed = new Date(localValue);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function RouteComponent() {
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DealDraftState>({
    listingId: '',
    discountPercent: '',
    endsAtLocal: '',
  });

  const updateFlashDealMutation = useUpdateFlashDeal();

  const { data: activeListingsResponse, isLoading: isActiveListingsLoading } = useAdminListings({
    status: 'active',
    limit: 200,
    search: search || undefined,
  });

  const { data: flashDealsResponse, isLoading: isFlashDealsLoading } = useAdminListings({
    flashDeals: true,
    status: 'active',
    limit: 200,
    search: search || undefined,
  });

  const activeListings = (activeListingsResponse?.data || []) as Array<Record<string, any>>;
  const flashDeals = (flashDealsResponse?.data || []) as Array<Record<string, any>>;

  const now = Date.now();
  const dealStats = useMemo(() => {
    let active = 0;
    let expired = 0;
    let endingSoon = 0;

    for (const deal of flashDeals) {
      const endsAt = deal.flashDealEndsAt ? new Date(deal.flashDealEndsAt).getTime() : 0;
      if (!endsAt || endsAt <= now) {
        expired += 1;
        continue;
      }

      active += 1;

      if (endsAt - now <= 24 * 60 * 60 * 1000) {
        endingSoon += 1;
      }
    }

    return {
      total: flashDeals.length,
      active,
      expired,
      endingSoon,
    };
  }, [flashDeals, now]);

  const availableListings = useMemo(() => {
    const flashDealIds = new Set(flashDeals.map((item) => item.id));
    return activeListings.filter((item) => !flashDealIds.has(item.id));
  }, [activeListings, flashDeals]);

  const resetDraft = () => {
    setDraft({
      listingId: '',
      discountPercent: '',
      endsAtLocal: '',
    });
  };

  const handleCreateFlashDeal = async () => {
    if (!draft.listingId) {
      toast.error('Please select a package first.');
      return;
    }

    const discountValue = draft.discountPercent ? Number(draft.discountPercent) : undefined;
    if (
      discountValue !== undefined &&
      (Number.isNaN(discountValue) || discountValue < 1 || discountValue > 95)
    ) {
      toast.error('Discount must be between 1 and 95.');
      return;
    }

    const flashDealEndsAt = fromLocalDateTimeValue(draft.endsAtLocal);
    if (!flashDealEndsAt) {
      toast.error('Please set a valid flash sale end time.');
      return;
    }

    await updateFlashDealMutation.mutateAsync({
      listingId: draft.listingId,
      enabled: true,
      discountPercent: discountValue,
      flashDealEndsAt,
      reason: 'Configured from admin promotions dashboard',
    });

    toast.success('Flash deal configured successfully.');
    resetDraft();
    setCreateDialogOpen(false);
  };

  const openEditDialog = (listing: Record<string, any>) => {
    setEditingListingId(listing.id);
    setDraft({
      listingId: listing.id,
      discountPercent:
        typeof listing.discountPercent === 'number' ? String(listing.discountPercent) : '',
      endsAtLocal: toLocalDateTimeValue(listing.flashDealEndsAt),
    });
    setEditDialogOpen(true);
  };

  const handleUpdateFlashDeal = async () => {
    if (!editingListingId) {
      return;
    }

    const discountValue = draft.discountPercent ? Number(draft.discountPercent) : undefined;
    if (
      discountValue !== undefined &&
      (Number.isNaN(discountValue) || discountValue < 1 || discountValue > 95)
    ) {
      toast.error('Discount must be between 1 and 95.');
      return;
    }

    const flashDealEndsAt = fromLocalDateTimeValue(draft.endsAtLocal);
    if (!flashDealEndsAt) {
      toast.error('Please set a valid flash sale end time.');
      return;
    }

    await updateFlashDealMutation.mutateAsync({
      listingId: editingListingId,
      enabled: true,
      discountPercent: discountValue,
      flashDealEndsAt,
      reason: 'Updated from admin promotions dashboard',
    });

    toast.success('Flash deal updated successfully.');
    setEditDialogOpen(false);
    setEditingListingId(null);
    resetDraft();
  };

  const handleRemoveFlashDeal = async (listingId: string) => {
    await updateFlashDealMutation.mutateAsync({
      listingId,
      enabled: false,
      reason: 'Removed from admin promotions dashboard',
    });
    toast.success('Flash deal removed.');
  };

  const getDealStatusBadge = (deal: Record<string, any>) => {
    const endsAtTimestamp = deal.flashDealEndsAt ? new Date(deal.flashDealEndsAt).getTime() : 0;
    if (!endsAtTimestamp || endsAtTimestamp <= now) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    if (endsAtTimestamp - now <= 24 * 60 * 60 * 1000) {
      return <Badge className="bg-amber-500 text-white">Ending Soon</Badge>;
    }

    return <Badge className="bg-emerald-600 text-white">Active</Badge>;
  };

  const editingListing = flashDeals.find((item) => item.id === editingListingId) || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotions & Flash Deals</h1>
          <p className="text-muted-foreground mt-1">
            Control hero offers, flash sale timing, and package-level discounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/content">Manage Homepage Sections</Link>
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Flash Deal
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search packages by title"
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Flash Deals</p>
                <p className="text-2xl font-bold mt-1">{dealStats.total}</p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold mt-1">{dealStats.active}</p>
              </div>
              <Zap className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ending in 24h</p>
                <p className="text-2xl font-bold mt-1">{dealStats.endingSoon}</p>
              </div>
              <TimerReset className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold mt-1">{dealStats.expired}</p>
              </div>
              <CalendarClock className="h-8 w-8 text-rose-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Flash Deals</CardTitle>
          <CardDescription>
            These packages power both the flash deals section and hero offer carousel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFlashDealsLoading ? (
            <p className="text-sm text-muted-foreground">Loading flash deals...</p>
          ) : flashDeals.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No flash deals configured yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Sale Ends</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flashDeals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <div className="font-medium">{deal.title}</div>
                      <div className="text-xs text-muted-foreground">{deal.id}</div>
                    </TableCell>
                    <TableCell>
                      {typeof deal.discountPercent === 'number' ? `${deal.discountPercent}%` : '-'}
                    </TableCell>
                    <TableCell>
                      {deal.flashDealEndsAt
                        ? new Date(deal.flashDealEndsAt).toLocaleString()
                        : 'Not set'}
                    </TableCell>
                    <TableCell>{getDealStatusBadge(deal)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(deal)}
                          disabled={updateFlashDealMutation.isPending}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveFlashDeal(deal.id)}
                          disabled={updateFlashDealMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Flash Deal</DialogTitle>
            <DialogDescription>
              Pick a package, set discount, and define flash sale end time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Package</Label>
              <Select
                value={draft.listingId}
                onValueChange={(value) => setDraft((prev) => ({ ...prev, listingId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {isActiveListingsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading packages...
                    </SelectItem>
                  ) : availableListings.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No available packages
                    </SelectItem>
                  ) : (
                    availableListings.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Discount Percent</Label>
              <Input
                type="number"
                min={1}
                max={95}
                placeholder="e.g. 20"
                value={draft.discountPercent}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, discountPercent: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Flash Sale Ends At</Label>
              <Input
                type="datetime-local"
                value={draft.endsAtLocal}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, endsAtLocal: event.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFlashDeal} disabled={updateFlashDealMutation.isPending}>
              {updateFlashDealMutation.isPending ? 'Saving...' : 'Save Deal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Flash Deal</DialogTitle>
            <DialogDescription>
              Update discount and end time for {editingListing?.title || 'selected package'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Discount Percent</Label>
              <Input
                type="number"
                min={1}
                max={95}
                placeholder="e.g. 20"
                value={draft.discountPercent}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, discountPercent: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Flash Sale Ends At</Label>
              <Input
                type="datetime-local"
                value={draft.endsAtLocal}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, endsAtLocal: event.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingListingId(null);
                resetDraft();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateFlashDeal} disabled={updateFlashDealMutation.isPending}>
              {updateFlashDealMutation.isPending ? 'Updating...' : 'Update Deal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
