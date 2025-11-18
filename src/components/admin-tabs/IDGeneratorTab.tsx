import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Key, Loader, CheckCircle, Copy } from 'lucide-react';

export const IDGeneratorTab: React.FC = () => {
  const { user, displayName } = useAuth();
  const [role, setRole] = useState<'contributor' | 'reviewer' | 'publisher'>('contributor');
  const [loading, setLoading] = useState(false);
  const [generatedId, setGeneratedId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const newId = await authService.generateAccessID(
        role,
        user.uid,
        displayName || user.email || 'Admin'
      );
      setGeneratedId(newId);
    } catch (error) {
      console.error('Error generating ID:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <Key className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Generate New Access ID</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Select Role</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setRole('contributor')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'contributor'
                    ? 'bg-purple-600/20 border-purple-500 text-blue-300'
                    : 'bg-slate-800/50 border-slate-600/50 text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="font-semibold">Contributor</div>
                <div className="text-xs mt-1">CNT-XXXXXX</div>
              </button>
              <button
                onClick={() => setRole('reviewer')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'reviewer'
                    ? 'bg-purple-600/20 border-purple-500 text-blue-300'
                    : 'bg-slate-800/50 border-slate-600/50 text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="font-semibold">Reviewer</div>
                <div className="text-xs mt-1">RVR-XXXXXX</div>
              </button>
              <button
                onClick={() => setRole('publisher')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'publisher'
                    ? 'bg-purple-600/20 border-purple-500 text-blue-300'
                    : 'bg-slate-800/50 border-slate-600/50 text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="font-semibold">Publisher</div>
                <div className="text-xs mt-1">PUB-XXXXXX</div>
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-all"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Key className="w-5 h-5" />
                Generate Access ID
              </>
            )}
          </button>

          {generatedId && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-semibold">Successfully Generated!</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-800/50 px-4 py-3 rounded-lg">
                  <span className="text-white font-mono text-lg">{generatedId}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-blue-300 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
