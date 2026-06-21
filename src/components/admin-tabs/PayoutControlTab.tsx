import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { payoutService, Payout } from '../../services/payoutService';
import { DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  Spinner,
  EmptyState,
  PageHeader,
  Notice,
  Button,
  Badge,
  StatusBadge,
  StatCard,
  FilterPills,
  Modal,
  FormField,
  Textarea,
} from '../ui';

type Filter = 'all' | 'pending' | 'approved' | 'paid' | 'rejected';

export const PayoutControlTab: React.FC = () => {
  const { user, displayName } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
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

  const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payouts.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payouts.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  const filterOptions: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: payouts.length },
    { id: 'pending', label: 'Pending', count: payouts.filter((p) => p.status === 'pending').length },
    { id: 'approved', label: 'Approved', count: payouts.filter((p) => p.status === 'approved').length },
    { id: 'paid', label: 'Paid', count: payouts.filter((p) => p.status === 'paid').length },
    { id: 'rejected', label: 'Rejected', count: payouts.filter((p) => p.status === 'rejected').length },
  ];

  const modalTitle =
    actionType === 'approve' ? 'Approve Payout' : actionType === 'reject' ? 'Reject Payout' : 'Mark as Paid';

  const actionLabel =
    actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Mark as Paid';

  if (loading) {
    return <Spinner label="Loading payouts…" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Payout Control" description="Manage contributor and reviewer payouts" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon={DollarSign} tone="brand" label="Total Requested" value={`$${totalAmount.toFixed(2)}`} />
        <StatCard icon={CheckCircle} tone="emerald" label="Total Paid" value={`$${paidAmount.toFixed(2)}`} />
        <StatCard icon={Clock} tone="amber" label="Pending" value={`$${pendingAmount.toFixed(2)}`} />
      </div>

      <FilterPills options={filterOptions} active={filter} onChange={setFilter} />

      {filteredPayouts.length > 0 ? (
        <div className="space-y-3">
          {filteredPayouts.map((payout) => (
            <div key={payout.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">{payout.userName}</h3>
                    <Badge tone="slate" className="capitalize">{payout.userRole}</Badge>
                    <StatusBadge status={payout.status} />
                  </div>
                  <p className="mb-3 text-2xl font-bold tracking-tight text-emerald-600">
                    ${payout.amount.toFixed(2)}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    <span>Requested: {formatDate(payout.requestedAt)}</span>
                    {payout.processedAt && <span>Processed: {formatDate(payout.processedAt)}</span>}
                    {payout.processedBy && <span>By: {payout.processedBy}</span>}
                  </div>
                  {payout.notes && (
                    <Notice className="mt-3" tone="info">
                      <strong>Notes:</strong> {payout.notes}
                    </Notice>
                  )}
                </div>

                {payout.status === 'pending' && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedPayout(payout);
                        setActionType('approve');
                      }}
                    >
                      <CheckCircle className="h-4 w-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setSelectedPayout(payout);
                        setActionType('reject');
                      }}
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                )}

                {payout.status === 'approved' && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => {
                      setSelectedPayout(payout);
                      setActionType('mark-paid');
                    }}
                  >
                    <CheckCircle className="h-4 w-4" /> Mark as Paid
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={DollarSign} title="No payouts found" />
      )}

      {selectedPayout && actionType && (
        <Modal
          onClose={closeModal}
          title={modalTitle}
          size="sm"
          footer={
            <>
              <Button variant="outline" fullWidth disabled={processing} onClick={closeModal}>
                Cancel
              </Button>
              <Button
                fullWidth
                variant={actionType === 'reject' ? 'danger' : actionType === 'mark-paid' ? 'success' : 'primary'}
                loading={processing}
                disabled={processing}
                onClick={handleAction}
              >
                {processing ? 'Processing…' : actionLabel}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{selectedPayout.userName}</p>
              <p className="text-2xl font-bold tracking-tight text-emerald-600">
                ${selectedPayout.amount.toFixed(2)}
              </p>
            </div>

            <FormField label="Notes (optional)">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this action…"
                rows={3}
              />
            </FormField>

            {error && <Notice tone="danger">{error}</Notice>}
          </div>
        </Modal>
      )}
    </div>
  );
};
