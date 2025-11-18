import React, { useState } from 'react';
import { HeaderNav } from '../HeaderNav';
import { AllReviewsTab } from '../reviewer-tabs/AllReviewsTab';
import { MyReviewsTab } from '../reviewer-tabs/MyReviewsTab';
import { RewardsTab } from '../reviewer-tabs/RewardsTab';
import { FileSearch, FileText, DollarSign } from 'lucide-react';

type Tab = 'all-reviews' | 'my-reviews' | 'rewards';

export const ReviewerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('all-reviews');

  const tabs = [
    { id: 'all-reviews' as Tab, label: 'All Reviews', icon: FileSearch },
    { id: 'my-reviews' as Tab, label: 'My Reviews', icon: FileText },
    { id: 'rewards' as Tab, label: 'Rewards', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <HeaderNav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Reviewer Dashboard</h1>
          <p className="text-slate-400">Review documents and track your rewards</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="flex border-b border-slate-700/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'bg-purple-600/10 border-purple-500 text-purple-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'all-reviews' && (
              <AllReviewsTab onClaim={() => setActiveTab('my-reviews')} />
            )}
            {activeTab === 'my-reviews' && <MyReviewsTab onUpdate={() => {}} />}
            {activeTab === 'rewards' && <RewardsTab />}
          </div>
        </div>
      </div>
    </div>
  );
};
