import { api } from '../lib/api';

export interface Payout {
  id?: string;
  userId: string;
  userName: string;
  userRole: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

export const payoutService = {
  requestPayout(_userId: string, _userName: string, _userRole: string, amount: number): Promise<Payout> {
    return api.post('/payouts', { amount });
  },
  getUserPayouts(_userId: string): Promise<Payout[]> {
    return api.get('/payouts/mine');
  },
  getAllPayouts(): Promise<Payout[]> {
    return api.get('/payouts/all');
  },
  getPendingPayouts(): Promise<Payout[]> {
    return api.get('/payouts/all').then((all: Payout[]) => all.filter((p) => p.status === 'pending'));
  },
  updatePayoutStatus(
    payoutId: string,
    status: Payout['status'],
    _processedBy: string,
    _processedById: string,
    notes?: string
  ): Promise<void> {
    return api.post(`/payouts/${payoutId}/status`, { status, notes });
  },
};
