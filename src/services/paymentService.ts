import { api, poll, ApiError } from '../lib/api';
import type { Document } from './documentService';

export const PUBLICATION_FEE = 20;
export const DEFAULT_DOCUMENT_PRICE = 5;

export type PaymentType = 'publication_fee' | 'purchase';

export interface Payment {
  id?: string;
  type: PaymentType;
  userId: string;
  userName: string;
  documentId: string;
  documentTitle: string;
  amount: number;
  status: string;
  createdAt: string;
}

async function ok(fn: () => Promise<unknown>): Promise<{ success: boolean; error?: string }> {
  try {
    await fn();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof ApiError ? e.message : 'Payment failed' };
  }
}

export const paymentService = {
  PUBLICATION_FEE,

  payPublicationFee(doc: Document, _userId: string, _userName: string) {
    return ok(() => api.post('/payments/pay-fee', { documentId: doc.id }));
  },

  purchaseDocument(doc: Document, _userId: string, _userName: string) {
    return ok(() => api.post('/payments/purchase', { documentId: doc.id }));
  },

  subscribeUserPayments(_userId: string, cb: (items: Payment[]) => void): () => void {
    return poll(() => api.get('/payments/mine'), cb, 20000);
  },

  getAllPayments(): Promise<Payment[]> {
    return api.get('/payments/all');
  },
};
