import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, PlusCircle, Save, Sparkles, Star, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminHomepageConfig, useUpdateAdminHomepageConfig } from '@/hooks/use-admin-queries';
import {
  useAdminListings,
  useToggleFeatured,
  useToggleGroupEligible,
  useUpdateFlashDeal,
} from '@/lib/api/admin-listings';
import type { HomepageSectionVisibility } from '@/lib/api/admin';

export const Route = createFileRoute('/admin/_admin/content/')({
  component: RouteComponent,
});

function getDefaultVisibility(): HomepageSectionVisibility {
  return {
    hero: true,
    flashDeals: true,
    specialOffers: true,
    trendingListings: true,
    browseCategories: true,
    featuredDestinations: true,
    popularServices: true,
    seasonalPackages: true,
    testimonials: true,
    blogPreview: true,
    faq: true,
    newsletter: true,
  };
}

function getDefaultHeroEndTime(): string {
  const now = new Date();
  now.setHours(now.getHours() + 24);
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
}

function RouteComponent() {
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [sectionVisibility, setSectionVisibility] =
    useState<HomepageSectionVisibility>(getDefaultVisibility());

  const [selectedHeroListingId, setSelectedHeroListingId] = useState('');
  const [selectedFeaturedListingId, setSelectedFeaturedListingId] = useState('');
  const [selectedSpecialListingId, setSelectedSpecialListingId] = useState('');
  const [heroDiscountPercent, setHeroDiscountPercent] = useState('15');
  const [heroEndsAtLocal, setHeroEndsAtLocal] = useState(getDefaultHeroEndTime());

  const { data: homepageConfigResponse, isLoading: isHomepageConfigLoading } =
    useAdminHomepageConfig();
  const updateHomepageConfigMutation = useUpdateAdminHomepageConfig();

  const { data: allActiveListingsResponse, isLoading: isListingsLoading } = useAdminListings({
    status: 'active',
    limit: 250,
  });
  const { data: heroListingsResponse } = useAdminListings({
    status: 'active',
    flashDeals: true,
    limit: 250,
  });
  const { data: featuredListingsResponse } = useAdminListings({
    status: 'active',
    featured: true,
    limit: 250,
  });
  const { data: specialOfferListingsResponse } = useAdminListings({
    status: 'active',
    groupEligible: true,
    limit: 250,
  });

  const toggleFeaturedMutation = useToggleFeatured();
  const toggleGroupEligibleMutation = useToggleGroupEligible();
  const updateFlashDealMutation = useUpdateFlashDeal();

  const allActiveListings = (allActiveListingsResponse?.data || []) as Array<Record<string, any>>;
  const heroListings = (heroListingsResponse?.data || []) as Array<Record<string, any>>;
  const featuredListings = (featuredListingsResponse?.data || []) as Array<Record<string, any>>;
  const specialOfferListings = (specialOfferListingsResponse?.data || []) as Array<
    Record<string, any>
  >;

  useEffect(() => {
    const config = homepageConfigResponse?.data.data;
    if (!config) {
      return;
    }

    setHeroTitle(config.heroTitle || '');
    setHeroSubtitle(config.heroSubtitle || '');
    setSectionVisibility({
      ...getDefaultVisibility(),
      ...(config.sectionVisibility || {}),
    });
  }, [homepageConfigResponse]);

  const heroListingIds = useMemo(
    () => new Set(heroListings.map((item) => item.id)),
    [heroListings]
  );
  const featuredListingIds = useMemo(
    () => new Set(featuredListings.map((item) => item.id)),
    [featuredListings]
  );
  const specialListingIds = useMemo(
    () => new Set(specialOfferListings.map((item) => item.id)),
    [specialOfferListings]
  );

  const heroCandidates = useMemo(
    () => allActiveListings.filter((item) => !heroListingIds.has(item.id)),
    [allActiveListings, heroListingIds]
  );
  const featuredCandidates = useMemo(
    () => allActiveListings.filter((item) => !featuredListingIds.has(item.id)),
    [allActiveListings, featuredListingIds]
  );
  const specialCandidates = useMemo(
    () => allActiveListings.filter((item) => !specialListingIds.has(item.id)),
    [allActiveListings, specialListingIds]
  );

  const handleSaveHeroText = async () => {
    if (heroTitle.trim().length < 3 || heroSubtitle.trim().length < 3) {
      toast.error('Hero title and subtitle need at least 3 characters.');
      return;
    }

    await updateHomepageConfigMutation.mutateAsync({
      heroTitle: heroTitle.trim(),
      heroSubtitle: heroSubtitle.trim(),
    });
  };

  const handleSaveVisibility = async () => {
    await updateHomepageConfigMutation.mutateAsync({
      sectionVisibility,
    });
  };

  const handleAddHeroOffer = async () => {
    if (!selectedHeroListingId) {
      toast.error('Select a package for hero offers first.');
      return;
    }

    if (heroListings.length >= 5) {
      toast.error('Hero offers are limited to 5 packages. Remove one before adding another.');
      return;
    }

    const endsAt = heroEndsAtLocal ? new Date(heroEndsAtLocal) : null;
    if (!endsAt || Number.isNaN(endsAt.getTime())) {
      toast.error('Set a valid flash sale end time.');
      return;
    }

    if (endsAt <= new Date()) {
      toast.error('Flash sale end time must be in the future.');
      return;
    }

    const discount = Number(heroDiscountPercent);
    if (Number.isNaN(discount) || discount < 1 || discount > 95) {
      toast.error('Discount must be between 1 and 95.');
      return;
    }

    await updateFlashDealMutation.mutateAsync({
      listingId: selectedHeroListingId,
      enabled: true,
      discountPercent: discount,
      flashDealEndsAt: endsAt.toISOString(),
      reason: 'Added to hero offers from admin content dashboard',
    });

    toast.success('Package added to hero offers.');
    setSelectedHeroListingId('');
    setHeroEndsAtLocal(getDefaultHeroEndTime());
  };

  const handleRemoveHeroOffer = async (listingId: string) => {
    await updateFlashDealMutation.mutateAsync({
      listingId,
      enabled: false,
      reason: 'Removed from hero offers from admin content dashboard',
    });
    toast.success('Package removed from hero offers.');
  };

  const handleAddFeatured = async () => {
    if (!selectedFeaturedListingId) {
      toast.error('Select a package to add to featured section.');
      return;
    }

    await toggleFeaturedMutation.mutateAsync({
      listingId: selectedFeaturedListingId,
      featured: true,
    });

    toast.success('Package added to featured section.');
    setSelectedFeaturedListingId('');
  };

  const handleRemoveFeatured = async (listingId: string) => {
    await toggleFeaturedMutation.mutateAsync({
      listingId,
      featured: false,
    });
    toast.success('Package removed from featured section.');
  };

  const handleAddSpecialOffer = async () => {
    if (!selectedSpecialListingId) {
      toast.error('Select a package to add to special offers.');
      return;
    }

    await toggleGroupEligibleMutation.mutateAsync({
      listingId: selectedSpecialListingId,
      enabled: true,
      reason: 'Added to special offers from admin content dashboard',
    });

    toast.success('Package added to special offers section.');
    setSelectedSpecialListingId('');
  };

  const handleRemoveSpecialOffer = async (listingId: string) => {
    await toggleGroupEligibleMutation.mutateAsync({
      listingId,
      enabled: false,
      reason: 'Removed from special offers from admin content dashboard',
    });

    toast.success('Package removed from special offers section.');
  };

  const isSubmittingAny =
    updateHomepageConfigMutation.isPending ||
    updateFlashDealMutation.isPending ||
    toggleFeaturedMutation.isPending ||
    toggleGroupEligibleMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Homepage Content Control</h1>
          <p className="text-muted-foreground mt-1">
            Manage hero offers, package placement by section, and homepage visibility.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/admin/promotions">Open Flash Deal Manager</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hero Text</CardTitle>
          <CardDescription>
            These values appear in the hero filter column for customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero-title">Hero Title</Label>
            <Input
              id="hero-title"
              value={heroTitle}
              onChange={(event) => setHeroTitle(event.target.value)}
              placeholder="Enter hero heading"
              disabled={isHomepageConfigLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
            <Textarea
              id="hero-subtitle"
              value={heroSubtitle}
              onChange={(event) => setHeroSubtitle(event.target.value)}
              rows={3}
              placeholder="Enter hero supporting text"
              disabled={isHomepageConfigLoading}
            />
          </div>
          <Button onClick={handleSaveHeroText} disabled={isSubmittingAny}>
            <Save className="h-4 w-4 mr-2" />
            Save Hero Text
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section Visibility</CardTitle>
          <CardDescription>Show or hide homepage sections without code changes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(sectionVisibility) as Array<keyof HomepageSectionVisibility>).map(
              (key) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <span className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Switch
                    checked={sectionVisibility[key]}
                    onCheckedChange={(checked) =>
                      setSectionVisibility((prev) => ({
                        ...prev,
                        [key]: checked,
                      }))
                    }
                  />
                </div>
              )
            )}
          </div>
          <Button className="mt-4" onClick={handleSaveVisibility} disabled={isSubmittingAny}>
            <Save className="h-4 w-4 mr-2" />
            Save Visibility Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Hero Offer Packages
          </CardTitle>
          <CardDescription>
            Add/remove packages shown as best offers in hero carousel (powered by flash deals).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_160px_220px_auto]">
            <Select value={selectedHeroListingId} onValueChange={setSelectedHeroListingId}>
              <SelectTrigger>
                <SelectValue placeholder="Select package" />
              </SelectTrigger>
              <SelectContent>
                {heroCandidates.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No packages available
                  </SelectItem>
                ) : (
                  heroCandidates.map((listing) => (
                    <SelectItem key={listing.id} value={listing.id}>
                      {listing.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              max={95}
              value={heroDiscountPercent}
              onChange={(event) => setHeroDiscountPercent(event.target.value)}
              placeholder="Discount %"
            />
            <Input
              type="datetime-local"
              value={heroEndsAtLocal}
              onChange={(event) => setHeroEndsAtLocal(event.target.value)}
            />
            <Button onClick={handleAddHeroOffer} disabled={isSubmittingAny}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Sale Ends</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {heroListings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    No hero offer packages configured.
                  </TableCell>
                </TableRow>
              ) : (
                heroListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="font-medium">{listing.title}</div>
                    </TableCell>
                    <TableCell>
                      {typeof listing.discountPercent === 'number'
                        ? `${listing.discountPercent}%`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {listing.flashDealEndsAt
                        ? new Date(listing.flashDealEndsAt).toLocaleString()
                        : 'Not set'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveHeroOffer(listing.id)}
                        disabled={isSubmittingAny}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Featured Section Packages
            </CardTitle>
            <CardDescription>
              Add or remove packages from featured section selection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select
                value={selectedFeaturedListingId}
                onValueChange={setSelectedFeaturedListingId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  {featuredCandidates.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No packages available
                    </SelectItem>
                  ) : (
                    featuredCandidates.map((listing) => (
                      <SelectItem key={listing.id} value={listing.id}>
                        {listing.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button onClick={handleAddFeatured} disabled={isSubmittingAny}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {featuredListings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No featured packages selected.</p>
              ) : (
                featuredListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{listing.title}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFeatured(listing.id)}
                      disabled={isSubmittingAny}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Special Offers Packages
            </CardTitle>
            <CardDescription>
              Control packages in special offers (group-friendly) section.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={selectedSpecialListingId} onValueChange={setSelectedSpecialListingId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  {specialCandidates.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No packages available
                    </SelectItem>
                  ) : (
                    specialCandidates.map((listing) => (
                      <SelectItem key={listing.id} value={listing.id}>
                        {listing.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button onClick={handleAddSpecialOffer} disabled={isSubmittingAny}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {specialOfferListings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No special offer packages selected.</p>
              ) : (
                specialOfferListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{listing.title}</span>
                      <Badge variant="outline">Group</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveSpecialOffer(listing.id)}
                      disabled={isSubmittingAny}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isListingsLoading && (
        <p className="text-sm text-muted-foreground">Loading homepage package controls...</p>
      )}
    </div>
  );
}
