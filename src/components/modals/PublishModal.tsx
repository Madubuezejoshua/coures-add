import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { Globe } from 'lucide-react';
import { Button, Notice, Spinner, Modal } from '../ui';

interface PublishModalProps {
  documentId: string;
  onClose: () => void;
  onSave: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ documentId, onClose, onSave }) => {
  const { user } = useAuth();
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
      await documentService.updateDocumentStatus(documentId, 'published');
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
      <Modal onClose={onClose} title="Publish Document" icon={<Globe className="h-6 w-6 text-brand-500" />}>
        <Spinner label="Loading document…" />
      </Modal>
    );
  }

  if (!document) {
    return (
      <Modal
        onClose={onClose}
        title="Publish Document"
        icon={<Globe className="h-6 w-6 text-brand-500" />}
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

  return (
    <Modal
      onClose={onClose}
      title="Publish Document"
      icon={<Globe className="h-6 w-6 text-brand-500" />}
      footer={
        <>
          <Button variant="outline" fullWidth onClick={onClose} disabled={publishing}>
            Cancel
          </Button>
          <Button variant="success" fullWidth onClick={handlePublish} loading={publishing} disabled={publishing}>
            <Globe className="h-4 w-4" /> {publishing ? 'Publishing…' : 'Publish Now'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{document.title}</h3>
          <p className="mt-1 text-sm text-slate-500">By {document.contributorName}</p>
          <div className="mt-4 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {document.content.substring(0, 300)}...
            </p>
          </div>
        </div>

        <Notice tone="success">
          <strong>Review Status:</strong> Approved by {document.reviewerName}
          {document.reviewComments && (
            <span className="mt-2 block">
              <strong>Comments:</strong> {document.reviewComments}
            </span>
          )}
        </Notice>

        {error && <Notice tone="danger">{error}</Notice>}

        <Notice tone="warning">
          Once published, this document will be available to the public and cannot be unpublished.
        </Notice>
      </div>
    </Modal>
  );
};
