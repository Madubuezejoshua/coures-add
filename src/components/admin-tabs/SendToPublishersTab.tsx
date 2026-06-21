import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { userManagementService, UserData } from '../../services/userManagementService';
import { Send, CheckCircle } from 'lucide-react';
import {
  Spinner,
  EmptyState,
  PageHeader,
  Notice,
  Button,
  Modal,
  FormField,
  Select,
  StatusBadge,
} from '../ui';

export const SendToPublishersTab: React.FC = () => {
  const { user } = useAuth();
  const [approvedDocs, setApprovedDocs] = useState<Document[]>([]);
  const [publishers, setPublishers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [selectedPublisher, setSelectedPublisher] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docs, users] = await Promise.all([
        documentService.getDocumentsForPublishing(),
        userManagementService.getAllUsers(),
      ]);
      setApprovedDocs(docs);
      setPublishers(users.filter((u) => u.role === 'publisher' && u.status === 'active'));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!selectedDoc || !selectedPublisher || !user) return;

    try {
      setSending(true);
      setError('');

      const publisher = publishers.find((p) => p.uid === selectedPublisher);
      if (!publisher) {
        setError('Publisher not found');
        return;
      }

      await documentService.assignPublisher(selectedDoc.id!, publisher.uid, publisher.displayName);
      await loadData();
      setSelectedDoc(null);
      setSelectedPublisher('');
    } catch (err) {
      console.error('Error assigning document:', err);
      setError('Failed to assign document to publisher');
    } finally {
      setSending(false);
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
      <PageHeader
        title="Send to Publishers"
        description={`${approvedDocs.length} approved documents ready for publishing`}
      />

      {publishers.length === 0 && (
        <Notice tone="warning">No active publishers available</Notice>
      )}

      {approvedDocs.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {approvedDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-slate-900">{doc.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {doc.description || doc.content.substring(0, 100)}
                  </p>
                </div>
                <StatusBadge status={doc.status} />
              </div>

              <div className="space-y-1.5 text-sm text-slate-500">
                <div className="flex justify-between">
                  <span className="text-slate-400">Author</span>
                  <span className="font-medium text-slate-700">{doc.contributorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reviewer</span>
                  <span className="font-medium text-slate-700">{doc.reviewerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Approved</span>
                  <span className="font-medium text-slate-700">{formatDate(doc.updatedAt)}</span>
                </div>
              </div>

              {doc.reviewComments && (
                <Notice className="mt-4" tone="info">
                  <strong>Review:</strong> {doc.reviewComments}
                </Notice>
              )}

              <div className="mt-4 border-t border-slate-100 pt-4">
                <Button
                  fullWidth
                  size="sm"
                  disabled={publishers.length === 0}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setError('');
                  }}
                >
                  <Send className="h-4 w-4" /> Assign to Publisher
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle}
          title="No approved documents waiting for publishing"
          description="Approved documents from reviewers will appear here for assignment."
        />
      )}

      {selectedDoc && (
        <Modal
          onClose={() => {
            setSelectedDoc(null);
            setSelectedPublisher('');
            setError('');
          }}
          title="Assign to Publisher"
          icon={<Send className="h-5 w-5 text-brand-600" />}
          size="sm"
          footer={
            <>
              <Button
                variant="outline"
                fullWidth
                disabled={sending}
                onClick={() => {
                  setSelectedDoc(null);
                  setSelectedPublisher('');
                  setError('');
                }}
              >
                Cancel
              </Button>
              <Button fullWidth loading={sending} disabled={!selectedPublisher || sending} onClick={handleSend}>
                {sending ? 'Assigning…' : 'Assign'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{selectedDoc.title}</p>
              <p className="text-sm text-slate-500">By {selectedDoc.contributorName}</p>
            </div>

            <FormField label="Select Publisher" required>
              <Select value={selectedPublisher} onChange={(e) => setSelectedPublisher(e.target.value)}>
                <option value="">Choose a publisher…</option>
                {publishers.map((publisher) => (
                  <option key={publisher.uid} value={publisher.uid}>
                    {publisher.displayName} ({publisher.email})
                  </option>
                ))}
              </Select>
            </FormField>

            {error && <Notice tone="danger">{error}</Notice>}
          </div>
        </Modal>
      )}
    </div>
  );
};
