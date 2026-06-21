import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { FileSearch, ExternalLink, Download } from 'lucide-react';
import { Button, FormField, Textarea, Notice, Spinner, Modal } from '../ui';
import { fileDownloadUrl } from '../../lib/api';

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
    } catch (err: any) {
      console.error('Error updating document:', err);
      const message =
        err?.status === 401
          ? 'Your session has expired. Please sign in again and try submitting the review.'
          : err?.status === 403
            ? 'You are not allowed to submit this review.'
            : err?.message || 'Failed to submit review';
      setError(message);
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
  const previewUrl = document.fileUrl ? fileDownloadUrl(document.fileUrl) : undefined;
  const isPdf = document.fileType?.includes('pdf') || document.fileName?.toLowerCase().endsWith('.pdf');

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

          {previewUrl && (
            <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">Attached document</p>
                  <p className="text-xs text-slate-500">{document.fileName || 'Document file'}</p>
                </div>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  <ExternalLink className="h-4 w-4" /> Open
                </a>
              </div>

              {isPdf && (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <iframe
                    src={previewUrl}
                    title={`${document.title} preview`}
                    className="h-[420px] w-full"
                  />
                </div>
              )}

              {!isPdf && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-4 w-4" /> Download / view file
                </a>
              )}
            </div>
          )}

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
