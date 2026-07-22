import { api, setToken, ApiError } from '../lib/api';
import type { Role, AccountStatus } from '../lib/roles';

export interface AuthUserProfile {
  uid: string;
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  role: Role;
  registrationNumber?: string;
  status: AccountStatus;
  walletBalance?: number;
}

export interface SignInResult {
  success: boolean;
  role?: Role;
  status?: AccountStatus;
  error?: string;
}

export interface AccessID {
  id: string;
  idString: string;
  role: string;
  used: boolean;
  createdAt?: string | Date;
  email?: string;
}

export const authService = {
  async register(
    role: string,
    fullName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; registrationNumber?: string; role?: Role }> {
    try {
      const res = await api.post('/auth/register', { role, fullName, email, password });
      if (res.token) setToken(res.token);
      return { success: true, registrationNumber: res.registrationNumber, role: res.user?.role };
    } catch (e) {
      return { success: false, error: e instanceof ApiError ? e.message : 'Registration failed' };
    }
  },

  async signIn(email: string, password: string): Promise<SignInResult> {
    try {
      const res = await api.post('/auth/login', { email, password });
      setToken(res.token);
      return { success: true, role: res.user.role, status: res.user.status };
    } catch (e) {
      return { success: false, error: e instanceof ApiError ? e.message : 'Sign in failed' };
    }
  },

  async me(): Promise<AuthUserProfile | null> {
    try {
      const res = await api.get('/auth/me');
      return res.user as AuthUserProfile;
    } catch {
      return null;
    }
  },

  async signUpWithAccessID(
    _accessId: string,
    email: string,
    password: string,
    fullName: string,
    role: string
  ): Promise<{ success: boolean; error?: string; registrationNumber?: string; role?: Role }> {
    return this.register(role, fullName, email, password);
  },

  async generateAccessID(
    role: string,
    _createdBy?: string,
    _createdByName?: string
  ): Promise<string> {
    const prefix = role === 'reviewer' ? 'RVR' : role === 'publisher' ? 'PUB' : 'AUT';
    return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  },

  async getAllAccessIDs(): Promise<AccessID[]> {
    return [];
  },

  logout() {
    setToken(null);
  },
};
