import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { Timestamp } from 'firebase/firestore';
import { X, Loader, Globe } from 'lucide-react';

interface PublishModalProps {
  documentId: string;
  onClose: () => void;
  onSave: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ documentId, onClose, onSave }) => {
  const { user, displayName } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
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

  const handlePublish = async () => {
    if (!user) return;

    try {
      setPublishing(true);
      await documentService.updateDocumentStatus(documentId, 'published', {
        publisherId: user.uid,
        publisherName: displayName || user.email || 'Unknown',
        publishedAt: Timestamp.now(),
      });
      onSave();
      onClose();
    } catch (err) {
      console.error('Error publishing document:', err);
      setError('Failed to publish document');
    } finally {
      setPublishing(false);
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
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Publish Document</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{document.title}</h3>
            <p className="text-slate-400 text-sm mb-4">By {document.contributorName}</p>
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4 max-h-48 overflow-y-auto">
              <p className="text-slate-200 text-sm whitespace-pre-wrap">{document.content.substring(0, 300)}...</p>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <p className="text-purple-200 text-sm">
              <strong>Review Status:</strong> Approved by {document.reviewerName}
            </p>
            {document.reviewComments && (
              <p className="text-purple-200 text-sm mt-2">
                <strong>Comments:</strong> {document.reviewComments}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg">
            <p className="text-slate-300 text-sm">
              Once published, this document will be available to the public and cannot be unpublished.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={publishing}
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={publishing}
            >
              {publishing && <Loader className="w-4 h-4 animate-spin" />}
              {publishing ? 'Publishing...' : 'Publish Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
