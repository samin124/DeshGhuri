import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Mail,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { VerificationStatus, SellerDocument, VerificationTimeline } from '@/types/seller';
import { cn } from '@/lib/utils';
import { getVerificationStatus, getSellerByUserId } from '@/lib/api/seller';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

const searchSchema = z.object({
  sellerId: z.string().optional(),
});

export const Route = createFileRoute('/seller/verification-status')({
  component: RouteComponent,
  validateSearch: searchSchema,
});

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    label: 'Pending Review',
    description: 'Your application is in the queue and will be reviewed soon.',
  },
  'in-review': {
    icon: RefreshCw,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'Under Review',
    description: 'Our team is currently reviewing your documents and information.',
  },
  approved: {
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'Approved',
    description: 'Congratulations! Your seller account has been verified.',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Rejected',
    description: 'Unfortunately, your application was not approved. Please see details below.',
  },
  incomplete: {
    icon: AlertCircle,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    label: 'Incomplete',
    description: 'Additional information or documents are required.',
  },
};

const documentTypeLabels = {
  'trade-license': 'Trade License',
  nid: 'National ID',
  passport: 'Passport',
  'tin-certificate': 'TIN Certificate',
  'bank-statement': 'Bank Statement',
  'property-docs': 'Property Documents',
  'tour-license': 'Tour License',
};

const documentStatusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    label: 'Pending',
  },
  approved: {
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'Approved',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Rejected',
  },
};

function RouteComponent() {
  const navigate = useNavigate();
  const { sellerId: sellerIdParam } = Route.useSearch();
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(true);
  const [sellerData, setSellerData] = useState<any>(null);
  const [documents, setDocuments] = useState<SellerDocument[]>([]);
  const [timeline, setTimeline] = useState<VerificationTimeline[]>([]);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        // Wait for session to load
        if (isPending) return;

        if (!session?.user) {
          toast.error('Please log in to view verification status');
          navigate({ to: '/login' });
          return;
        }

        let sellerId = sellerIdParam;

        // If no sellerId in params, try to get from user
        if (!sellerId) {
          const result = await getSellerByUserId(session.user.id);
          if (result.error || !result.data?.seller) {
            toast.error('No seller account found');
            navigate({ to: '/seller/register' });
            return;
          }
          sellerId = result.data.seller.id;
        }

        // Fetch verification status
        const result = await getVerificationStatus(sellerId!);
        if (result.error) {
          toast.error(result.error);
          return;
        }

        if (result.data) {
          setSellerData(result.data.seller);

          // Group documents by type and show only the latest one of each type
          const uniqueDocuments = result.data.documents.reduce((acc: SellerDocument[], doc) => {
            const existingDocIndex = acc.findIndex((d) => d.documentType === doc.documentType);
            if (existingDocIndex === -1) {
              acc.push(doc);
            } else {
              // Keep the more recently uploaded document
              if (new Date(doc.uploadedAt) > new Date(acc[existingDocIndex].uploadedAt)) {
                acc[existingDocIndex] = doc;
              }
            }
            return acc;
          }, []);

          // Sort by upload date (newest first)
          uniqueDocuments.sort(
            (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );

          setDocuments(uniqueDocuments);
          setTimeline(result.data.timeline);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to load verification status');
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationStatus();
  }, [session, isPending, sellerIdParam, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!sellerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <CardContent className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Seller Account Found</h2>
            <p className="text-muted-foreground mb-4">
              You don't have a seller account yet. Please register to get started.
            </p>
            <Link to="/seller/register">
              <Button>Register as Seller</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = sellerData.verificationStatus as VerificationStatus;
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Verification Status</h1>
          <p className="text-muted-foreground">Track your seller account verification progress</p>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center',
                  config.bgColor
                )}
              >
                <StatusIcon className={cn('h-8 w-8', config.color)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{config.label}</h2>
                  <Badge variant="secondary" className={cn(config.bgColor, config.color)}>
                    {status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{config.description}</p>
              </div>
            </div>

            {status === 'approved' && (
              <div className="mt-6">
                <Link to="/dashboard">
                  <Button className="w-full sm:w-auto">Go to Seller Dashboard</Button>
                </Link>
              </div>
            )}

            {status === 'rejected' && (
              <div className="mt-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your application was not approved. Please review document status below and
                    resubmit the required documents.
                  </AlertDescription>
                </Alert>
                <Link to="/seller/onboarding">
                  <Button variant="outline" className="w-full sm:w-auto mt-4">
                    Resubmit Application
                  </Button>
                </Link>
              </div>
            )}

            {status === 'incomplete' && (
              <div className="mt-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please upload missing or rejected documents to continue with the verification
                    process.
                  </AlertDescription>
                </Alert>
                <Link to="/seller/onboarding">
                  <Button variant="outline" className="w-full sm:w-auto mt-4">
                    Complete Application
                  </Button>
                </Link>
              </div>
            )}

            {status === 'incomplete' && (
              <div className="mt-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please upload the missing or rejected documents to continue with the
                    verification process.
                  </AlertDescription>
                </Alert>
                <Link to="/seller/onboarding">
                  <Button variant="outline" className="w-full sm:w-auto mt-4">
                    Complete Application
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Documents Status */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Submitted Documents
                </CardTitle>
                <CardDescription>Status of each uploaded document</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.length > 0 ? (
                    documents.map((doc, index) => {
                      const docConfig = documentStatusConfig[doc.status];
                      const DocIcon = docConfig.icon;

                      return (
                        <div key={doc.id}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <h4 className="font-medium truncate">
                                  {
                                    documentTypeLabels[
                                      doc.documentType as keyof typeof documentTypeLabels
                                    ]
                                  }
                                </h4>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {doc.fileName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(doc.fileSize)} • Uploaded{' '}
                                {formatDate(doc.uploadedAt)}
                              </p>
                              {doc.rejectionReason && (
                                <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                                  <span className="font-medium">Reason: </span>
                                  {doc.rejectionReason}
                                </div>
                              )}
                            </div>
                            <Badge
                              variant="secondary"
                              className={cn(
                                'flex items-center gap-1',
                                docConfig.bgColor,
                                docConfig.color
                              )}
                            >
                              <DocIcon className="h-3 w-3" />
                              {docConfig.label}
                            </Badge>
                          </div>
                          {index < documents.length - 1 && <Separator className="mt-4" />}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No documents uploaded yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline and Next Steps */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Verification Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.length > 0 ? (
                    timeline.map((event, index) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="relative">
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                          {index < timeline.length - 1 && (
                            <div className="absolute left-1/2 top-3 w-0.5 h-full -translate-x-1/2 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium">{event.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(event.timestamp)}
                          </p>
                          {event.performedBy && (
                            <p className="text-xs text-muted-foreground">by Admin</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No timeline events yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {status === 'pending' && (
                    <>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span>Your application will be reviewed within 24-48 hours</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span>You'll receive an email notification once review starts</span>
                      </li>
                    </>
                  )}
                  {status === 'in-review' && (
                    <>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span>Our team is reviewing your documents</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span>You'll be notified via email once verification is complete</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span>Estimated completion: 12-24 hours</span>
                      </li>
                    </>
                  )}
                  {status === 'approved' && (
                    <>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                        <span>Complete your seller profile</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                        <span>Create your first listing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                        <span>Start receiving bookings</span>
                      </li>
                    </>
                  )}
                  {(status === 'rejected' || status === 'incomplete') && (
                    <>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                        <span>Review rejected documents above</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                        <span>Prepare corrected documents</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                        <span>Resubmit your application</span>
                      </li>
                    </>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <a href="mailto:seller-support@deshghuri.com">
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
