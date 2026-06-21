import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Ban, XCircle, Sparkles, type LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui';
import type { AccountStatus } from '../../lib/roles';

const CONTENT: Record<Exclude<AccountStatus, 'active'>, { icon: LucideIcon; tone: string; title: string; body: string }> = {
  pending: {
    icon: Clock,
    tone: 'bg-amber-50 text-amber-600',
    title: 'Awaiting approval',
    body: 'Your account is awaiting administrator approval. You can sign in and view your status, but role actions are unavailable until an admin approves your account.',
  },
  suspended: {
    icon: Ban,
    tone: 'bg-rose-50 text-rose-600',
    title: 'Account suspended',
    body: 'Your account has been suspended. Please contact support for assistance.',
  },
  rejected: {
    icon: XCircle,
    tone: 'bg-rose-50 text-rose-600',
    title: 'Registration not approved',
    body: 'Your registration was not approved. If you believe this is a mistake, please contact support.',
  },
};

export const AccountStatusScreen: React.FC<{ status: Exclude<AccountStatus, 'active'> }> = ({ status }) => {
  const { displayName, registrationNumber, logout } = useAuth();
  const navigate = useNavigate();
  const c = CONTENT[status];
  const Icon = c.icon;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md rounded-2xl border border-cream-200 bg-white p-8 text-center shadow-card animate-fade-up">
        <div className="mb-5 flex items-center justify-center gap-2 text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-300">
            <Sparkles className="h-5 w-5 text-ink" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">DocReview</span>
        </div>
        <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${c.tone}`}>
          <Icon className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-xl font-bold text-slate-900">{c.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{c.body}</p>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm">
          <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="font-medium text-slate-700">{displayName}</span></div>
          {registrationNumber && (
            <div className="mt-1 flex justify-between"><span className="text-slate-400">Reg. number</span><span className="font-mono font-medium text-slate-700">{registrationNumber}</span></div>
          )}
        </div>

        <Button variant="outline" fullWidth className="mt-6" onClick={handleLogout}>Sign out</Button>
      </div>
    </div>
  );
};
