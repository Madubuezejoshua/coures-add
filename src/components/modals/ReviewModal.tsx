import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { FileSearch } from 'lucide-react';
import { Button, FormField, Textarea, Notice, Spinner, Modal } from '../ui';

interface ReviewModalProps {
  documentId: string;
  onClose: () => void;
  onSave: () => void;
}

type Action = 'approve' | 'reject' | 'corrections';

const ACTION_META: Record<Action, { label: string; field: string; placeholder: string }> = {
  approve: {
    label: 'Approve',
    field: 'Approval Comments',
    placeholder: 'Provide feedback on the document...',
  },
  reject: {
    label: 'Reject',
    field: 'Rejection Reason',
    placeholder: 'Explain why this document is rejected...',
  },
  corrections: {
    label: 'Request Corrections',
    field: 'Correction Notes',
    placeholder: 'Describe the corrections the contributor should make...',
  },
};

export const ReviewModal: React.FC<ReviewModalProps> = ({ documentId, onClose, onSave }) => {
  const { user, displayName } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<Action>('approve');
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    try {
      const doc = await documentService.getDocument(documentId);
      setDocument(doc);
    } catch (err) {
      console.error('Error loading document:', err);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim() || !user) {
      setError('Please provide comments');
      return;
    }

    const reviewerId = user.uid;
    const reviewerName = displayName || user.email || 'Unknown';

    try {
      setSubmitting(true);
      if (action === 'approve') {
        await documentService.updateDocumentStatus(documentId, 'approved', {
          reviewerId,
          reviewerName,
          reviewComments: comments,
        });
      } else if (action === 'reject') {
        await documentService.updateDocumentStatus(documentId, 'rejected', {
          reviewerId,
          reviewerName,
          rejectionReason: comments,
        });
      } else {
        await documentService.updateDocumentStatus(documentId, 'needs_correction', {
          reviewerId,
          reviewerName,
          correctionNotes: comments,
        });
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Error updating document:', err);
      setError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Modal onClose={onClose} title="Review Document" icon={<FileSearch className="h-6 w-6 text-brand-500" />} size="lg">
        <Spinner label="Loading document…" />
      </Modal>
    );
  }

  if (!document) {
    return (
      <Modal
        onClose={onClose}
        title="Review Document"
        icon={<FileSearch className="h-6 w-6 text-brand-500" />}
        size="lg"
        footer={
          <Button variant="outline" fullWidth onClick={onClose}>
            Close
          </Button>
        }
      >
        <Notice tone="danger">Document not found.</Notice>
      </Modal>
    );
  }

  const meta = ACTION_META[action];
  const submitVariant = action === 'approve' ? 'success' : action === 'reject' ? 'danger' : 'primary';

  return (
    <Modal
      onClose={onClose}
      title="Review Document"
      icon={<FileSearch className="h-6 w-6 text-brand-500" />}
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" fullWidth onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="review-form"
            variant={submitVariant}
            fullWidth
            loading={submitting}
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : meta.label}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{document.title}</h3>
          <p className="mt-1 text-sm text-slate-500">By {document.contributorName}</p>
          <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{document.content}</p>
          </div>
        </div>

        <form id="review-form" onSubmit={handleSubmit} className="space-y-4 border-t border-slate-100 pt-6">
          <FormField label="Decision">
            <div className="flex flex-wrap gap-4">
              {(Object.keys(ACTION_META) as Action[]).map((key) => (
                <label key={key} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="review-action"
                    value={key}
                    checked={action === key}
                    onChange={() => setAction(key)}
                    className="h-4 w-4 accent-brand-600"
                    disabled={submitting}
                  />
                  <span className="text-sm font-medium text-slate-700">{ACTION_META[key].label}</span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label={meta.field} required>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={meta.placeholder}
              rows={5}
              disabled={submitting}
            />
          </FormField>

          {error && <Notice tone="danger">{error}</Notice>}
        </form>
      </div>
    </Modal>
  );
};
