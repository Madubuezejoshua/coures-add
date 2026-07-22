import React, { useState, useEffect } from 'react';
import { documentService, Document } from '../../services/documentService';
import { poll, fileDownloadUrl } from '../../lib/api';
import { DashboardShell } from '../layout/DashboardShell';
import { PublishModal } from '../modals/PublishModal';
import { StatCard, Spinner, EmptyState, Button, StatusBadge, Modal, Notice, type TabItem } from '../ui';
import { Globe, FileText, CheckCircle2, Clock, Eye, Calendar, User } from 'lucide-react';

type Tab = 'pending' | 'published';

const formatDate = (timestamp: any) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate?.() || new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const PublisherDashboard: React.FC = () => {
  const [approvedDocs, setApprovedDocs] = useState<Document[]>([]);
  const [publishedDocs, setPublishedDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('pending');

  useEffect(() => {
    return poll(
      async () => {
        const [ready, published] = await Promise.all([
          documentService.getDocumentsReadyForPublishing(),
          documentService.getPublishedDocuments(),
        ]);
        return { ready, published };
      },
      ({ ready, published }) => {
        setApprovedDocs(ready);
        setPublishedDocs(published);
        setLoading(false);
      },
      15000
    );
  }, []);

  const tabs: TabItem<Tab>[] = [
    { id: 'pending', label: 'Pending', icon: Clock, count: approvedDocs.length },
    { id: 'published', label: 'Published', icon: CheckCircle2, count: publishedDocs.length },
  ];

  const currentDocs = activeTab === 'pending' ? approvedDocs : publishedDocs;

  return (
    <DashboardShell title="Publisher Dashboard" subtitle="Publish approved manuscripts and manage the release queue" tabs={tabs} active={activeTab} onChange={setActiveTab}>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Clock} tone="amber" label="Awaiting publication" value={approvedDocs.length} />
        <StatCard icon={Globe} tone="emerald" label="Published" value={publishedDocs.length} hint="Live documents" />
        <StatCard icon={FileText} tone="brand" label="Total" value={approvedDocs.length + publishedDocs.length} />
      </div>

      {loading ? (
        <Spinner label="Loading documents…" />
      ) : currentDocs.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {currentDocs.map((doc) => (
            <div key={doc.id} className="rounded-2xl border border-cream-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-ink">{doc.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{doc.description || doc.content.substring(0, 100)}</p>
                </div>
                <StatusBadge status={doc.status} />
              </div>
              <div className="space-y-1.5 text-sm text-slate-500">
                <p className="flex items-center gap-2"><User className="h-4 w-4 text-slate-400" /> {doc.contributorName}</p>
                {doc.reviewerName && <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" /> Reviewed by {doc.reviewerName}</p>}
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {doc.status === 'published' && doc.publishedAt ? `Published ${formatDate(doc.publishedAt)}` : `Updated ${formatDate(doc.updatedAt)}`}
                </p>
              </div>
              {doc.reviewComments && <Notice className="mt-4" tone="info"><strong>Review:</strong> {doc.reviewComments}</Notice>}
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" fullWidth onClick={() => setPreviewDoc(doc)}><Eye className="h-4 w-4" /> Preview</Button>
                {doc.status === 'ready_for_publishing' && doc.id && (
                  <Button variant="success" size="sm" fullWidth onClick={() => setSelectedDocId(doc.id!)}><Globe className="h-4 w-4" /> Publish</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title={activeTab === 'pending' ? 'Nothing awaiting publication' : 'No published documents yet'}
          description={activeTab === 'pending' ? 'Approved & paid documents will appear here.' : 'Documents you publish will be listed here.'}
        />
      )}

      {selectedDocId && <PublishModal documentId={selectedDocId} onClose={() => setSelectedDocId(null)} onSave={() => setSelectedDocId(null)} />}

      {previewDoc && (
        <Modal
          onClose={() => setPreviewDoc(null)}
          title="Document Preview"
          size="lg"
          footer={
            <>
              <Button variant="outline" fullWidth onClick={() => setPreviewDoc(null)}>Close</Button>
              {previewDoc.status === 'ready_for_publishing' && previewDoc.id && (
                <Button variant="success" fullWidth onClick={() => { setSelectedDocId(previewDoc.id!); setPreviewDoc(null); }}><Globe className="h-4 w-4" /> Publish Now</Button>
              )}
            </>
          }
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-ink">{previewDoc.title}</h2>
              <StatusBadge status={previewDoc.status} />
            </div>
            {previewDoc.description && <p className="text-slate-600">{previewDoc.description}</p>}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-400">Author</p><p className="font-medium text-slate-800">{previewDoc.contributorName}</p></div>
              {previewDoc.reviewerName && <div><p className="text-slate-400">Reviewer</p><p className="font-medium text-slate-800">{previewDoc.reviewerName}</p></div>}
              <div><p className="text-slate-400">Created</p><p className="font-medium text-slate-800">{formatDate(previewDoc.createdAt)}</p></div>
              {previewDoc.publishedAt && <div><p className="text-slate-400">Published</p><p className="font-medium text-slate-800">{formatDate(previewDoc.publishedAt)}</p></div>}
            </div>
            {previewDoc.reviewComments && <Notice tone="info"><strong>Review comments:</strong> {previewDoc.reviewComments}</Notice>}
            <div>
              <p className="mb-2 text-sm font-medium text-slate-500">Document content</p>
              <div className="max-h-80 overflow-y-auto rounded-xl border border-cream-200 bg-cream p-5">
                <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{previewDoc.content}</p>
              </div>
            </div>
            {previewDoc.fileUrl && (
              <a href={fileDownloadUrl(previewDoc.fileUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-brand-100 px-4 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-200">
                <FileText className="h-4 w-4" /> {previewDoc.fileName || 'Download file'}
              </a>
            )}
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
};
