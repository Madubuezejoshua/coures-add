import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { AlertCircle, Send, Eye } from 'lucide-react';
import { Card, CardBody, Textarea, Button, Notice, StatusBadge, Spinner, EmptyState, Modal } from '../ui';

export const CorrectionsTab: React.FC<{ onCorrection: () => void }> = ({ onCorrection }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [correctedContent, setCorrectedContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [user?.uid]);

  const loadDocuments = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const docs = await documentService.getRejectedDocuments(user.uid);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCorrection = async () => {
    if (!selectedDoc || !correctedContent.trim()) {
      setError('Please provide corrected content');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await documentService.resubmitDocument(selectedDoc.id!, correctedContent);
      await loadDocuments();
      setSelectedDoc(null);
      setCorrectedContent('');
      onCorrection();
    } catch (err) {
      console.error('Error submitting correction:', err);
      setError('Failed to submit correction');
    } finally {
      setSubmitting(false);
    }
  };

  const renderHighlightedContent = (doc: Document) => {
    if (!doc.highlights || doc.highlights.length === 0) {
      return <p className="whitespace-pre-wrap text-slate-700">{doc.content}</p>;
    }

    const content = doc.content;
    const sortedHighlights = [...doc.highlights].sort((a, b) => a.start - b.start);
    const segments: JSX.Element[] = [];
    let lastIndex = 0;

    sortedHighlights.forEach((highlight) => {
      if (highlight.start > lastIndex) {
        segments.push(
          <span key={`text-${lastIndex}`}>
            {content.substring(lastIndex, highlight.start)}
          </span>
        );
      }

      const colorClass = {
        red: 'bg-red-500/30 border-b-2 border-red-500',
        blue: 'bg-purple-500/30 border-b-2 border-purple-500',
        yellow: 'bg-yellow-500/30 border-b-2 border-yellow-500',
      }[highlight.color] || 'bg-slate-500/30 border-b-2 border-slate-500';

      segments.push(
        <span key={highlight.start} className={`${colorClass} px-1 rounded relative group`}>
          {content.substring(highlight.start, highlight.end)}
          {highlight.note && (
            <span className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded p-2 whitespace-nowrap z-10 border border-slate-700">
              {highlight.note}
            </span>
          )}
        </span>
      );

      lastIndex = highlight.end;
    });

    if (lastIndex < content.length) {
      segments.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>);
    }

    return <div className="whitespace-pre-wrap leading-relaxed text-slate-700">{segments}</div>;
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
        <h2 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">Corrections Needed</h2>
        <p className="text-sm text-slate-500">Review feedback and submit corrections</p>
      </div>

      {documents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardBody className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-slate-900">{doc.title}</h3>
                    <p className="text-sm text-slate-500">
                      Reviewer: {doc.reviewerName} • {formatDate(doc.updatedAt)}
                    </p>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>

                {doc.correctionNotes && (
                  <Notice className="mb-4" tone="warning">
                    <strong>Correction Notes:</strong> {doc.correctionNotes}
                  </Notice>
                )}

                {doc.rejectionReason && (
                  <Notice className="mb-4" tone="danger">
                    <strong>Reason:</strong> {doc.rejectionReason}
                  </Notice>
                )}

                {doc.reviewComments && (
                  <Notice className="mb-4" tone="info">
                    <strong>Review Comments:</strong> {doc.reviewComments}
                  </Notice>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setSelectedDoc(doc);
                    setCorrectedContent(doc.content);
                    setError('');
                  }}
                >
                  <Eye className="h-4 w-4" />
                  View &amp; Correct
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={AlertCircle}
          title="No corrections needed"
          description="Documents that need your attention will appear here."
        />
      )}

      {selectedDoc && (
        <Modal
          onClose={() => {
            setSelectedDoc(null);
            setCorrectedContent('');
            setError('');
          }}
          title="Make Corrections"
          size="lg"
          footer={
            <>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setSelectedDoc(null);
                  setCorrectedContent('');
                  setError('');
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                loading={submitting}
                disabled={submitting || !correctedContent.trim()}
                onClick={handleSubmitCorrection}
              >
                {submitting ? 'Submitting...' : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Corrections
                  </>
                )}
              </Button>
            </>
          }
        >
          <div className="space-y-6">
            <div>
              <h4 className="mb-2 text-lg font-semibold text-slate-900">{selectedDoc.title}</h4>
              <p className="text-sm text-slate-500">Reviewer: {selectedDoc.reviewerName}</p>
            </div>

            {selectedDoc.correctionNotes && (
              <Notice tone="warning">
                <strong>Correction Notes:</strong> {selectedDoc.correctionNotes}
              </Notice>
            )}

            {selectedDoc.reviewComments && (
              <Notice tone="info">
                <strong>Review Comments:</strong> {selectedDoc.reviewComments}
              </Notice>
            )}

            <div>
              <h5 className="mb-2 text-sm font-medium text-slate-700">
                Original Content (with highlights)
              </h5>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
                {renderHighlightedContent(selectedDoc)}
              </div>
            </div>

            <div>
              <h5 className="mb-2 text-sm font-medium text-slate-700">Corrected Content *</h5>
              <Textarea
                value={correctedContent}
                onChange={(e) => setCorrectedContent(e.target.value)}
                rows={12}
                className="font-mono text-sm"
                placeholder="Enter your corrected content"
              />
            </div>

            {error && <Notice tone="danger">{error}</Notice>}
          </div>
        </Modal>
      )}
    </div>
  );
};
