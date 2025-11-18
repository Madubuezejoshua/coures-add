import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Document {
  id?: string;
  title: string;
  content: string;
  description?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'published' | 'rejected' | 'needs_correction';
  contributorId: string;
  contributorName: string;
  reviewerId?: string;
  reviewerName?: string;
  publisherId?: string;
  publisherName?: string;
  reviewComments?: string;
  rejectionReason?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  highlights?: Array<{ start: number; end: number; color: string; note?: string }>;
  correctionNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}

const DOCUMENTS_COLLECTION = 'documents';

export const documentService = {
  async createDocument(
    title: string,
    content: string,
    description: string,
    contributorId: string,
    contributorName: string,
    fileUrl?: string,
    fileName?: string,
    fileType?: string
  ): Promise<string> {
    const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), {
      title,
      content,
      description,
      status: 'draft',
      contributorId,
      contributorName,
      fileUrl,
      fileName,
      fileType,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async updateDocument(documentId: string, updates: Partial<Document>): Promise<void> {
    const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async submitDocument(documentId: string): Promise<void> {
    await this.updateDocument(documentId, {
      status: 'submitted',
    });
  },

  async updateDocumentStatus(
    documentId: string,
    status: Document['status'],
    metadata?: {
      reviewerId?: string;
      reviewerName?: string;
      reviewComments?: string;
      rejectionReason?: string;
      publisherId?: string;
      publisherName?: string;
      publishedAt?: Timestamp;
    }
  ): Promise<void> {
    await this.updateDocument(documentId, {
      status,
      ...metadata,
    });
  },

  async deleteDocument(documentId: string): Promise<void> {
    const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    await deleteDoc(docRef);
  },

  async getDocument(documentId: string): Promise<Document | null> {
    const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Document;
    }
    return null;
  },

  async getDocuments(...constraints: QueryConstraint[]): Promise<Document[]> {
    const q = query(collection(db, DOCUMENTS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Document[];
  },

  async getContributorDocuments(contributorId: string): Promise<Document[]> {
    return this.getDocuments(where('contributorId', '==', contributorId));
  },

  async getSubmittedDocuments(): Promise<Document[]> {
    return this.getDocuments(where('status', '==', 'submitted'));
  },

  async getDocumentsUnderReview(reviewerId: string): Promise<Document[]> {
    return this.getDocuments(
      where('status', '==', 'under_review'),
      where('reviewerId', '==', reviewerId)
    );
  },

  async getRejectedDocuments(contributorId: string): Promise<Document[]> {
    return this.getDocuments(
      where('contributorId', '==', contributorId),
      where('status', 'in', ['rejected', 'needs_correction'])
    );
  },

  async claimDocument(documentId: string, reviewerId: string, reviewerName: string): Promise<void> {
    await this.updateDocument(documentId, {
      status: 'under_review',
      reviewerId,
      reviewerName,
    });
  },

  async getDocumentsForPublishing(): Promise<Document[]> {
    return this.getDocuments(where('status', '==', 'approved'));
  },

  async getPublishedDocuments(): Promise<Document[]> {
    return this.getDocuments(where('status', '==', 'published'));
  },

  async getAllDocuments(): Promise<Document[]> {
    return this.getDocuments();
  },
};
