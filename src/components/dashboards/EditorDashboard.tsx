import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { DashboardShell } from '../layout/DashboardShell';
import { Spinner, EmptyState, Button, Notice, Modal, FormField, Select, Textarea, type TabItem } from '../ui';
import { FileText, Users, Send, CheckCircle2, ArrowRightCircle } from 'lucide-react';

type Tab = 'queue' | 'reviewing' | 'ready';

type UserOption = { id: string; full_name: string; email: string };

const statusLabel = (status: Document['status']) => {
  switch (status) {
    case 'submitted': return 'New submission';
    case 'under_review': return 'Under review';
    case 'needs_correction': return 'Needs revision';
    case 'approved': return 'Approved';
    case 'ready_for_publishing': return 'Ready for publisher';
    default: return status;
  }
};

export const EditorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [reviewers, setReviewers] = useState<UserOption[]>([]);
  const [publishers, setPublishers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('queue');
  const [modalMode, setModalMode] = useState<'reviewer' | 'publisher' | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [notes, setNotes] = useState('');
  const [actioning, setActioning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user?.uid]);

  const loadData = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const [queue, reviewerList, publisherList] = await Promise.all([
        documentService.getEditorQueue(),
        documentService.getReviewers(),
        documentService.getPublishers(),
      ]);
      setDocuments(queue);
      setReviewers(reviewerList);
      setPublishers(publisherList);
    } catch (error) {
      console.error('Error loading editor queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedDocuments = useMemo(() => {
    const queue = documents.filter((doc) => doc.status === 'submitted');
    const reviewing = documents.filter((doc) => doc.status === 'under_review');
    const revisions = documents.filter((doc) => doc.status === 'needs_correction');
    const ready = documents.filter((doc) => doc.status === 'approved' || doc.status === 'ready_for_publishing');
    return { queue, reviewing, revisions, ready };
  }, [documents]);

  const tabs: TabItem<Tab>[] = [
    { id: 'queue', label: 'New Submissions', icon: FileText, count: groupedDocuments.queue.length },
    { id: 'reviewing', label: 'In Review', icon: Users, count: groupedDocuments.reviewing.length + groupedDocuments.revisions.length },
    { id: 'ready', label: 'Ready to Publish', icon: CheckCircle2, count: groupedDocuments.ready.length },
  ];

  const openAssignModal = (doc: Document) => {
    setSelectedDocId(doc.id || null);
    setSelectedReviewer(doc.reviewerId || '');
    setSelectedPublisher(doc.publisherId || '');
    setModalMode('reviewer');
    setNotes('');
    setMessage(null);
  };

  const openAssignPublisherModal = (doc: Document) => {
    setSelectedDocId(doc.id || null);
    setSelectedPublisher(doc.publisherId || '');
    setModalMode('publisher');
    setSelectedReviewer('');
    setNotes('');
    setMessage(null);
  };

  const handleAssignReviewer = async () => {
    if (!selectedDocId || !selectedReviewer) {
      setMessage('Choose a reviewer before continuing.');
      return;
    }

    const reviewer = reviewers.find((item) => item.id === selectedReviewer);
    if (!reviewer) {
      setMessage('The selected reviewer is no longer available.');
      return;
    }

    try {
      setActioning(true);
      await documentService.assignReviewer(selectedDocId, reviewer.id, reviewer.full_name);
      await loadData();
      setSelectedDocId(null);
      setSelectedReviewer('');
      setNotes('');
      setMessage(null);
    } catch (error: any) {
      setMessage(error?.message || 'Unable to assign reviewer.');
    } finally {
      setActioning(false);
    }
  };

  const handleReturnToAuthor = async (doc: Document) => {
    if (!doc.id) return;
    try {
      setActioning(true);
      await documentService.returnToAuthor(doc.id, notes || undefined);
      await loadData();
      setSelectedDocId(null);
      setNotes('');
      setMessage(null);
    } catch (error: any) {
      setMessage(error?.message || 'Unable to return the manuscript.');
    } finally {
      setActioning(false);
    }
  };

  const handleAssignPublisher = async () => {
    if (!selectedDocId || !selectedPublisher) {
      setMessage('Choose a publisher before continuing.');
      return;
    }

    const publisher = publishers.find((item) => item.id === selectedPublisher);
    if (!publisher) {
      setMessage('The selected publisher is no longer available.');
      return;
    }

    try {
      setActioning(true);
      await documentService.assignPublisher(selectedDocId, publisher.id, publisher.full_name);
      await loadData();
      setSelectedDocId(null);
      setSelectedPublisher('');
      setModalMode(null);
      setMessage(null);
    } catch (error: any) {
      setMessage(error?.message || 'Unable to assign publisher.');
    } finally {
      setActioning(false);
    }
  };

  const renderList = (docs: Document[], emptyTitle: string, emptyDescription: string) => {
    if (docs.length === 0) {
      return <EmptyState icon={FileText} title={emptyTitle} description={emptyDescription} />;
    }

    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {docs.map((doc) => (
          <div key={doc.id} className="rounded-2xl border border-cream-200 bg-white p-5 shadow-card">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-ink">{doc.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{doc.description || doc.content.substring(0, 100)}</p>
              </div>
              <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">{statusLabel(doc.status)}</span>
            </div>
            <div className="space-y-1.5 text-sm text-slate-500">
              <p className="flex items-center gap-2"><FileText className="h-4 w-4" /> {doc.contributorName}</p>
              {doc.reviewerName && <p className="flex items-center gap-2"><Users className="h-4 w-4" /> {doc.reviewerName}</p>}
              {doc.publisherName && <p className="flex items-center gap-2"><Send className="h-4 w-4" /> {doc.publisherName}</p>}
              {doc.reviewComments && <p className="text-slate-600">Review: {doc.reviewComments}</p>}
              {doc.correctionNotes && <p className="text-amber-700">Revision note: {doc.correctionNotes}</p>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => openAssignModal(doc)}><Users className="h-4 w-4" /> Assign reviewer</Button>
              {doc.status === 'needs_correction' && (
                <Button size="sm" variant="outline" onClick={() => { setSelectedDocId(doc.id || null); setNotes(doc.correctionNotes || ''); setMessage(null); handleReturnToAuthor(doc); }}><ArrowRightCircle className="h-4 w-4" /> Return to author</Button>
              )}
              {doc.status === 'approved' && (
                <Button size="sm" variant="success" onClick={() => openAssignPublisherModal(doc)}><Send className="h-4 w-4" /> Assign publisher</Button>
              )}
              {doc.status === 'ready_for_publishing' && (
                <Button size="sm" variant="outline" onClick={() => openAssignPublisherModal(doc)}><Send className="h-4 w-4" /> Reassign publisher</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardShell title="Editor Dashboard" subtitle="Manage submissions, assign reviewers, and route manuscripts through the workflow" tabs={tabs} active={activeTab} onChange={setActiveTab}>
      {message && <Notice tone="danger" className="mb-4">{message}</Notice>}

      {activeTab === 'queue' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-ink">New submissions</h2>
            <p className="text-sm text-slate-500">Assign reviewers and move manuscripts into the review stage.</p>
          </div>
          {loading ? <Spinner label="Loading editor queue…" /> : renderList(groupedDocuments.queue, 'No new submissions', 'New manuscripts will appear here as soon as authors submit them.')}
        </div>
      )}

      {activeTab === 'reviewing' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-ink">Manuscripts in review</h2>
            <p className="text-sm text-slate-500">Track manuscripts under review and those waiting for author revision.</p>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Under review</h3>
              {loading ? <Spinner label="Loading review queue…" /> : renderList(groupedDocuments.reviewing, 'No manuscripts under review', 'Assigned manuscripts will appear here once a reviewer has been selected.')}
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Needs revision</h3>
              {loading ? <Spinner label="Loading revisions…" /> : renderList(groupedDocuments.revisions, 'No revision requests', 'Manuscripts returned to the author for corrections will appear here.')}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ready' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-ink">Ready for publisher</h2>
            <p className="text-sm text-slate-500">Forward approved manuscripts to the publisher.</p>
          </div>
          {loading ? <Spinner label="Loading publish queue…" /> : renderList(groupedDocuments.ready, 'No manuscripts ready', 'Approved manuscripts will appear here once the editor is ready to hand them off.')}
        </div>
      )}

      {selectedDocId && modalMode === 'reviewer' && (
        <Modal
          onClose={() => { setSelectedDocId(null); setSelectedReviewer(''); setSelectedPublisher(''); setModalMode(null); setNotes(''); setMessage(null); }}
          title="Assign Reviewer"
          icon={<Users className="h-5 w-5 text-brand-700" />}
          size="md"
          footer={
            <>
              <Button variant="outline" fullWidth onClick={() => { setSelectedDocId(null); setSelectedReviewer(''); setSelectedPublisher(''); setModalMode(null); setNotes(''); setMessage(null); }} disabled={actioning}>Cancel</Button>
              <Button fullWidth loading={actioning} onClick={handleAssignReviewer} disabled={actioning || !selectedReviewer}>Assign reviewer</Button>
            </>
          }
        >
          <div className="space-y-4">
            <FormField label="Reviewer" required>
              <Select value={selectedReviewer} onChange={(e) => setSelectedReviewer(e.target.value)}>
                <option value="">Choose a reviewer…</option>
                {reviewers.map((reviewer) => <option key={reviewer.id} value={reviewer.id}>{reviewer.full_name} ({reviewer.email})</option>)}
              </Select>
            </FormField>
            <FormField label="Editor note">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Optional instruction for the reviewer" />
            </FormField>
            {message && <Notice tone="danger">{message}</Notice>}
          </div>
        </Modal>
      )}

      {selectedDocId && modalMode === 'publisher' && (
        <Modal
          onClose={() => { setSelectedDocId(null); setSelectedReviewer(''); setSelectedPublisher(''); setModalMode(null); setNotes(''); setMessage(null); }}
          title="Assign Publisher"
          icon={<Send className="h-5 w-5 text-brand-700" />}
          size="md"
          footer={
            <>
              <Button variant="outline" fullWidth onClick={() => { setSelectedDocId(null); setSelectedReviewer(''); setSelectedPublisher(''); setModalMode(null); setNotes(''); setMessage(null); }} disabled={actioning}>Cancel</Button>
              <Button fullWidth loading={actioning} onClick={handleAssignPublisher} disabled={actioning || !selectedPublisher}>Assign publisher</Button>
            </>
          }
        >
          <div className="space-y-4">
            <FormField label="Publisher" required>
              <Select value={selectedPublisher} onChange={(e) => setSelectedPublisher(e.target.value)}>
                <option value="">Choose a publisher…</option>
                {publishers.map((publisher) => <option key={publisher.id} value={publisher.id}>{publisher.full_name} ({publisher.email})</option>)}
              </Select>
            </FormField>
            <Notice tone="info">Once assigned, the selected publisher will receive the manuscript in their queue and can publish it for readers.</Notice>
            {message && <Notice tone="danger">{message}</Notice>}
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
};
