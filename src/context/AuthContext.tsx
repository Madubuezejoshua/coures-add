import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthUserProfile } from '../services/authService';
import { getToken } from '../lib/api';
import type { Role, AccountStatus } from '../lib/roles';

export type UserRole = Role | null;

interface AuthContextType {
  user: AuthUserProfile | null;
  role: UserRole;
  status: AccountStatus | null;
  registrationNumber: string;
  loading: boolean;
  logout: () => Promise<void>;
  displayName: string;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    const profile = await authService.me();
    setUser(profile);
  };

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = async () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        status: user?.status ?? null,
        registrationNumber: user?.registrationNumber ?? '',
        displayName: user?.displayName || user?.fullName || '',
        loading,
        logout,
        refresh,
      }}
    >
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
