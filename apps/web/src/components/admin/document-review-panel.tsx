import { useState } from 'react';
import { FileText, Download, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useReviewDocument, useBulkReviewDocuments } from '@/hooks/use-admin-queries';
import { toast } from 'sonner';

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  status: string;
  rejectionReason?: string | null;
  uploadedAt: string;
  reviewedAt?: string | null;
  reviewer?: {
    name: string;
    email: string;
  } | null;
}

interface DocumentReviewPanelProps {
  sellerId: string;
  documents: Document[];
}

export function DocumentReviewPanel({ sellerId, documents }: DocumentReviewPanelProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [bulkAction, setBulkAction] = useState<'approved' | 'rejected' | null>(null);
  const [bulkRejectionReason, setBulkRejectionReason] = useState('');

  const reviewDocumentMutation = useReviewDocument();
  const bulkReviewMutation = useBulkReviewDocuments();

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'trade-license': 'Trade License',
      'nid': 'National ID',
      'passport': 'Passport',
      'tin-certificate': 'TIN Certificate',
      'property-docs': 'Property Documents',
      'tour-license': 'Tour License',
    };
    return labels[type] || type;
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

  const handleReviewDocument = async () => {
    if (!selectedDocument || !reviewAction) return;

    if (reviewAction === 'rejected' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    await reviewDocumentMutation.mutateAsync({
      id: selectedDocument.id,
      data: {
        status: reviewAction,
        rejectionReason: reviewAction === 'rejected' ? rejectionReason.trim() : undefined,
      },
    });

    setSelectedDocument(null);
    setReviewAction(null);
    setRejectionReason('');
  };

  const handleBulkReview = async () => {
    if (!bulkAction) return;

    if (bulkAction === 'rejected' && !bulkRejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    await bulkReviewMutation.mutateAsync({
      sellerId,
      data: {
        status: bulkAction,
        rejectionReason: bulkAction === 'rejected' ? bulkRejectionReason.trim() : undefined,
      },
    });

    setBulkAction(null);
    setBulkRejectionReason('');
  };

  const pendingDocs = documents.filter((d) => d.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      {pendingDocs.length > 0 && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Bulk Actions ({pendingDocs.length} pending documents)
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={bulkAction === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBulkAction('approved')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve All
            </Button>
            <Button
              variant={bulkAction === 'rejected' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setBulkAction('rejected')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject All
            </Button>
          </div>

          {bulkAction && (
            <div className="mt-4 space-y-3">
              {bulkAction === 'rejected' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={bulkRejectionReason}
                    onChange={(e) => setBulkRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejecting all documents..."
                    rows={2}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setBulkAction(null);
                    setBulkRejectionReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleBulkReview}
                  disabled={
                    bulkReviewMutation.isPending ||
                    (bulkAction === 'rejected' && !bulkRejectionReason.trim())
                  }
                >
                  {bulkReviewMutation.isPending ? 'Processing...' : 'Confirm'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="h-5 w-5 text-gray-500 mt-1" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{getDocumentTypeLabel(doc.documentType)}</h4>
                    <p className="text-sm text-gray-500 truncate">{doc.fileName}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
              </div>

              {doc.status === 'rejected' && doc.rejectionReason && (
                <div className="mb-3 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm">
                  <p className="font-medium text-red-800 dark:text-red-200">Rejection Reason:</p>
                  <p className="text-red-700 dark:text-red-300">{doc.rejectionReason}</p>
                </div>
              )}

              {doc.reviewedAt && doc.reviewer && (
                <p className="text-xs text-gray-500 mb-3">
                  Reviewed by {doc.reviewer.name || doc.reviewer.email} on{' '}
                  {new Date(doc.reviewedAt).toLocaleDateString()}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(doc.fileUrl, '_blank')}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1"
                >
                  <a href={doc.fileUrl} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
                {doc.status === 'pending' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setSelectedDocument(doc)}
                  >
                    Review
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Review Document: {selectedDocument && getDocumentTypeLabel(selectedDocument.documentType)}
            </DialogTitle>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              {/* Document Preview */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 p-3">
                  <p className="text-sm font-medium">{selectedDocument.fileName}</p>
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
                      className="w-full h-[500px]"
                      title={selectedDocument.fileName}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
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

              {/* Review Actions */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">Review Decision</label>
                <div className="flex gap-2">
                  <Button
                    variant={reviewAction === 'approved' ? 'default' : 'outline'}
                    onClick={() => setReviewAction('approved')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant={reviewAction === 'rejected' ? 'destructive' : 'outline'}
                    onClick={() => setReviewAction('rejected')}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>

                {reviewAction === 'rejected' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why this document is being rejected..."
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedDocument(null);
                    setReviewAction(null);
                    setRejectionReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReviewDocument}
                  disabled={
                    !reviewAction ||
                    reviewDocumentMutation.isPending ||
                    (reviewAction === 'rejected' && !rejectionReason.trim())
                  }
                >
                  {reviewDocumentMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
