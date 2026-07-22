import React, { useState } from 'react';
import { DashboardShell } from '../layout/DashboardShell';
import { AllReviewsTab } from '../reviewer-tabs/AllReviewsTab';
import { MyReviewsTab } from '../reviewer-tabs/MyReviewsTab';
import { RewardsTab } from '../reviewer-tabs/RewardsTab';
import { FileSearch, FileText, DollarSign } from 'lucide-react';
import type { TabItem } from '../ui';

type Tab = 'all-reviews' | 'my-reviews' | 'rewards';

const TABS: TabItem<Tab>[] = [
  { id: 'all-reviews', label: 'Available', icon: FileSearch },
  { id: 'my-reviews', label: 'My Reviews', icon: FileText },
  { id: 'rewards', label: 'Rewards', icon: DollarSign },
];

export const ReviewerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('all-reviews');

  return (
    <DashboardShell title="Reviewer Dashboard" subtitle="Review assigned manuscripts and return decisions" tabs={TABS} active={activeTab} onChange={setActiveTab}>
      {activeTab === 'all-reviews' && <AllReviewsTab onClaim={() => setActiveTab('my-reviews')} />}
      {activeTab === 'my-reviews' && <MyReviewsTab />}
      {activeTab === 'rewards' && <RewardsTab />}
    </DashboardShell>
  );
};
