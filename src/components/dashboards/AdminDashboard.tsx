import React, { useState, lazy, Suspense } from 'react';
import { BarChart3, Users, Activity, FileSearch, Send, DollarSign } from 'lucide-react';
import { DashboardShell } from '../layout/DashboardShell';
import { Spinner, type TabItem } from '../ui';

const AnalysisTab = lazy(() => import('../admin-tabs/AnalysisTab').then((m) => ({ default: m.AnalysisTab })));
const UsersManagementTab = lazy(() => import('../admin-tabs/UsersManagementTab').then((m) => ({ default: m.UsersManagementTab })));
const ActivityLogsTab = lazy(() => import('../admin-tabs/ActivityLogsTab').then((m) => ({ default: m.ActivityLogsTab })));
const DocumentExaminationTab = lazy(() => import('../admin-tabs/DocumentExaminationTab').then((m) => ({ default: m.DocumentExaminationTab })));
const SendToPublishersTab = lazy(() => import('../admin-tabs/SendToPublishersTab').then((m) => ({ default: m.SendToPublishersTab })));
const PayoutControlTab = lazy(() => import('../admin-tabs/PayoutControlTab').then((m) => ({ default: m.PayoutControlTab })));

type Tab = 'analysis' | 'users' | 'activity-logs' | 'documents' | 'publishers' | 'payouts';

const TABS: TabItem<Tab>[] = [
  { id: 'analysis', label: 'Analysis', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'activity-logs', label: 'Activity Logs', icon: Activity },
  { id: 'documents', label: 'Documents', icon: FileSearch },
  { id: 'publishers', label: 'Send to Publishers', icon: Send },
  { id: 'payouts', label: 'Payouts', icon: DollarSign },
];

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('analysis');

  return (
    <DashboardShell title="Admin Dashboard" subtitle="System management and analytics" tabs={TABS} active={activeTab} onChange={setActiveTab}>
      <Suspense fallback={<Spinner label="Loading…" />}>
        {activeTab === 'analysis' && <AnalysisTab />}
        {activeTab === 'users' && <UsersManagementTab />}
        {activeTab === 'activity-logs' && <ActivityLogsTab />}
        {activeTab === 'documents' && <DocumentExaminationTab />}
        {activeTab === 'publishers' && <SendToPublishersTab />}
        {activeTab === 'payouts' && <PayoutControlTab />}
      </Suspense>
    </DashboardShell>
  );
};
