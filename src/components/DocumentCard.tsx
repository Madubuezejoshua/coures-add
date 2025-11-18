import React from 'react';
import { Document } from '../services/documentService';
import { FileText, CheckCircle, AlertCircle, Clock, Edit2 } from 'lucide-react';

interface DocumentCardProps {
  document: Document;
  onUpdate: () => void;
  isOwner?: boolean;
  onReview?: () => void;
  onPublish?: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onUpdate,
  isOwner,
  onReview,
  onPublish,
}) => {
  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'under_review':
      case 'submitted':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/10 text-green-300 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/10 text-red-300 border-red-500/30';
      case 'under_review':
      case 'submitted':
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
      case 'approved':
        return 'bg-purple-500/10 text-blue-300 border-purple-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{document.title}</h3>
          <p className="text-sm text-slate-400 line-clamp-2">{document.description || document.content.substring(0, 100)}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-medium ${getStatusColor(document.status)}`}>
          {getStatusIcon(document.status)}
          {document.status.replace(/_/g, ' ')}
        </div>
      </div>

      <div className="space-y-2 text-sm mb-6">
        <div className="flex justify-between">
          <span className="text-slate-400">Author:</span>
          <span className="text-slate-200">{document.contributorName}</span>
        </div>
        {document.reviewerName && (
          <div className="flex justify-between">
            <span className="text-slate-400">Reviewer:</span>
            <span className="text-slate-200">{document.reviewerName}</span>
          </div>
        )}
        {document.publisherName && (
          <div className="flex justify-between">
            <span className="text-slate-400">Publisher:</span>
            <span className="text-slate-200">{document.publisherName}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-400">Created:</span>
          <span className="text-slate-200">{formatDate(document.createdAt)}</span>
        </div>
      </div>

      {document.reviewComments && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-200"><strong>Review:</strong> {document.reviewComments}</p>
        </div>
      )}

      {document.rejectionReason && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-200"><strong>Rejection:</strong> {document.rejectionReason}</p>
        </div>
      )}

      <div className="flex gap-2">
        {isOwner && document.status === 'draft' && (
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        )}
        {onReview && (
          <button
            onClick={onReview}
            className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Review
          </button>
        )}
        {onPublish && (
          <button
            onClick={onPublish}
            className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Publish
          </button>
        )}
      </div>
    </div>
  );
};
