import { api, ApiError } from '../lib/api';
import type { Role, AccountStatus } from '../lib/roles';

export interface UserData {
  uid: string;
  email: string;
  fullName?: string;
  displayName: string;
  role: Role;
  registrationNumber?: string;
  status: AccountStatus;
  createdAt: string;
  suspensionReason?: string;
  rejectionReason?: string;
}

type Result = { success: boolean; error?: string };

async function call(fn: () => Promise<unknown>): Promise<Result> {
  try {
    await fn();
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof ApiError ? e.message : 'Action failed' };
  }
}

export const userManagementService = {
  getAllUsers(): Promise<UserData[]> {
    return api.get('/users');
  },
  getUser(id: string): Promise<UserData | null> {
    return api.get('/users').then((all: UserData[]) => all.find((u) => u.uid === id) ?? null);
  },
  approveUser(id: string, _adminId?: string) {
    return call(() => api.post(`/users/${id}/approve`));
  },
  reactivateUser(id: string, _adminId?: string) {
    return call(() => api.post(`/users/${id}/reactivate`));
  },
  rejectUser(id: string, reason: string, _adminId?: string) {
    return call(() => api.post(`/users/${id}/reject`, { reason }));
  },
  suspendUser(id: string, reason: string, _adminId?: string) {
    return call(() => api.post(`/users/${id}/suspend`, { reason }));
  },
  changeRole(id: string, role: Role, _adminId?: string) {
    return call(() => api.post(`/users/${id}/role`, { role }));
  },
  deleteUser(id: string, _adminId?: string) {
    return call(() => api.del(`/users/${id}`));
  },
};
