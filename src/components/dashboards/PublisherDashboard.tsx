import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { HeaderNav } from '../HeaderNav';
import { PublishModal } from '../modals/PublishModal';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Globe, FileText, CheckCircle, Clock, Eye, X, Calendar, User } from 'lucide-react';

export const PublisherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [approvedDocs, setApprovedDocs] = useState<Document[]>([]);
  const [publishedDocs, setPublishedDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'published'>('pending');

  useEffect(() => {
    setLoading(true);

    const approvedQuery = query(
      collection(db, 'documents'),
      where('status', '==', 'approved')
    );

    const publishedQuery = query(
      collection(db, 'documents'),
      where('status', '==', 'published')
    );

    const unsubscribeApproved = onSnapshot(approvedQuery, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Document[];
      setApprovedDocs(docs);
      setLoading(false);
    });

    const unsubscribePublished = onSnapshot(publishedQuery, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Document[];
      setPublishedDocs(docs);
    });

    return () => {
      unsubscribeApproved();
      unsubscribePublished();
    };
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const currentDocs = activeTab === 'pending' ? approvedDocs : publishedDocs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <HeaderNav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Publisher Dashboard</h1>
          <p className="text-slate-400">Review and publish approved documents</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-8 h-8 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Pending</h3>
            </div>
            <p className="text-4xl font-bold text-white mb-2">{approvedDocs.length}</p>
            <p className="text-slate-400 text-sm">Awaiting publication</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Published</h3>
            </div>
            <p className="text-4xl font-bold text-white mb-2">{publishedDocs.length}</p>
            <p className="text-slate-400 text-sm">Live documents</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-8 h-8 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Total</h3>
            </div>
            <p className="text-4xl font-bold text-white mb-2">{approvedDocs.length + publishedDocs.length}</p>
            <p className="text-slate-400 text-sm">All documents</p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="flex border-b border-slate-700/50">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'pending'
                  ? 'bg-purple-600/10 border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
              }`}
            >
              <Clock className="w-5 h-5" />
              Pending ({approvedDocs.length})
            </button>
            <button
              onClick={() => setActiveTab('published')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'published'
                  ? 'bg-green-600/10 border-green-500 text-green-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              Published ({publishedDocs.length})
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-600 border-t-blue-400 rounded-full"></div>
              </div>
            ) : currentDocs.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {currentDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-slate-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{doc.title}</h3>
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {doc.description || doc.content.substring(0, 100)}...
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          doc.status === 'published'
                            ? 'bg-green-500/10 text-green-300 border border-green-500/30'
                            : 'bg-purple-500/10 text-blue-300 border border-purple-500/30'
                        }`}
                      >
                        {doc.status === 'published' ? 'Published' : 'Approved'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <User className="w-4 h-4" />
                        <span>Author: {doc.contributorName}</span>
                      </div>
                      {doc.reviewerName && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <CheckCircle className="w-4 h-4" />
                          <span>Reviewed by: {doc.reviewerName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {doc.status === 'published' && doc.publishedAt
                            ? `Published: ${formatDate(doc.publishedAt)}`
                            : `Updated: ${formatDate(doc.updatedAt)}`}
                        </span>
                      </div>
                    </div>

                    {doc.reviewComments && (
                      <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <p className="text-xs text-blue-300">
                          <strong>Review:</strong> {doc.reviewComments}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-600/50 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      {doc.status === 'approved' && (
                        <button
                          onClick={() => setSelectedDocId(doc.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          Publish
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">
                  {activeTab === 'pending'
                    ? 'No documents awaiting publication'
                    : 'No published documents yet'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedDocId && (
        <PublishModal
          documentId={selectedDocId}
          onClose={() => setSelectedDocId(null)}
          onSave={() => setSelectedDocId(null)}
        />
      )}

      {previewDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
              <h3 className="text-xl font-bold text-white">Document Preview</h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{previewDoc.title}</h2>
                <span
                  className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${
                    previewDoc.status === 'published'
                      ? 'bg-green-500/10 text-green-300 border border-green-500/30'
                      : 'bg-purple-500/10 text-blue-300 border border-purple-500/30'
                  }`}
                >
                  {previewDoc.status === 'published' ? 'Published' : 'Approved'}
                </span>
              </div>

              {previewDoc.description && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Description</h4>
                  <p className="text-slate-300">{previewDoc.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Author</h4>
                  <p className="text-white">{previewDoc.contributorName}</p>
                </div>
                {previewDoc.reviewerName && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Reviewer</h4>
                    <p className="text-white">{previewDoc.reviewerName}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Created</h4>
                  <p className="text-white">{formatDate(previewDoc.createdAt)}</p>
                </div>
                {previewDoc.publishedAt && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Published</h4>
                    <p className="text-white">{formatDate(previewDoc.publishedAt)}</p>
                  </div>
                )}
              </div>

              {previewDoc.reviewComments && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-300 mb-2">Review Comments</h4>
                  <p className="text-blue-200 text-sm">{previewDoc.reviewComments}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">Document Content</h4>
                <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {previewDoc.content}
                  </p>
                </div>
              </div>

              {previewDoc.fileUrl && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Attached File</h4>
                  <a
                    href={previewDoc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-blue-300 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    {previewDoc.fileName || 'Download File'}
                  </a>
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t border-slate-700">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                {previewDoc.status === 'approved' && (
                  <button
                    onClick={() => {
                      setSelectedDocId(previewDoc.id);
                      setPreviewDoc(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                    Publish Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
