import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { ReviewModal } from '../modals/ReviewModal';
import { FileText, CheckCircle, Clock, Eye } from 'lucide-react';

export const MyReviewsTab: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed' | 'waiting'>('all');

  useEffect(() => {
    loadDocuments();
  }, [user?.uid]);

  const loadDocuments = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const underReview = await documentService.getDocumentsUnderReview(user.uid);
      const allDocs = await documentService.getAllDocuments();
      const myDocs = allDocs.filter(
        (doc) =>
          doc.reviewerId === user.uid &&
          (doc.status === 'approved' || doc.status === 'rejected' || doc.status === 'needs_correction')
      );
      setDocuments([...underReview, ...myDocs]);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'under_review':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'approved':
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'needs_correction':
        return <Clock className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'under_review':
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
      case 'approved':
      case 'published':
        return 'bg-green-500/10 text-green-300 border-green-500/30';
      case 'needs_correction':
        return 'bg-purple-500/10 text-blue-300 border-purple-500/30';
      case 'rejected':
        return 'bg-red-500/10 text-red-300 border-red-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
    }
  };

  const getCategoryLabel = (status: Document['status']) => {
    if (status === 'under_review') return 'Ongoing';
    if (status === 'needs_correction') return 'Waiting for Contributor';
    if (status === 'approved' || status === 'published' || status === 'rejected') return 'Completed';
    return 'Other';
  };

  const filteredDocuments = documents.filter((doc) => {
    if (filter === 'all') return true;
    if (filter === 'ongoing') return doc.status === 'under_review';
    if (filter === 'waiting') return doc.status === 'needs_correction';
    if (filter === 'completed')
      return doc.status === 'approved' || doc.status === 'published' || doc.status === 'rejected';
    return true;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-600 border-t-blue-400 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">My Reviews</h2>
          <p className="text-slate-400">{documents.length} total reviews</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            All ({documents.length})
          </button>
          <button
            onClick={() => setFilter('ongoing')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'ongoing'
                ? 'bg-yellow-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            Ongoing ({documents.filter((d) => d.status === 'under_review').length})
          </button>
          <button
            onClick={() => setFilter('waiting')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'waiting'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            Waiting ({documents.filter((d) => d.status === 'needs_correction').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            Completed (
            {
              documents.filter(
                (d) => d.status === 'approved' || d.status === 'published' || d.status === 'rejected'
              ).length
            }
            )
          </button>
        </div>
      </div>

      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="p-5 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{doc.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {doc.description || doc.content.substring(0, 100)}...
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg border text-xs font-medium ${getStatusColor(doc.status)}`}
                >
                  {getStatusIcon(doc.status)}
                  {doc.status.replace(/_/g, ' ')}
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="text-slate-200 font-medium">
                    {getCategoryLabel(doc.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Author:</span>
                  <span className="text-slate-200">{doc.contributorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Updated:</span>
                  <span className="text-slate-200">{formatDate(doc.updatedAt)}</span>
                </div>
              </div>

              {doc.status === 'under_review' && (
                <button
                  onClick={() => setSelectedDocId(doc.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 rounded-lg text-sm font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Complete Review
                </button>
              )}

              {(doc.status === 'approved' ||
                doc.status === 'published' ||
                doc.status === 'rejected') && (
                <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                  <p className="text-slate-400 text-sm">Review completed</p>
                </div>
              )}

              {doc.status === 'needs_correction' && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
                  <p className="text-blue-300 text-sm">Waiting for contributor corrections</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <FileText className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
          <p className="text-slate-400">No reviews found</p>
        </div>
      )}

      {selectedDocId && (
        <ReviewModal
          documentId={selectedDocId}
          onClose={() => setSelectedDocId(null)}
          onSave={() => {
            loadDocuments();
            onUpdate();
          }}
        />
      )}
    </div>
  );
};
