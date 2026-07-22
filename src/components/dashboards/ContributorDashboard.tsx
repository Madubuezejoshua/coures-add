import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { DashboardShell } from '../layout/DashboardShell';
import { DocumentCard } from '../DocumentCard';
import { UploadTab } from '../contributor-tabs/UploadTab';
import { CorrectionsTab } from '../contributor-tabs/CorrectionsTab';
import { Spinner, EmptyState, Button, type TabItem } from '../ui';
import { Upload, AlertCircle, FileText } from 'lucide-react';

type Tab = 'upload' | 'corrections' | 'my-documents';

export const ContributorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('upload');

  useEffect(() => {
    loadDocuments();
  }, [user?.uid]);

  const loadDocuments = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const docs = await documentService.getContributorDocuments(user.uid);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs: TabItem<Tab>[] = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'corrections', label: 'Corrections', icon: AlertCircle },
    { id: 'my-documents', label: 'My Documents', icon: FileText, count: documents.length },
  ];

  return (
    <DashboardShell
      title="Author Dashboard"
      subtitle="Create manuscripts, submit them for review, and track feedback"
      tabs={tabs}
      active={activeTab}
      onChange={setActiveTab}
    >
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
                <DocumentCard key={doc.id} document={doc} isOwner />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No documents yet"
              description="Upload your first manuscript to start the review workflow."
              action={<Button onClick={() => setActiveTab('upload')}>Upload a document</Button>}
            />
          )}
        </div>
      )}
    </DashboardShell>
  );
};
