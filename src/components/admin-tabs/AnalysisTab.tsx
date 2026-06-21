import React, { useState, useEffect } from 'react';
import { documentService, Document } from '../../services/documentService';
import { userManagementService, UserData } from '../../services/userManagementService';
import { poll } from '../../lib/api';
import { Card, CardBody, StatCard, Spinner } from '../ui';
import { Users, UserCheck, Clock, Ban, FileText } from 'lucide-react';

export const AnalysisTab: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return poll(
      async () => {
        const [u, d] = await Promise.all([userManagementService.getAllUsers(), documentService.getAllDocuments()]);
        return { u, d };
      },
      ({ u, d }) => {
        setUsers(u);
        setDocuments(d);
        setLoading(false);
      },
      20000
    );
  }, []);

  const byStatus = (s: string) => users.filter((u) => u.status === s).length;
  const byRole = (r: string) => users.filter((u) => u.role === r).length;
  const docsByStatus = (s: string) => documents.filter((d) => d.status === s).length;

  if (loading) return <Spinner label="Loading analytics…" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} tone="brand" label="Total Users" value={users.length} />
        <StatCard icon={UserCheck} tone="emerald" label="Active" value={byStatus('active')} />
        <StatCard icon={Clock} tone="amber" label="Pending" value={byStatus('pending')} />
        <StatCard icon={Ban} tone="rose" label="Suspended / Rejected" value={byStatus('suspended') + byStatus('rejected')} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardBody>
            <h3 className="mb-4 text-base font-semibold text-slate-900">Users by Role</h3>
            <div className="space-y-2">
              {[['Editors', 'editor'], ['Reviewers', 'reviewer'], ['Publishers', 'publisher'], ['Readers', 'user']].map(([label, role]) => (
                <div key={role} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold text-slate-900">{byRole(role)}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="mb-4 text-base font-semibold text-slate-900">Users by Status</h3>
            <div className="space-y-2">
              {[['Active', 'active'], ['Pending', 'pending'], ['Suspended', 'suspended'], ['Rejected', 'rejected']].map(([label, s]) => (
                <div key={s} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold text-slate-900">{byStatus(s)}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <FileText className="h-4 w-4 text-brand-500" /> Documents ({documents.length})
            </h3>
            <div className="space-y-2">
              {[['Submitted', 'submitted'], ['Under Review', 'under_review'], ['Approved', 'approved'], ['Published', 'published'], ['Needs Correction', 'needs_correction']].map(([label, s]) => (
                <div key={s} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold text-slate-900">{docsByStatus(s)}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
