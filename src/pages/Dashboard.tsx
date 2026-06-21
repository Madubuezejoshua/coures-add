import React, { useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AccountStatusScreen } from '../components/layout/AccountStatusScreen';
import { getToken } from '../lib/api';
import { Loader } from 'lucide-react';

const AdminDashboard = lazy(() => import('../components/dashboards/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const EditorDashboard = lazy(() => import('../components/dashboards/EditorDashboard').then((m) => ({ default: m.EditorDashboard })));
const ReviewerDashboard = lazy(() => import('../components/dashboards/ReviewerDashboard').then((m) => ({ default: m.ReviewerDashboard })));
const PublisherDashboard = lazy(() => import('../components/dashboards/PublisherDashboard').then((m) => ({ default: m.PublisherDashboard })));
const UserDashboard = lazy(() => import('../components/dashboards/UserDashboard').then((m) => ({ default: m.UserDashboard })));

const DashLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-cream">
    <Loader className="h-8 w-8 animate-spin text-brand-500" />
  </div>
);

export const Dashboard: React.FC = () => {
  const { user, role, status, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user && !getToken()) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Loader className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!user) return null;

  // No approval system: only banned (suspended/rejected) accounts are gated.
  if (role !== 'admin' && (status === 'suspended' || status === 'rejected')) {
    return <AccountStatusScreen status={status} />;
  }

  const dashboards: Record<string, React.ReactNode> = {
    admin: <AdminDashboard />,
    editor: <EditorDashboard />,
    reviewer: <ReviewerDashboard />,
    publisher: <PublisherDashboard />,
    user: <UserDashboard />,
  };

  if (!role || !dashboards[role]) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <h1 className="mb-2 text-2xl font-bold text-slate-900">No role assigned</h1>
          <p className="text-slate-500">Your account has no role yet. Please contact an administrator.</p>
        </div>
      </div>
    );
  }

  return <Suspense fallback={<DashLoader />}>{dashboards[role]}</Suspense>;
};
