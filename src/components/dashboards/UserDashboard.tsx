import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { paymentService, Payment, DEFAULT_DOCUMENT_PRICE } from '../../services/paymentService';
import { fileDownloadUrl } from '../../lib/api';
import { DashboardShell } from '../layout/DashboardShell';
import { Card, Input, Spinner, EmptyState, Button, Modal, Notice, type TabItem } from '../ui';
import { Search, BookOpen, User, Calendar, FileText, ShoppingCart, Download, Lock, CheckCircle2 } from 'lucide-react';

const formatDate = (timestamp: any) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate?.() || new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

type View = 'library' | 'purchases';

export const UserDashboard: React.FC = () => {
  const { user, displayName } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>('library');
  const [reading, setReading] = useState<Document | null>(null);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setDocuments(await documentService.getPublishedDocuments());
      } catch (e) {
        console.error('Error loading published documents:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    return paymentService.subscribeUserPayments(user.uid, setPayments);
  }, [user?.uid]);

  const purchasedIds = useMemo(
    () => new Set(payments.filter((p) => p.type === 'purchase').map((p) => p.documentId)),
    [payments]
  );
  const hasPurchased = (doc: Document) => !!doc.id && purchasedIds.has(doc.id);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter(
      (d) => d.title.toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q) || d.contributorName.toLowerCase().includes(q)
    );
  }, [documents, search]);

  const purchasedDocs = useMemo(() => documents.filter(hasPurchased), [documents, purchasedIds]);

  const buy = async () => {
    if (!reading || !user) return;
    setBuying(true);
    setBuyError('');
    const result = await paymentService.purchaseDocument(reading, user.uid, displayName || user.email || 'Reader');
    setBuying(false);
    if (!result.success) setBuyError(result.error || 'Purchase failed');
  };

  const tabs: TabItem<View>[] = [
    { id: 'library', label: 'Library', icon: BookOpen, count: documents.length },
    { id: 'purchases', label: 'My Purchases', icon: ShoppingCart, count: purchasedDocs.length },
  ];

  const renderGrid = (docs: Document[]) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {docs.map((doc) => {
        const owned = hasPurchased(doc);
        return (
          <Card key={doc.id} hover className="flex flex-col p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700"><BookOpen className="h-5 w-5" /></span>
              {owned ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Owned</span>
              ) : (
                <span className="text-sm font-semibold text-slate-700">${doc.price ?? DEFAULT_DOCUMENT_PRICE}</span>
              )}
            </div>
            <h3 className="mt-3 line-clamp-2 text-base font-semibold text-ink">{doc.title}</h3>
            <p className="mt-1 line-clamp-3 flex-1 text-sm text-slate-500">{doc.description || doc.content.substring(0, 120)}</p>
            <div className="mt-3 space-y-1 text-xs text-slate-400">
              <p className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {doc.contributorName}</p>
              <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(doc.publishedAt || doc.updatedAt)}</p>
            </div>
            <Button size="sm" fullWidth className="mt-4" variant={owned ? 'success' : 'primary'} onClick={() => { setReading(doc); setBuyError(''); }}>
              {owned ? <><BookOpen className="h-4 w-4" /> Read</> : <><ShoppingCart className="h-4 w-4" /> View &amp; buy</>}
            </Button>
          </Card>
        );
      })}
    </div>
  );

  const owned = reading ? hasPurchased(reading) : false;

  return (
    <DashboardShell title="Library" subtitle="Browse, purchase and read published documents" tabs={tabs} active={view} onChange={setView}>
      {view === 'library' && (
        <div className="mb-5 max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents…" className="pl-10" />
          </div>
        </div>
      )}

      {loading ? (
        <Spinner label="Loading library…" />
      ) : view === 'purchases' ? (
        purchasedDocs.length ? renderGrid(purchasedDocs) : <EmptyState icon={ShoppingCart} title="No purchases yet" description="Documents you buy will appear here." />
      ) : filtered.length ? (
        renderGrid(filtered)
      ) : (
        <EmptyState icon={FileText} title={search ? 'No matches' : 'No published documents yet'} description={search ? 'Try a different search term.' : 'Published documents will appear here.'} />
      )}

      {reading && (
        <Modal
          onClose={() => setReading(null)}
          title={reading.title}
          size="lg"
          footer={
            <>
              <Button variant="outline" fullWidth onClick={() => setReading(null)}>Close</Button>
              {!owned && <Button fullWidth loading={buying} onClick={buy}><ShoppingCart className="h-4 w-4" /> Buy for ${reading.price ?? DEFAULT_DOCUMENT_PRICE}</Button>}
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {reading.contributorName}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDate(reading.publishedAt || reading.updatedAt)}</span>
            </div>
            {reading.description && <p className="text-slate-600">{reading.description}</p>}
            {owned ? (
              <>
                <Notice tone="success" className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> You own this document — full access unlocked.</Notice>
                <div className="max-h-96 overflow-y-auto rounded-xl border border-cream-200 bg-cream p-5">
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{reading.content}</p>
                </div>
                {reading.fileUrl && (
                  <a href={fileDownloadUrl(reading.fileUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-brand-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-brand-400">
                    <Download className="h-4 w-4" /> Download {reading.fileName || 'file'}
                  </a>
                )}
              </>
            ) : (
              <>
                <div className="relative max-h-56 overflow-hidden rounded-xl border border-cream-200 bg-cream p-5">
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{reading.content.slice(0, 600)}</p>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-cream to-transparent" />
                </div>
                <Notice tone="warning" className="flex items-center gap-2"><Lock className="h-4 w-4 shrink-0" /> Purchase to unlock the full document and download. (Simulated payment.)</Notice>
                {buyError && <Notice tone="danger">{buyError}</Notice>}
              </>
            )}
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
};
