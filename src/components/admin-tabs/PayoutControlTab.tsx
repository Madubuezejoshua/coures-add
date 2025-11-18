import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { payoutService, Payout } from '../../services/payoutService';
import { DollarSign, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';

export const PayoutControlTab: React.FC = () => {
  const { user, displayName } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'paid' | 'rejected'>('all');
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'mark-paid' | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const payoutsData = await payoutService.getAllPayouts();
      setPayouts(payoutsData);
    } catch (error) {
      console.error('Error loading payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedPayout || !actionType || !user) return;

    try {
      setProcessing(true);
      setError('');

      let status: Payout['status'];
      if (actionType === 'approve') status = 'approved';
      else if (actionType === 'mark-paid') status = 'paid';
      else status = 'rejected';

      await payoutService.updatePayoutStatus(
        selectedPayout.id!,
        status,
        displayName || user.email || 'Admin',
        user.uid,
        notes || undefined
      );

      await loadPayouts();
      closeModal();
    } catch (err) {
      console.error('Error processing payout:', err);
      setError('Failed to process payout');
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setSelectedPayout(null);
    setActionType(null);
    setNotes('');
    setError('');
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredPayouts = filter === 'all' ? payouts : payouts.filter((p) => p.status === filter);

  const getStatusColor = (status: Payout['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-300 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/10 text-red-300 border-red-500/30';
      case 'approved':
        return 'bg-purple-500/10 text-blue-300 border-purple-500/30';
      default:
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status: Payout['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payouts.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payouts.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

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
        <h2 className="text-2xl font-bold text-white mb-2">Payout Control</h2>
        <p className="text-slate-400">Manage contributor and reviewer payouts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5">
          <DollarSign className="w-8 h-8 text-purple-400 mb-3" />
          <p className="text-2xl font-bold text-white">${totalAmount.toFixed(2)}</p>
          <p className="text-sm text-slate-400">Total Requested</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
          <CheckCircle className="w-8 h-8 text-green-400 mb-3" />
          <p className="text-2xl font-bold text-white">${paidAmount.toFixed(2)}</p>
          <p className="text-sm text-slate-400">Total Paid</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5">
          <Clock className="w-8 h-8 text-yellow-400 mb-3" />
          <p className="text-2xl font-bold text-white">${pendingAmount.toFixed(2)}</p>
          <p className="text-sm text-slate-400">Pending</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
          }`}
        >
          All ({payouts.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
          }`}
        >
          Pending ({payouts.filter((p) => p.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'approved'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
          }`}
        >
          Approved ({payouts.filter((p) => p.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'paid'
              ? 'bg-green-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
          }`}
        >
          Paid ({payouts.filter((p) => p.status === 'paid').length})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'rejected'
              ? 'bg-red-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
          }`}
        >
          Rejected ({payouts.filter((p) => p.status === 'rejected').length})
        </button>
      </div>

      <div className="space-y-3">
        {filteredPayouts.length > 0 ? (
          filteredPayouts.map((payout) => (
            <div
              key={payout.id}
              className="p-5 bg-slate-700/30 border border-slate-600/50 rounded-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{payout.userName}</h3>
                    <span className="px-2 py-1 bg-slate-600 rounded text-slate-300 text-xs">
                      {payout.userRole}
                    </span>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${getStatusColor(payout.status)}`}>
                      {getStatusIcon(payout.status)}
                      {payout.status}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-400 mb-3">${payout.amount.toFixed(2)}</p>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span>Requested: {formatDate(payout.requestedAt)}</span>
                    {payout.processedAt && <span>Processed: {formatDate(payout.processedAt)}</span>}
                    {payout.processedBy && <span>By: {payout.processedBy}</span>}
                  </div>
                  {payout.notes && (
                    <div className="mt-3 p-3 bg-slate-600/30 rounded-lg">
                      <p className="text-sm text-slate-300">
                        <strong>Notes:</strong> {payout.notes}
                      </p>
                    </div>
                  )}
                </div>

                {payout.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedPayout(payout);
                        setActionType('approve');
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-blue-300 rounded-lg text-sm transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPayout(payout);
                        setActionType('reject');
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-sm transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}

                {payout.status === 'approved' && (
                  <button
                    onClick={() => {
                      setSelectedPayout(payout);
                      setActionType('mark-paid');
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg text-sm transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No payouts found</p>
          </div>
        )}
      </div>

      {selectedPayout && actionType && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">
                {actionType === 'approve' && 'Approve Payout'}
                {actionType === 'reject' && 'Reject Payout'}
                {actionType === 'mark-paid' && 'Mark as Paid'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-white font-semibold mb-1">{selectedPayout.userName}</p>
                <p className="text-2xl font-bold text-green-400">${selectedPayout.amount.toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this action..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={processing}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${
                    actionType === 'reject'
                      ? 'bg-red-600 hover:bg-red-700'
                      : actionType === 'mark-paid'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {processing && <Loader className="w-4 h-4 animate-spin" />}
                  {processing
                    ? 'Processing...'
                    : actionType === 'approve'
                      ? 'Approve'
                      : actionType === 'reject'
                        ? 'Reject'
                        : 'Mark as Paid'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
