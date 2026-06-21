import React from 'react';
import { Document } from '../services/documentService';
import { Calendar, FileText, Paperclip, CreditCard } from 'lucide-react';
import { StatusBadge, Notice, Button } from './ui';
import { fileDownloadUrl } from '../lib/api';

interface DocumentCardProps {
  document: Document;
  isOwner?: boolean;
  onReview?: () => void;
  onPublish?: () => void;
  onPay?: () => void;
  payLabel?: string;
}

const formatDate = (timestamp: any) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate?.() || new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onReview, onPublish, onPay, payLabel }) => (
  <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="truncate text-base font-semibold text-slate-900">{document.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
          {document.description || document.content.substring(0, 100)}
        </p>
      </div>
      <StatusBadge status={document.status} />
    </div>

    <div className="space-y-1.5 text-sm text-slate-500">
      <div className="flex justify-between"><span className="text-slate-400">Author</span><span className="font-medium text-slate-700">{document.contributorName}</span></div>
      {document.reviewerName && (
        <div className="flex justify-between"><span className="text-slate-400">Reviewer</span><span className="font-medium text-slate-700">{document.reviewerName}</span></div>
      )}
      {document.publisherName && (
        <div className="flex justify-between"><span className="text-slate-400">Publisher</span><span className="font-medium text-slate-700">{document.publisherName}</span></div>
      )}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-slate-400"><Calendar className="h-3.5 w-3.5" /> Created</span>
        <span className="font-medium text-slate-700">{formatDate(document.createdAt)}</span>
      </div>
      {document.fileName && (
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400"><Paperclip className="h-3.5 w-3.5" /> File</span>
          {document.fileUrl ? (
            <a href={fileDownloadUrl(document.fileUrl)} target="_blank" rel="noopener noreferrer" className="max-w-[60%] truncate font-medium text-brand-600 hover:underline">
              {document.fileName}
            </a>
          ) : (
            <span className="max-w-[60%] truncate font-medium text-slate-700">{document.fileName}</span>
          )}
        </div>
      )}
    </div>

    {document.reviewComments && (
      <Notice className="mt-4" tone="info"><strong>Review:</strong> {document.reviewComments}</Notice>
    )}
    {document.rejectionReason && (
      <Notice className="mt-3" tone="danger"><strong>Rejection:</strong> {document.rejectionReason}</Notice>
    )}
    {document.correctionNotes && (
      <Notice className="mt-3" tone="warning"><strong>Correction notes:</strong> {document.correctionNotes}</Notice>
    )}

    {(onReview || onPublish || onPay) && (
      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
        {onReview && <Button size="sm" fullWidth onClick={onReview}><FileText className="h-4 w-4" /> Review</Button>}
        {onPublish && <Button size="sm" variant="success" fullWidth onClick={onPublish}>Publish</Button>}
        {onPay && <Button size="sm" fullWidth onClick={onPay}><CreditCard className="h-4 w-4" /> {payLabel || 'Pay fee'}</Button>}
      </div>
    )}
  </div>
);
