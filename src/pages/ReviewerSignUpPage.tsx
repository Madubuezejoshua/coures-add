import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { UserPlus, AlertCircle, Loader, Key } from 'lucide-react';

export const ReviewerSignUpPage: React.FC = () => {
  const [accessId, setAccessId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!email.trim() || !password.trim() || !displayName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.signUpWithAccessID(
        accessId,
        email,
        password,
        displayName,
        'reviewer'
      );
      if (result.success) {
        navigate('/reviewer/dashboard');
      } else {
        setError(result.error || 'Failed to sign up. Please try again.');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please check the console and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-slate-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-8">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <UserPlus className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">Reviewer Account</h1>
          <p className="text-slate-400 text-center mb-8">Sign up to start reviewing</p>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Access ID *
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={accessId}
                  onChange={(e) => setAccessId(e.target.value.toUpperCase())}
                  placeholder="RVR-XXXXXXXX"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Enter your reviewer access ID (starts with RVR-)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Display Name *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                disabled={loading}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Sign Up
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <p className="text-slate-400 text-sm text-center">
              Already have an account?{' '}
              <Link to="/reviewer/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
            <p className="text-slate-400 text-sm text-center mt-2">
              <Link to="/" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
