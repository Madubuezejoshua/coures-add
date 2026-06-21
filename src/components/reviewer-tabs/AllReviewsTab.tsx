import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { FileSearch, Lock, Paperclip } from 'lucide-react';
import { Card, CardBody, Button, Spinner, EmptyState, StatusBadge } from '../ui';

export const AllReviewsTab: React.FC<{ onClaim: () => void }> = ({ onClaim }) => {
  const { user, displayName } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentService.getSubmittedDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDocument = async (docId: string) => {
    if (!user) return;

    try {
      setClaiming(docId);
      await documentService.claimDocument(
        docId,
        user.uid,
        displayName || user.email || 'Unknown'
      );
      await loadDocuments();
      onClaim();
    } catch (error) {
      console.error('Error claiming document:', error);
    } finally {
      setClaiming(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return <Spinner label="Loading documents…" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">Available for Review</h2>
        <p className="text-sm text-slate-500">{documents.length} documents waiting for review</p>
      </div>

      {documents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {documents.map((doc) => (
            <Card key={doc.id} hover>
              <CardBody className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="mb-1 text-lg font-semibold text-slate-900">{doc.title}</h3>
                    <p className="line-clamp-2 text-sm text-slate-500">
                      {doc.description || doc.content.substring(0, 100)}...
                    </p>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>

                <div className="mb-4 space-y-1.5 text-sm text-slate-500">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Author</span>
                    <span className="font-medium text-slate-700">{doc.contributorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Submitted</span>
                    <span className="font-medium text-slate-700">{formatDate(doc.createdAt)}</span>
                  </div>
                  {doc.fileName && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Paperclip className="h-3.5 w-3.5" /> File
                      </span>
                      <span className="max-w-[200px] truncate font-medium text-slate-700">{doc.fileName}</span>
                    </div>
                  )}
                </div>

                <Button
                  fullWidth
                  size="sm"
                  loading={claiming === doc.id}
                  disabled={claiming === doc.id}
                  onClick={() => handleClaimDocument(doc.id!)}
                >
                  {claiming === doc.id ? (
                    'Claiming...'
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Claim for Review
                    </>
                  )}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileSearch}
          title="No documents available for review"
          description="Newly submitted documents will appear here for you to claim."
        />
      )}
    </div>
  );
};
