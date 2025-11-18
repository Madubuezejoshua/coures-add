import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { payoutService, Payout } from '../../services/payoutService';
import { DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

export const RewardsTab: React.FC = () => {
  const { user, displayName, role } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadPayouts();
  }, [user?.uid]);

  const loadPayouts = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const userPayouts = await payoutService.getUserPayouts(user.uid);
      setPayouts(userPayouts);
    } catch (error) {
      console.error('Error loading payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount.trim()) {
      setError('Please enter an amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setRequesting(true);
      setError('');

      await payoutService.requestPayout(
        user.uid,
        displayName || user.email || 'Unknown',
        role || 'reviewer',
        amountNum
      );

      setSuccess(true);
      setAmount('');
      setTimeout(() => setSuccess(false), 3000);
      await loadPayouts();
    } catch (err) {
      console.error('Error requesting payout:', err);
      setError('Failed to request payout');
    } finally {
      setRequesting(false);
    }
  };

  const totalEarned = payouts
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payouts
    .filter((p) => p.status === 'pending' || p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusIcon = (status: Payout['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-purple-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: Payout['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-300 border-green-500/30';
      case 'approved':
        return 'bg-purple-500/10 text-blue-300 border-purple-500/30';
      case 'rejected':
        return 'bg-red-500/10 text-red-300 border-red-500/30';
      default:
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-600 border-t-blue-400 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Rewards & Payouts</h2>
        <p className="text-slate-400">Track your earnings and request withdrawals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-8 h-8 text-green-400" />
            <h3 className="text-lg font-semibold text-green-300">Total Earned</h3>
          </div>
          <p className="text-4xl font-bold text-white">${totalEarned.toFixed(2)}</p>
          <p className="text-green-400 text-sm mt-2">Successfully withdrawn</p>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-8 h-8 text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-300">Pending</h3>
          </div>
          <p className="text-4xl font-bold text-white">${pendingAmount.toFixed(2)}</p>
          <p className="text-yellow-400 text-sm mt-2">Awaiting approval</p>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Request Withdrawal</h3>
        <form onSubmit={handleRequestPayout} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={requesting}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300 text-sm">
              Withdrawal request submitted successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={requesting || !amount.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            {requesting && <Loader className="w-5 h-5 animate-spin" />}
            {requesting ? 'Requesting...' : 'Request Withdrawal'}
          </button>
        </form>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Payout History</h3>
        {payouts.length > 0 ? (
          <div className="space-y-3">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-white">
                        ${payout.amount.toFixed(2)}
                      </span>
                      <span
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(payout.status)}`}
                      >
                        {getStatusIcon(payout.status)}
                        {payout.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400">
                      Requested: {formatDate(payout.requestedAt)}
                    </div>
                    {payout.processedAt && (
                      <div className="text-sm text-slate-400">
                        Processed: {formatDate(payout.processedAt)}
                      </div>
                    )}
                    {payout.processedBy && (
                      <div className="text-sm text-slate-400">By: {payout.processedBy}</div>
                    )}
                    {payout.notes && (
                      <div className="mt-2 p-2 bg-slate-600/30 rounded text-sm text-slate-300">
                        <strong>Note:</strong> {payout.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No payout history yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
