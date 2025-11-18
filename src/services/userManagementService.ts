import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { activityLogService } from './activityLogService';
import { documentService } from './documentService';
import { authService } from './authService';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: 'contributor' | 'reviewer' | 'publisher';
  accessId: string;
  status: 'active' | 'suspended';
  createdAt: any;
  suspendedAt?: any;
  suspensionReason?: string;
}

const USERS_COLLECTION = 'users';

export const userManagementService = {
  async getAllUsers(): Promise<UserData[]> {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));
    return snapshot.docs.map((doc) => ({
      uid: doc.id,
      status: 'active',
      ...doc.data(),
    })) as UserData[];
  },

  async getUser(userId: string): Promise<UserData | null> {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        uid: docSnap.id,
        status: 'active',
        ...docSnap.data(),
      } as UserData;
    }
    return null;
  },

  async suspendUser(userId: string, reason: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userDocRef = doc(db, USERS_COLLECTION, userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return { success: false, error: 'User not found' };
      }

      await updateDoc(userDocRef, {
        status: 'suspended',
        suspendedAt: new Date(),
        suspensionReason: reason,
      });

      const userData = userDoc.data();
      await activityLogService.logActivity(
        'USER_SUSPENDED',
        'Admin',
        adminId,
        'admin',
        `Suspended user ${userData.displayName} (${userData.email}). Reason: ${reason}`,
        userData.displayName,
        userId
      );

      return { success: true };
    } catch (error) {
      console.error('Error suspending user:', error);
      return { success: false, error: 'Failed to suspend user' };
    }
  },

  async unsuspendUser(userId: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userDocRef = doc(db, USERS_COLLECTION, userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return { success: false, error: 'User not found' };
      }

      await updateDoc(userDocRef, {
        status: 'active',
        suspendedAt: null,
        suspensionReason: null,
      });

      const userData = userDoc.data();
      await activityLogService.logActivity(
        'USER_UNSUSPENDED',
        'Admin',
        adminId,
        'admin',
        `Unsuspended user ${userData.displayName} (${userData.email})`,
        userData.displayName,
        userId
      );

      return { success: true };
    } catch (error) {
      console.error('Error unsuspending user:', error);
      return { success: false, error: 'Failed to unsuspend user' };
    }
  },

  async deleteUser(userId: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await authService.deleteUserAccount(userId, adminId);
      return result;
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: 'Failed to delete user' };
    }
  },

  async resetUser(userId: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await authService.resetUserAccess(userId, adminId);
      return result;
    } catch (error) {
      console.error('Error resetting user:', error);
      return { success: false, error: 'Failed to reset user' };
    }
  },
};
