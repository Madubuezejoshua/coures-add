import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { activityLogService } from './activityLogService';

export interface AccessID {
  idString: string;
  role: 'contributor' | 'reviewer' | 'publisher';
  used: boolean;
  userId?: string;
  email?: string;
  createdAt: Timestamp;
  usedAt?: Timestamp;
}

const ACCESS_IDS_COLLECTION = 'generatedIds';

export const authService = {
  async generateAccessID(
    role: 'contributor' | 'reviewer' | 'publisher',
    adminId?: string,
    adminName?: string
  ): Promise<string> {
    const prefix = role === 'contributor' ? 'CNT' : role === 'reviewer' ? 'RVR' : 'PUB';
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const accessId = `${prefix}-${randomPart}`;

    await setDoc(doc(db, ACCESS_IDS_COLLECTION, accessId), {
      idString: accessId,
      role,
      used: false,
      createdAt: Timestamp.now(),
    });

    if (adminId && adminName) {
      await activityLogService.logActivity(
        'ACCESS_ID_GENERATED',
        adminName,
        adminId,
        'admin',
        `Generated new ${role} access ID: ${accessId}`,
        accessId,
        undefined
      );
    }

    return accessId;
  },

  async validateAccessID(accessId: string): Promise<{ valid: boolean; role?: string; error?: string }> {
    try {
      const docRef = doc(db, ACCESS_IDS_COLLECTION, accessId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { valid: false, error: 'Invalid access ID' };
      }

      const data = docSnap.data() as AccessID;
      if (data.used) {
        return { valid: false, error: 'This access ID has already been used' };
      }

      return { valid: true, role: data.role };
    } catch (error) {
      console.error('Error validating access ID:', error);
      return { valid: false, error: 'Failed to validate access ID' };
    }
  },

  async signUpWithAccessID(
    accessId: string,
    email: string,
    password: string,
    displayName: string,
    role?: 'contributor' | 'reviewer' | 'publisher'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const validation = await this.validateAccessID(accessId);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const userRole = role || validation.role;

      if (role && role !== validation.role) {
        return { success: false, error: `Access ID role does not match. Expected ${validation.role}` };
      }

      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (authError: any) {
        let errorMessage = 'Failed to create account';
        if (authError.code === 'auth/email-already-in-use') {
          errorMessage = 'Email already in use';
        } else if (authError.code === 'auth/weak-password') {
          errorMessage = 'Password should be at least 6 characters';
        } else if (authError.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
        }
        console.error('Auth error:', authError);
        return { success: false, error: errorMessage };
      }

      const user = userCredential.user;

      const roleCollection = userRole === 'contributor' ? 'contributors' : userRole === 'reviewer' ? 'reviewers' : 'publishers';

      try {
        await setDoc(doc(db, roleCollection, user.uid), {
          email,
          displayName,
          role: userRole,
          accessId,
          status: 'active',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      } catch (firestoreError: any) {
        console.error('Firestore error creating user document:', firestoreError);
        await deleteUser(user);
        return { success: false, error: 'Failed to create user profile. Please try again.' };
      }

      try {
        await updateDoc(doc(db, ACCESS_IDS_COLLECTION, accessId), {
          used: true,
          userId: user.uid,
          email,
          usedAt: Timestamp.now(),
        });
      } catch (accessIdError: any) {
        console.error('Error updating access ID:', accessIdError);
      }

      try {
        await activityLogService.logActivity(
          'ACCESS_ID_USED',
          displayName,
          user.uid,
          userRole || 'user',
          `Used access ID ${accessId} to create account`,
          accessId,
          undefined
        );
      } catch (logError: any) {
        console.error('Error logging activity:', logError);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Unexpected error signing up:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  },

  async getAllAccessIDs(): Promise<AccessID[]> {
    const snapshot = await getDocs(collection(db, ACCESS_IDS_COLLECTION));
    return snapshot.docs.map((doc) => doc.data() as AccessID);
  },

  async getUnusedAccessIDs(): Promise<AccessID[]> {
    const q = query(collection(db, ACCESS_IDS_COLLECTION), where('used', '==', false));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as AccessID);
  },

  subscribeToAccessIDs(callback: (ids: AccessID[]) => void): () => void {
    const q = query(collection(db, ACCESS_IDS_COLLECTION));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ids = snapshot.docs.map((doc) => doc.data() as AccessID);
      callback(ids);
    });
    return unsubscribe;
  },

  async resetUserAccess(userId: string, adminId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return { success: false, error: 'User not found' };
      }

      const userData = userDoc.data();
      const accessId = userData.accessId;
      const displayName = userData.displayName;

      if (accessId) {
        await updateDoc(doc(db, ACCESS_IDS_COLLECTION, accessId), {
          used: false,
          userId: null,
          email: null,
          usedAt: null,
        });
      }

      await activityLogService.logActivity(
        'USER_RESET',
        'Admin',
        adminId || 'system',
        'admin',
        `Reset user ${displayName} and freed access ID ${accessId}`,
        displayName,
        userId
      );

      await activityLogService.deleteUserLogs(userId);
      await deleteDoc(userDocRef);

      return { success: true };
    } catch (error) {
      console.error('Error resetting user access:', error);
      return { success: false, error: 'Failed to reset user access' };
    }
  },

  async deleteUserAccount(userId: string, adminId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return { success: false, error: 'User not found' };
      }

      const userData = userDoc.data();
      const displayName = userData.displayName;
      const accessId = userData.accessId;

      if (accessId) {
        await updateDoc(doc(db, ACCESS_IDS_COLLECTION, accessId), {
          used: false,
          userId: null,
          email: null,
          usedAt: null,
        });
      }

      await activityLogService.logActivity(
        'USER_DELETED',
        'Admin',
        adminId || 'system',
        'admin',
        `Deleted user ${displayName} and freed access ID ${accessId}`,
        displayName,
        userId
      );

      await activityLogService.deleteUserLogs(userId);
      await deleteDoc(userDocRef);

      return { success: true };
    } catch (error) {
      console.error('Error deleting user account:', error);
      return { success: false, error: 'Failed to delete user account' };
    }
  },
};
