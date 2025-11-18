import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from '../components/dashboards/AdminDashboard';
import { ContributorDashboard } from '../components/dashboards/ContributorDashboard';
import { ReviewerDashboard } from '../components/dashboards/ReviewerDashboard';
import { PublisherDashboard } from '../components/dashboards/PublisherDashboard';
import { Loader } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = window.location.pathname;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        if (location.includes('/contributor')) {
          navigate('/contributor/login');
        } else if (location.includes('/reviewer')) {
          navigate('/reviewer/login');
        } else if (location.includes('/publisher')) {
          navigate('/publisher/login');
        } else {
          navigate('/admin-login');
        }
      } else if (role && location.includes('/contributor') && role !== 'contributor') {
        navigate('/');
      } else if (role && location.includes('/reviewer') && role !== 'reviewer') {
        navigate('/');
      } else if (role && location.includes('/publisher') && role !== 'publisher') {
        navigate('/');
      }
    }
  }, [user, loading, navigate, location, role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {role === 'admin' && <AdminDashboard />}
      {role === 'contributor' && <ContributorDashboard />}
      {role === 'reviewer' && <ReviewerDashboard />}
      {role === 'publisher' && <PublisherDashboard />}
      {!role && (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-slate-400">Your role has not been assigned. Please contact an administrator.</p>
          </div>
        </div>
      )}
    </>
  );
};
