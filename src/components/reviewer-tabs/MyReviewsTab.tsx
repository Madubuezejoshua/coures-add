import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { ReviewModal } from '../modals/ReviewModal';
import { FileText, Eye } from 'lucide-react';
import { Card, CardBody, Button, Spinner, EmptyState, StatusBadge, Notice, FilterPills } from '../ui';

type Filter = 'all' | 'ongoing' | 'completed' | 'waiting';

export const MyReviewsTab: React.FC<{ onUpdate?: () => void }> = ({ onUpdate }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    loadDocuments();
  }, [user?.uid]);

  const loadDocuments = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      // One scoped query for every document this reviewer has claimed.
      const myDocs = await documentService.getReviewerDocuments(user.uid);
      setDocuments(myDocs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (status: Document['status']) => {
    if (status === 'under_review') return 'Ongoing';
    if (status === 'needs_correction') return 'Waiting for Contributor';
    if (status === 'approved' || status === 'published' || status === 'rejected') return 'Completed';
    return 'Other';
  };

  const filteredDocuments = documents.filter((doc) => {
    if (filter === 'all') return true;
    if (filter === 'ongoing') return doc.status === 'under_review';
    if (filter === 'waiting') return doc.status === 'needs_correction';
    if (filter === 'completed')
      return doc.status === 'approved' || doc.status === 'published' || doc.status === 'rejected';
    return true;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filterOptions: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: documents.length },
    { id: 'ongoing', label: 'Ongoing', count: documents.filter((d) => d.status === 'under_review').length },
    { id: 'waiting', label: 'Waiting', count: documents.filter((d) => d.status === 'needs_correction').length },
    {
      id: 'completed',
      label: 'Completed',
      count: documents.filter(
        (d) => d.status === 'approved' || d.status === 'published' || d.status === 'rejected'
      ).length,
    },
  ];

  if (loading) {
    return <Spinner label="Loading reviews…" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">My Reviews</h2>
          <p className="text-sm text-slate-500">{documents.length} total reviews</p>
        </div>
        <FilterPills options={filterOptions} active={filter} onChange={setFilter} />
      </div>

      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} hover>
              <CardBody className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-slate-900">{doc.title}</h3>
                    <p className="line-clamp-2 text-sm text-slate-500">
                      {doc.description || doc.content.substring(0, 100)}...
                    </p>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>

                <div className="mb-4 space-y-1.5 text-sm text-slate-500">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category</span>
                    <span className="font-medium text-slate-700">{getCategoryLabel(doc.status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Author</span>
                    <span className="font-medium text-slate-700">{doc.contributorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Updated</span>
                    <span className="font-medium text-slate-700">{formatDate(doc.updatedAt)}</span>
                  </div>
                </div>

                {doc.status === 'under_review' && (
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => doc.id && setSelectedDocId(doc.id)}
                  >
                    <Eye className="h-4 w-4" />
                    Complete Review
                  </Button>
                )}

                {(doc.status === 'approved' ||
                  doc.status === 'published' ||
                  doc.status === 'rejected') && (
                  <Notice tone="success" className="text-center">Review completed</Notice>
                )}

                {doc.status === 'needs_correction' && (
                  <Notice tone="warning" className="text-center">Waiting for contributor corrections</Notice>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No reviews found"
          description="Documents you claim and complete will appear here."
        />
      )}

      {selectedDocId && (
        <ReviewModal
          documentId={selectedDocId}
          onClose={() => setSelectedDocId(null)}
          onSave={() => {
            loadDocuments();
            onUpdate?.();
          }}
        />
      )}
    </div>
  );
};
