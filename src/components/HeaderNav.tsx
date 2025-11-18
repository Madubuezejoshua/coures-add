import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LogOut } from 'lucide-react';

export const HeaderNav: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getRoleLabel = () => {
    const labels: Record<string, string> = {
      admin: 'Administrator',
      contributor: 'Contributor',
      reviewer: 'Reviewer',
      publisher: 'Publisher',
    };
    return labels[role as string] || 'User';
  };

  return (
    <header className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <FileText className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-xl font-bold text-white">DocReview</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-slate-400">Logged in as</p>
            <p className="text-white font-medium">{getRoleLabel()}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
