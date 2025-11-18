import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { activityLogService } from './activityLogService';

export interface Payout {
  id?: string;
  userId: string;
  userName: string;
  userRole: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  requestedAt: Timestamp;
  processedAt?: Timestamp;
  processedBy?: string;
  notes?: string;
}

const PAYOUTS_COLLECTION = 'payouts';

export const payoutService = {
  async requestPayout(
    userId: string,
    userName: string,
    userRole: string,
    amount: number
  ): Promise<string> {
    const docRef = await addDoc(collection(db, PAYOUTS_COLLECTION), {
      userId,
      userName,
      userRole,
      amount,
      status: 'pending',
      requestedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async updatePayoutStatus(
    payoutId: string,
    status: Payout['status'],
    processedBy: string,
    processedById: string,
    notes?: string
  ): Promise<void> {
    const docRef = doc(db, PAYOUTS_COLLECTION, payoutId);
    const payoutDoc = await getDoc(docRef);
    const payoutData = payoutDoc.data() as Payout;

    await updateDoc(docRef, {
      status,
      processedAt: Timestamp.now(),
      processedBy,
      notes,
    });

    const actionMap = {
      approved: 'PAYOUT_APPROVED',
      paid: 'PAYOUT_PAID',
      rejected: 'PAYOUT_REJECTED',
      pending: 'PAYOUT_UPDATED',
    };

    await activityLogService.logActivity(
      actionMap[status],
      processedBy,
      processedById,
      'admin',
      `${status.charAt(0).toUpperCase() + status.slice(1)} payout of $${payoutData.amount} for ${payoutData.userName}${notes ? `. Notes: ${notes}` : ''}`,
      payoutData.userName,
      payoutData.userId
    );
  },

  async getAllPayouts(): Promise<Payout[]> {
    const snapshot = await getDocs(collection(db, PAYOUTS_COLLECTION));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Payout[];
  },

  async getUserPayouts(userId: string): Promise<Payout[]> {
    const q = query(collection(db, PAYOUTS_COLLECTION), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Payout[];
  },

  async getPendingPayouts(): Promise<Payout[]> {
    const q = query(collection(db, PAYOUTS_COLLECTION), where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Payout[];
  },
};
