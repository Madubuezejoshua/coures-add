import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { LogIn, AlertCircle, Info } from 'lucide-react';
import { AuthScreen } from '../components/layout/AuthLayout';
import { Button, FormField, Input, Notice } from '../components/ui';
import { dashboardFor } from '../lib/roles';
import { useAuth } from '../context/AuthContext';

const SOCIALS = [
  { id: 'google', label: 'Google', mark: <span className="text-base font-bold text-[#4285F4]">G</span> },
  { id: 'apple', label: 'Apple', mark: <span className="text-base"></span> },
  { id: 'microsoft', label: 'Microsoft', mark: (
    <span className="grid h-4 w-4 grid-cols-2 gap-px">
      <span className="bg-[#F25022]" /><span className="bg-[#7FBA00]" /><span className="bg-[#00A4EF]" /><span className="bg-[#FFB900]" />
    </span>
  ) },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    const result = await authService.signIn(email, password);
    if (result.success && result.role) {
      await refresh();
      navigate(dashboardFor(result.role));
    } else {
      setError(result.error || 'Failed to sign in');
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      icon={<LogIn className="h-7 w-7" />}
      title="Login to your account!"
      subtitle="Enter your registered email address and password to login. Admins use this same page too."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700">Create one</Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <FormField label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="eg. you@gmail.com" disabled={loading} required />
        </FormField>
        <FormField label="Password">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" disabled={loading} required />
        </FormField>

        <Notice tone="info" className="text-xs">
          Admin accounts also sign in from this same page.
        </Notice>

        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-600">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            Remember me
          </label>
          <button type="button" onClick={() => setInfo('Password reset isn’t enabled yet — please contact an administrator.')} className="font-medium text-brand-600 hover:text-brand-700">
            Forgot Password?
          </button>
        </div>

        {error && <Notice tone="danger" className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" /> {error}</Notice>}
        {info && <Notice tone="info" className="flex items-center gap-2"><Info className="h-4 w-4 shrink-0" /> {info}</Notice>}

        <Button type="submit" fullWidth size="lg" loading={loading}>
          {!loading && <LogIn className="h-5 w-5" />} Login
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> Or login with <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {SOCIALS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setInfo(`${s.label} sign-in isn’t enabled on this server yet.`)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            aria-label={`Continue with ${s.label}`}
          >
            {s.mark}
          </button>
        ))}
      </div>
    </AuthScreen>
  );
};
