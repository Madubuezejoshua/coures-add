import { api, poll } from '../lib/api';

export interface Message {
  id?: string;
  fromId: string;
  fromName: string;
  fromRole: string;
  toId: string;
  toName: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export const messageService = {
  async send(msg: Partial<Message> & { toId: string; toName: string; body: string }): Promise<void> {
    // Sender identity is derived from the auth token server-side.
    await api.post('/messages', { toId: msg.toId, toName: msg.toName, body: msg.body });
  },
  subscribeInbox(_uid: string, _isAdmin: boolean, cb: (items: Message[]) => void): () => void {
    return poll(() => api.get('/messages/inbox'), cb, 15000);
  },
  subscribeSent(_uid: string, cb: (items: Message[]) => void): () => void {
    return poll(() => api.get('/messages/sent'), cb, 15000);
  },
  async markRead(id: string): Promise<void> {
    try {
      await api.post(`/messages/${id}/read`);
    } catch {
      /* ignore */
    }
  },
};
