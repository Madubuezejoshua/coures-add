import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ActivityLog {
  id?: string;
  action: string;
  actor: string;
  actorId: string;
  actorRole: string;
  target?: string;
  targetId?: string;
  details: string;
  timestamp: Timestamp;
  documentId?: string;
}

const ACTIVITY_LOGS_COLLECTION = 'activityLogs';

export const activityLogService = {
  async logActivity(
    action: string,
    actor: string,
    actorId: string,
    actorRole: string,
    details: string,
    target?: string,
    targetId?: string,
    documentId?: string
  ): Promise<void> {
    await addDoc(collection(db, ACTIVITY_LOGS_COLLECTION), {
      action,
      actor,
      actorId,
      actorRole,
      target,
      targetId,
      details,
      timestamp: Timestamp.now(),
      documentId,
    });
  },

  async getAllLogs(): Promise<ActivityLog[]> {
    const q = query(collection(db, ACTIVITY_LOGS_COLLECTION), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ActivityLog[];
  },

  async getUserLogs(userId: string): Promise<ActivityLog[]> {
    const q = query(
      collection(db, ACTIVITY_LOGS_COLLECTION),
      where('actorId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ActivityLog[];
  },

  async searchLogs(searchTerm: string): Promise<ActivityLog[]> {
    const allLogs = await this.getAllLogs();
    const term = searchTerm.toLowerCase();
    return allLogs.filter(
      (log) =>
        log.action.toLowerCase().includes(term) ||
        log.actor.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term) ||
        (log.target && log.target.toLowerCase().includes(term))
    );
  },

  async deleteUserLogs(userId: string): Promise<void> {
    const q = query(collection(db, ACTIVITY_LOGS_COLLECTION), where('actorId', '==', userId));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map((document) => deleteDoc(doc(db, ACTIVITY_LOGS_COLLECTION, document.id)));
    await Promise.all(deletePromises);
  },
};
