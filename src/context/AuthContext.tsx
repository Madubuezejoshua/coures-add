import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export type UserRole = 'admin' | 'contributor' | 'reviewer' | 'publisher' | null;

interface AuthUser extends User {
  role?: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  loading: boolean;
  logout: () => Promise<void>;
  displayName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          let userRole: UserRole = null;

          const adminDocRef = doc(db, 'admin', firebaseUser.uid);
          const adminDoc = await getDoc(adminDocRef);

          if (adminDoc.exists()) {
            userRole = 'admin';
            setDisplayName('Administrator');
          } else {
            const contributorDocRef = doc(db, 'contributors', firebaseUser.uid);
            const contributorDoc = await getDoc(contributorDocRef);

            if (contributorDoc.exists()) {
              const userData = contributorDoc.data();

              if (userData.status === 'suspended') {
                await signOut(auth);
                setUser(null);
                setRole(null);
                setDisplayName('');
                setLoading(false);
                alert('Your account has been suspended. Reason: ' + (userData.suspensionReason || 'No reason provided'));
                return;
              }

              userRole = 'contributor';
              setDisplayName(userData.displayName || firebaseUser.email || 'User');
            } else {
              const reviewerDocRef = doc(db, 'reviewers', firebaseUser.uid);
              const reviewerDoc = await getDoc(reviewerDocRef);

              if (reviewerDoc.exists()) {
                const userData = reviewerDoc.data();

                if (userData.status === 'suspended') {
                  await signOut(auth);
                  setUser(null);
                  setRole(null);
                  setDisplayName('');
                  setLoading(false);
                  alert('Your account has been suspended. Reason: ' + (userData.suspensionReason || 'No reason provided'));
                  return;
                }

                userRole = 'reviewer';
                setDisplayName(userData.displayName || firebaseUser.email || 'User');
              } else {
                const publisherDocRef = doc(db, 'publishers', firebaseUser.uid);
                const publisherDoc = await getDoc(publisherDocRef);

                if (publisherDoc.exists()) {
                  const userData = publisherDoc.data();

                  if (userData.status === 'suspended') {
                    await signOut(auth);
                    setUser(null);
                    setRole(null);
                    setDisplayName('');
                    setLoading(false);
                    alert('Your account has been suspended. Reason: ' + (userData.suspensionReason || 'No reason provided'));
                    return;
                  }

                  userRole = 'publisher';
                  setDisplayName(userData.displayName || firebaseUser.email || 'User');
                }
              }
            }
          }

          const authUser: AuthUser = {
            ...firebaseUser,
            role: userRole,
          };
          setUser(authUser);
          setRole(userRole);
        } else {
          setUser(null);
          setRole(null);
          setDisplayName('');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUser(null);
        setRole(null);
        setDisplayName('');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
      setDisplayName('');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout, displayName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
