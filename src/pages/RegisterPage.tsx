import React, { useState } from 'react';
import { useNavigate, useParams, Link, Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { UserPlus, AlertCircle } from 'lucide-react';
import { AuthScreen } from '../components/layout/AuthLayout';
import { Button, FormField, Input, Notice } from '../components/ui';
import { isPublicRole, ROLE_META, dashboardFor } from '../lib/roles';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!role || !isPublicRole(role)) {
    return <Navigate to="/signup" replace />;
  }
  const meta = ROLE_META[role];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim() || !email.trim() || !password) return setError('Please fill in all fields');
    if (password.length < 6) return setError('Password should be at least 6 characters');
    if (password !== confirm) return setError('Passwords do not match');

    setLoading(true);
    const result = await authService.register(role, fullName, email, password);
    if (result.success && result.role) {
      // Free instant sign-up — logged in automatically, straight to the dashboard.
      await refresh();
      navigate(dashboardFor(result.role));
    } else {
      setError(result.error || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      icon={<UserPlus className="h-7 w-7" />}
      title={`Sign up as ${meta.label}`}
      subtitle={meta.description}
      footer={
        <>
          Wrong role?{' '}
          <Link to="/signup" className="font-semibold text-brand-700 hover:text-brand-800">Choose again</Link>
          {' · '}
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-slate-600 hover:text-slate-800">Sign in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full Name" required>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" disabled={loading} required />
        </FormField>
        <FormField label="Email" required>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={loading} required />
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Password" required>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={loading} required />
          </FormField>
          <FormField label="Confirm" required>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" disabled={loading} required />
          </FormField>
        </div>
        {error && (
          <Notice tone="danger" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </Notice>
        )}
        <Button type="submit" fullWidth size="lg" loading={loading}>
          {!loading && <UserPlus className="h-5 w-5" />} Create Account &amp; Continue
        </Button>
      </form>
    </AuthScreen>
  );
};
