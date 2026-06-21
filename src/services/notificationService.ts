import { api, poll } from '../lib/api';

export interface AppNotification {
  id?: string;
  userId?: string;
  forRole?: 'admin';
  type: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  /** Polls the API on an interval (replaces the old realtime listener). */
  subscribe(_uid: string, _isAdmin: boolean, cb: (items: AppNotification[]) => void): () => void {
    return poll(() => api.get('/notifications'), cb, 20000);
  },
  async markRead(id: string): Promise<void> {
    try {
      await api.post(`/notifications/${id}/read`);
    } catch {
      /* ignore */
    }
  },
  async markAllRead(ids: string[]): Promise<void> {
    if (!ids.length) return;
    try {
      await api.post('/notifications/read-all', { ids });
    } catch {
      /* ignore */
    }
  },
  listFor(): Promise<AppNotification[]> {
    return api.get('/notifications');
  },
};
