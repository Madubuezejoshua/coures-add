import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { Timestamp } from 'firebase/firestore';
import { X, Loader } from 'lucide-react';

interface ReviewModalProps {
  documentId: string;
  onClose: () => void;
  onSave: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ documentId, onClose, onSave }) => {
  const { user, displayName } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
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

    try {
      setSubmitting(true);
      if (action === 'approve') {
        await documentService.updateDocumentStatus(documentId, 'approved', {
          reviewerId: user.uid,
          reviewerName: displayName || user.email || 'Unknown',
          reviewComments: comments,
        });
      } else {
        await documentService.updateDocumentStatus(documentId, 'rejected', {
          reviewerId: user.uid,
          reviewerName: displayName || user.email || 'Unknown',
          rejectionReason: comments,
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
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <p className="text-red-300">Document not found</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
          <h2 className="text-xl font-bold text-white">Review Document</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{document.title}</h3>
            <p className="text-slate-400 text-sm mb-4">By {document.contributorName}</p>
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
              <p className="text-slate-200 whitespace-pre-wrap">{document.content}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 border-t border-slate-700 pt-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Decision</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="approve"
                    checked={action === 'approve'}
                    onChange={(e) => setAction(e.target.value as 'approve')}
                    className="w-4 h-4"
                    disabled={submitting}
                  />
                  <span className="text-white">Approve</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="reject"
                    checked={action === 'reject'}
                    onChange={(e) => setAction(e.target.value as 'reject')}
                    className="w-4 h-4"
                    disabled={submitting}
                  />
                  <span className="text-white">Reject</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {action === 'approve' ? 'Approval Comments' : 'Rejection Reason'} *
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={action === 'approve' ? 'Provide feedback on the document...' : 'Explain why this document is rejected...'}
                rows={5}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={submitting}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={submitting}
              >
                {submitting && <Loader className="w-4 h-4 animate-spin" />}
                {submitting
                  ? 'Submitting...'
                  : action === 'approve'
                    ? 'Approve'
                    : 'Reject'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
