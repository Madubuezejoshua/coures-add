import { api } from '../lib/api';

export interface ActivityLog {
  id?: string;
  action: string;
  actor: string;
  actorId: string;
  actorRole: string;
  target?: string;
  targetId?: string;
  details: string;
  timestamp: string;
  documentId?: string;
}

export const activityLogService = {
  getAllLogs(): Promise<ActivityLog[]> {
    return api.get('/logs');
  },
};
