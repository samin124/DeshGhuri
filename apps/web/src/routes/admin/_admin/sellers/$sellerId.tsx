import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, FileText, Building, MapPin, Phone, Mail, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useSeller, useUpdateSellerVerification } from '@/hooks/use-admin-queries';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DocumentReviewPanel } from '@/components/admin/document-review-panel';
import { VerifiedBadge } from '@/components/seller/verified-badge';

export const Route = createFileRoute('/admin/_admin/sellers/$sellerId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { sellerId } = Route.useParams();
  const { data, isLoading, error } = useSeller(sellerId);
  const updateVerificationMutation = useUpdateSellerVerification();

  const [verificationAction, setVerificationAction] = useState<'approved' | 'rejected' | 'in-review' | 'incomplete' | null>(null);
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading seller details...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.seller) {
    return (
      <div>
        <Link to="/admin/sellers">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sellers
          </Button>
        </Link>
        <p className="text-red-600">Error loading seller: {error?.message || 'Not found'}</p>
      </div>
    );
  }

  const seller = data.seller;

  const handleVerificationUpdate = async () => {
    if (!verificationAction || !message.trim()) return;

    await updateVerificationMutation.mutateAsync({
      id: sellerId,
      data: {
        status: verificationAction,
        reason: reason.trim() || undefined,
        message: message.trim(),
      },
    });

    setVerificationAction(null);
    setMessage('');
    setReason('');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/sellers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{seller.businessName}</h1>
              {seller.verificationStatus === 'approved' && <VerifiedBadge size="md" />}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {getCategoryLabel(seller.category)} • Applied{' '}
              {new Date(seller.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(seller.verificationStatus)}>
          {seller.verificationStatus}
        </Badge>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Business Details</TabsTrigger>
          <TabsTrigger value="documents">
            Documents
            {seller.documents.filter((d: any) => d.status === 'pending').length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500 text-white rounded-full">
                {seller.documents.filter((d: any) => d.status === 'pending').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="timeline">Verification Timeline</TabsTrigger>
        </TabsList>

        {/* Business Details Tab */}
        <TabsContent value="details" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Business Name</label>
                  <p className="font-medium">{seller.businessName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Category</label>
                  <p className="font-medium">{getCategoryLabel(seller.category)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    Registration Number
                  </label>
                  <p className="font-medium">{seller.registrationNumber}</p>
                </div>
                {seller.businessDescription && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Description</label>
                    <p className="text-sm">{seller.businessDescription}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                    <p className="font-medium">{seller.contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Phone</label>
                    <p className="font-medium">{seller.contactPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Address</label>
                    <p className="text-sm">
                      {seller.address.street}, {seller.address.city}, {seller.address.district}
                      {seller.address.postalCode && `, ${seller.address.postalCode}`}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* User Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">User Account</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Name</label>
                  <p className="font-medium">{seller.user.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                  <p className="font-medium">{seller.user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Email Verified</label>
                  <p className="font-medium">
                    {seller.user.emailVerified ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-yellow-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Not Verified
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <Link to="/admin/users/$userId" params={{ userId: seller.user.id }}>
                    <Button variant="link" size="sm" className="p-0">
                      View User Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Bank Account Information */}
            {seller.bankAccount && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Bank Account</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Bank Name</label>
                    <p className="font-medium">{seller.bankAccount.bankName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Branch</label>
                    <p className="font-medium">{seller.bankAccount.branchName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Account Holder Name
                    </label>
                    <p className="font-medium">{seller.bankAccount.accountHolderName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Account Number
                    </label>
                    <p className="font-medium">{seller.bankAccount.accountNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Account Type</label>
                    <p className="font-medium capitalize">{seller.bankAccount.accountType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Verified</label>
                    <p className="font-medium">
                      {seller.bankAccount.verified ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-yellow-600">No</span>
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <DocumentReviewPanel sellerId={sellerId} documents={seller.documents} />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Verification Timeline
            </h3>
            {seller.timeline && seller.timeline.length > 0 ? (
              <div className="space-y-4">
                {seller.timeline.map((entry: any) => (
                  <div key={entry.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="flex-shrink-0 mt-1">
                      {entry.status === 'approved' && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {entry.status === 'rejected' && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      {entry.status === 'in-review' && (
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                      )}
                      {(entry.status === 'pending' || entry.status === 'incomplete') && (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize">{entry.status}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{entry.message}</p>
                      {entry.performedByUser && (
                        <p className="text-xs text-gray-500 mt-1">
                          By: {entry.performedByUser.name || entry.performedByUser.email}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No timeline entries yet</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Verification Actions */}
      {seller.verificationStatus !== 'approved' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Verification Actions</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Action</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={verificationAction === 'approved' ? 'default' : 'outline'}
                  onClick={() => setVerificationAction('approved')}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant={verificationAction === 'in-review' ? 'default' : 'outline'}
                  onClick={() => setVerificationAction('in-review')}
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  Mark as In Review
                </Button>
                <Button
                  variant={verificationAction === 'incomplete' ? 'default' : 'outline'}
                  onClick={() => setVerificationAction('incomplete')}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Request More Information
                </Button>
                <Button
                  variant={verificationAction === 'rejected' ? 'destructive' : 'outline'}
                  onClick={() => setVerificationAction('rejected')}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>

            {verificationAction && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message to Seller <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter a message to the seller about this action..."
                    rows={3}
                  />
                </div>

                {(verificationAction === 'rejected' || verificationAction === 'incomplete') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Internal Reason (optional)
                    </label>
                    <Textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter internal notes about this decision..."
                      rows={2}
                    />
                  </div>
                )}

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setVerificationAction(null);
                      setMessage('');
                      setReason('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleVerificationUpdate}
                    disabled={!message.trim() || updateVerificationMutation.isPending}
                  >
                    {updateVerificationMutation.isPending ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
