import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { DashboardShell } from '../layout/DashboardShell';
import { DocumentCard } from '../DocumentCard';
import { UploadTab } from '../editor-tabs/UploadTab';
import { CorrectionsTab } from '../editor-tabs/CorrectionsTab';
import { paymentService, PUBLICATION_FEE } from '../../services/paymentService';
import { Spinner, EmptyState, Button, Modal, Notice, type TabItem } from '../ui';
import { Upload, AlertCircle, FileText, CreditCard } from 'lucide-react';

type Tab = 'upload' | 'corrections' | 'my-documents';

export const EditorDashboard: React.FC = () => {
  const { user, displayName } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [payDoc, setPayDoc] = useState<Document | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [user?.uid]);

  const loadDocuments = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      setDocuments(await documentService.getContributorDocuments(user.uid));
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!payDoc || !user) return;
    setPaying(true);
    setPayError('');
    const result = await paymentService.payPublicationFee(payDoc, user.uid, displayName || user.email || 'Editor');
    setPaying(false);
    if (result.success) {
      setPayDoc(null);
      loadDocuments();
    } else {
      setPayError(result.error || 'Payment failed');
    }
  };

  const tabs: TabItem<Tab>[] = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'corrections', label: 'Corrections', icon: AlertCircle },
    { id: 'my-documents', label: 'My Documents', icon: FileText, count: documents.length },
  ];

  return (
    <DashboardShell title="Editor Dashboard" subtitle="Review submissions, assign reviewers and route manuscripts" tabs={tabs} active={activeTab} onChange={setActiveTab}>
      {activeTab === 'upload' && <UploadTab onUploadComplete={() => { loadDocuments(); setActiveTab('my-documents'); }} />}
      {activeTab === 'corrections' && <CorrectionsTab onCorrection={loadDocuments} />}
      {activeTab === 'my-documents' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-ink">My Documents</h2>
            <p className="text-sm text-slate-500">{documents.length} document{documents.length === 1 ? '' : 's'}</p>
          </div>
          {loading ? (
            <Spinner label="Loading your documents…" />
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  isOwner
                  onPay={doc.status === 'approved' ? () => { setPayDoc(doc); setPayError(''); } : undefined}
                  payLabel={`Pay $${PUBLICATION_FEE} to publish`}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon={FileText} title="No documents yet" description="Upload your first document to start the review workflow." action={<Button onClick={() => setActiveTab('upload')}>Upload a document</Button>} />
          )}
        </div>
      )}

      {payDoc && (
        <Modal
          onClose={() => setPayDoc(null)}
          title="Pay publication fee"
          icon={<CreditCard className="h-5 w-5 text-brand-700" />}
          size="sm"
          footer={
            <>
              <Button variant="outline" fullWidth onClick={() => setPayDoc(null)} disabled={paying}>Cancel</Button>
              <Button fullWidth loading={paying} onClick={handlePay}>Pay ${PUBLICATION_FEE}</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-cream p-4 text-sm">
              <p className="font-semibold text-ink">{payDoc.title}</p>
              <p className="mt-1 text-slate-500">Publication fee: <span className="font-semibold text-ink">${PUBLICATION_FEE}</span></p>
            </div>
            <Notice tone="info">Simulated payment. On confirming, the document moves to <strong>Ready to Publish</strong>.</Notice>
            {payError && <Notice tone="danger">{payError}</Notice>}
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
};
