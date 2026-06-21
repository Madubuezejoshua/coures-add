import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { payoutService, Payout } from '../../services/payoutService';
import { DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardBody, FormField, Input, Button, Notice, StatusBadge, StatCard, Spinner, EmptyState } from '../ui';

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

  if (loading) {
    return <Spinner label="Loading payouts…" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">Rewards &amp; Payouts</h2>
        <p className="text-sm text-slate-500">Track your earnings and request withdrawals</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard
          icon={DollarSign}
          tone="emerald"
          label="Total Earned"
          value={`$${totalEarned.toFixed(2)}`}
          hint="Successfully withdrawn"
        />
        <StatCard
          icon={TrendingUp}
          tone="amber"
          label="Pending"
          value={`$${pendingAmount.toFixed(2)}`}
          hint="Awaiting approval"
        />
      </div>

      <Card>
        <CardBody>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Request Withdrawal</h3>
          <form onSubmit={handleRequestPayout} className="space-y-4">
            <FormField label="Amount ($)">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={requesting}
              />
            </FormField>

            {error && <Notice tone="danger">{error}</Notice>}

            {success && <Notice tone="success">Withdrawal request submitted successfully!</Notice>}

            <Button
              type="submit"
              fullWidth
              loading={requesting}
              disabled={requesting || !amount.trim()}
            >
              {requesting ? 'Requesting...' : 'Request Withdrawal'}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Payout History</h3>
          {payouts.length > 0 ? (
            <div className="space-y-3">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-2xl font-bold text-slate-900">
                          ${payout.amount.toFixed(2)}
                        </span>
                        <StatusBadge status={payout.status} />
                      </div>
                      <div className="text-sm text-slate-500">
                        Requested: {formatDate(payout.requestedAt)}
                      </div>
                      {payout.processedAt && (
                        <div className="text-sm text-slate-500">
                          Processed: {formatDate(payout.processedAt)}
                        </div>
                      )}
                      {payout.processedBy && (
                        <div className="text-sm text-slate-500">By: {payout.processedBy}</div>
                      )}
                      {payout.notes && (
                        <Notice className="mt-2" tone="info">
                          <strong>Note:</strong> {payout.notes}
                        </Notice>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={DollarSign}
              title="No payout history yet"
              description="Your withdrawal requests will be listed here."
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
};
