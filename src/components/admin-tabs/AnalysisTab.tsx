import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { documentService, Document } from '../../services/documentService';
import { userManagementService, UserData } from '../../services/userManagementService';
import { authService, AccessID } from '../../services/authService';
import { Users, FileText, Key, CheckCircle, Clock } from 'lucide-react';

export const AnalysisTab: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [generatedIds, setGeneratedIds] = useState<AccessID[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        uid: doc.id,
        status: 'active',
        ...doc.data(),
      })) as UserData[];
      setUsers(usersData);
    });

    const unsubscribeDocs = onSnapshot(collection(db, 'documents'), (snapshot) => {
      const docsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Document[];
      setDocuments(docsData);
    });

    const unsubscribeIds = onSnapshot(collection(db, 'generatedIds'), (snapshot) => {
      const idsData = snapshot.docs.map((doc) => doc.data()) as AccessID[];
      setGeneratedIds(idsData);
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeDocs();
      unsubscribeIds();
    };
  }, []);

  const getDocumentsByStatus = (status: Document['status']) =>
    documents.filter((doc) => doc.status === status).length;

  const getUsersByRole = (role: string) => users.filter((user) => user.role === role).length;
  const getUsedIds = () => generatedIds.filter((id) => id.used).length;
  const getUnusedIds = () => generatedIds.filter((id) => !id.used).length;

  const stats = [
    {
      label: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      label: 'Total Generated IDs',
      value: generatedIds.length,
      icon: Key,
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/20',
    },
    {
      label: 'Used IDs',
      value: getUsedIds(),
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      label: 'Unused IDs',
      value: getUnusedIds(),
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-600 border-t-blue-400 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${stat.bgColor} border ${stat.borderColor} rounded-xl p-6`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Users by Role</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Contributors</span>
              <span className="text-white font-semibold">{getUsersByRole('contributor')}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Reviewers</span>
              <span className="text-white font-semibold">{getUsersByRole('reviewer')}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Publishers</span>
              <span className="text-white font-semibold">{getUsersByRole('publisher')}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">IDs by Role</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Contributors (CNT-)</span>
              <span className="text-white font-semibold">
                {generatedIds.filter((id) => id.role === 'contributor').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Reviewers (RVR-)</span>
              <span className="text-white font-semibold">
                {generatedIds.filter((id) => id.role === 'reviewer').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Publishers (PUB-)</span>
              <span className="text-white font-semibold">
                {generatedIds.filter((id) => id.role === 'publisher').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">ID Usage</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <span className="text-green-300">Used</span>
              <span className="text-white font-semibold">{getUsedIds()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <span className="text-yellow-300">Unused</span>
              <span className="text-white font-semibold">{getUnusedIds()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Total</span>
              <span className="text-white font-semibold">{generatedIds.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
