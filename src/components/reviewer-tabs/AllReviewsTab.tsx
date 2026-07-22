import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { ReviewModal } from '../modals/ReviewModal';
import { FileSearch, Eye, Paperclip } from 'lucide-react';
import { Card, CardBody, Button, Spinner, EmptyState, StatusBadge } from '../ui';

export const AllReviewsTab: React.FC<{ onClaim?: () => void }> = ({ onClaim }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [user?.uid]);

  const loadDocuments = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const docs = await documentService.getReviewerDocuments(user.uid);
      setDocuments(docs.filter((doc) => doc.status === 'under_review' || doc.status === 'needs_correction'));
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
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
        <h2 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">Assigned Reviews</h2>
        <p className="text-sm text-slate-500">{documents.length} manuscripts currently assigned to you</p>
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
                  onClick={() => doc.id && setSelectedDocId(doc.id)}
                >
                  <Eye className="h-4 w-4" />
                  Open Review
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileSearch}
          title="No assigned reviews"
          description="Manuscripts assigned to you by the editor will appear here."
        />
      )}

      {selectedDocId && (
        <ReviewModal
          documentId={selectedDocId}
          onClose={() => setSelectedDocId(null)}
          onSave={() => {
            loadDocuments();
            onClaim?.();
          }}
        />
      )}
    </div>
  );
};
