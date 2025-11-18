import React, { useState } from 'react';
import { HeaderNav } from '../HeaderNav';
import {
  BarChart3,
  Key,
  List,
  Users,
  Activity,
  FileSearch,
  Send,
  DollarSign,
} from 'lucide-react';
import { AnalysisTab } from '../admin-tabs/AnalysisTab';
import { IDGeneratorTab } from '../admin-tabs/IDGeneratorTab';
import { GeneratedIDsTab } from '../admin-tabs/GeneratedIDsTab';
import { UsersManagementTab } from '../admin-tabs/UsersManagementTab';
import { ActivityLogsTab } from '../admin-tabs/ActivityLogsTab';
import { DocumentExaminationTab } from '../admin-tabs/DocumentExaminationTab';
import { SendToPublishersTab } from '../admin-tabs/SendToPublishersTab';
import { PayoutControlTab } from '../admin-tabs/PayoutControlTab';

type Tab =
  | 'analysis'
  | 'id-generator'
  | 'generated-ids'
  | 'users'
  | 'activity-logs'
  | 'documents'
  | 'publishers'
  | 'payouts';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('analysis');

  const tabs = [
    { id: 'analysis' as Tab, label: 'Analysis', icon: BarChart3 },
    { id: 'id-generator' as Tab, label: 'ID Generator', icon: Key },
    { id: 'generated-ids' as Tab, label: 'All Generated IDs', icon: List },
    { id: 'users' as Tab, label: 'Users Management', icon: Users },
    { id: 'activity-logs' as Tab, label: 'Activity Logs', icon: Activity },
    { id: 'documents' as Tab, label: 'Document Examination', icon: FileSearch },
    { id: 'publishers' as Tab, label: 'Send to Publishers', icon: Send },
    { id: 'payouts' as Tab, label: 'Payout Control', icon: DollarSign },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analysis':
        return <AnalysisTab />;
      case 'id-generator':
        return <IDGeneratorTab />;
      case 'generated-ids':
        return <GeneratedIDsTab />;
      case 'users':
        return <UsersManagementTab />;
      case 'activity-logs':
        return <ActivityLogsTab />;
      case 'documents':
        return <DocumentExaminationTab />;
      case 'publishers':
        return <SendToPublishersTab />;
      case 'payouts':
        return <PayoutControlTab />;
      default:
        return <AnalysisTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <HeaderNav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Comprehensive system management and analytics</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="flex overflow-x-auto">
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

          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};
