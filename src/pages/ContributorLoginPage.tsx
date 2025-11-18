import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { LogIn, AlertCircle, Loader } from 'lucide-react';

export const ContributorLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const contributorDocRef = doc(db, 'contributors', user.uid);
      const contributorDoc = await getDoc(contributorDocRef);

      if (!contributorDoc.exists()) {
        await auth.signOut();
        setError('This account does not have contributor privileges');
        setLoading(false);
        return;
      }

      const userData = contributorDoc.data();
      if (userData?.status === 'suspended') {
        await auth.signOut();
        setError('Your account has been suspended. Reason: ' + (userData?.suspensionReason || 'No reason provided'));
        setLoading(false);
        return;
      }

      navigate('/contributor/dashboard');
    } catch (err: any) {
      let errorMessage = 'Failed to login';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Account not found';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid password';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-slate-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-8">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <LogIn className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">Contributor Login</h1>
          <p className="text-slate-400 text-center mb-8">Sign in to your contributor account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <p className="text-slate-400 text-sm text-center">
              Don't have an account?{' '}
              <Link to="/contributor/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign up
              </Link>
            </p>
            <p className="text-slate-400 text-sm text-center mt-2">
              <Link to="/" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
