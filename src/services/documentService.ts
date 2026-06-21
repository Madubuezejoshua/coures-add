import { api } from '../lib/api';

export interface Document {
  id?: string;
  title: string;
  content: string;
  description?: string;
  status:
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'ready_for_publishing'
    | 'published'
    | 'rejected'
    | 'needs_correction';
  contributorId: string;
  contributorName: string;
  reviewerId?: string;
  reviewerName?: string;
  publisherId?: string;
  publisherName?: string;
  reviewComments?: string;
  rejectionReason?: string;
  correctionNotes?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  price?: number;
  feePaid?: boolean;
  feePaidAt?: string;
  highlights?: Array<{ start: number; end: number; color: string; note?: string }>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export const documentService = {
  createDocument(
    title: string,
    content: string,
    description: string,
    _contributorId: string,
    _contributorName: string,
    fileUrl?: string,
    fileName?: string,
    fileType?: string
  ): Promise<Document> {
    // contributor is derived from the auth token server-side.
    return api.post('/documents', { title, content, description, fileUrl, fileName, fileType });
  },

  getDocument(id: string): Promise<Document | null> {
    return api.get(`/documents/${id}`).catch(() => null);
  },

  getContributorDocuments(_uid: string): Promise<Document[]> {
    return api.get('/documents/mine');
  },
  getRejectedDocuments(_uid: string): Promise<Document[]> {
    return api.get('/documents/corrections');
  },
  getSubmittedDocuments(): Promise<Document[]> {
    return api.get('/documents/review-queue');
  },
  getReviewerDocuments(_uid: string): Promise<Document[]> {
    return api.get('/documents/my-reviews');
  },
  getDocumentsForPublishing(): Promise<Document[]> {
    return api.get('/documents/for-publishing');
  },
  getDocumentsReadyForPublishing(): Promise<Document[]> {
    return api.get('/documents/ready');
  },
  getPublishedDocuments(): Promise<Document[]> {
    return api.get('/documents/published');
  },
  getAllDocuments(): Promise<Document[]> {
    return api.get('/documents/all');
  },

  updateDocument(
    id: string,
    updates: { title?: string; description?: string; content?: string }
  ): Promise<Document> {
    return api.put(`/documents/${id}`, updates);
  },

  claimDocument(documentId: string, _reviewerId?: string, _reviewerName?: string): Promise<void> {
    return api.post(`/documents/${documentId}/claim`);
  },

  resubmitDocument(documentId: string, content: string): Promise<void> {
    return api.post(`/documents/${documentId}/resubmit`, { content });
  },

  assignPublisher(documentId: string, publisherId: string, publisherName: string): Promise<void> {
    return api.post(`/documents/${documentId}/assign-publisher`, { publisherId, publisherName });
  },

  updateDocumentStatus(
    documentId: string,
    status: Document['status'],
    meta: {
      reviewComments?: string;
      rejectionReason?: string;
      correctionNotes?: string;
      [k: string]: unknown;
    } = {}
  ): Promise<void> {
    if (status === 'published') {
      return api.post(`/documents/${documentId}/publish`);
    }
    const decision = status === 'approved' ? 'approve' : status === 'rejected' ? 'reject' : 'corrections';
    const comments = meta.reviewComments || meta.rejectionReason || meta.correctionNotes || '';
    return api.post(`/documents/${documentId}/decide`, { decision, comments });
  },
};
