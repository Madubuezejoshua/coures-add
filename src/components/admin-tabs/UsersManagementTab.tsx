import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userManagementService, UserData } from '../../services/userManagementService';
import { Users, Ban, Trash2, CheckCircle2, XCircle, RotateCcw, Shield } from 'lucide-react';
import { Spinner, EmptyState, PageHeader, Notice, Button, Badge, StatusBadge, Modal, FormField, Textarea, Select, FilterPills, Input } from '../ui';
import { ROLE_META, type Role } from '../../lib/roles';

type StatusFilter = 'all' | 'pending' | 'active' | 'suspended' | 'rejected';
type Action = 'approve' | 'reject' | 'suspend' | 'reactivate' | 'role' | 'delete';

const formatDate = (date: any) => {
  if (!date) return 'N/A';
  const d = date.toDate?.() || new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const UsersManagementTab: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');

  const [target, setTarget] = useState<UserData | null>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState('');
  const [newRole, setNewRole] = useState<Role>('editor');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setUsers(await userManagementService.getAllUsers());
    } catch (e) {
      console.error('Error loading users:', e);
    } finally {
      setLoading(false);
    }
  };

  const open = (u: UserData, a: Action) => {
    setTarget(u);
    setAction(a);
    setReason('');
    setNewRole(u.role);
    setError('');
  };
  const close = () => {
    setTarget(null);
    setAction(null);
    setReason('');
    setError('');
  };

  const submit = async () => {
    if (!target || !action || !currentUser) return;
    if ((action === 'reject' || action === 'suspend') && !reason.trim()) {
      setError('Please provide a reason');
      return;
    }
    setProcessing(true);
    setError('');
    const adminId = currentUser.uid;
    let result;
    switch (action) {
      case 'approve': result = await userManagementService.approveUser(target.uid, adminId); break;
      case 'reject': result = await userManagementService.rejectUser(target.uid, reason, adminId); break;
      case 'suspend': result = await userManagementService.suspendUser(target.uid, reason, adminId); break;
      case 'reactivate': result = await userManagementService.reactivateUser(target.uid, adminId); break;
      case 'role': result = await userManagementService.changeRole(target.uid, newRole, adminId); break;
      case 'delete': result = await userManagementService.deleteUser(target.uid, adminId); break;
    }
    setProcessing(false);
    if (result?.success) {
      await loadUsers();
      close();
    } else {
      setError(result?.error || 'Action failed');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (filter !== 'all' && u.status !== filter) return false;
      if (!q) return true;
      return (
        (u.displayName || '').toLowerCase().includes(q) ||
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.registrationNumber || '').toLowerCase().includes(q)
      );
    });
  }, [users, search, filter]);

  const count = (s: StatusFilter) => (s === 'all' ? users.length : users.filter((u) => u.status === s).length);

  if (loading) return <Spinner label="Loading users…" />;

  return (
    <div className="space-y-5">
      <PageHeader title="Users Management" description={`${users.length} registered ${users.length === 1 ? 'account' : 'accounts'}`} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterPills
          options={(['all', 'pending', 'active', 'suspended', 'rejected'] as StatusFilter[]).map((s) => ({ id: s, label: s[0].toUpperCase() + s.slice(1), count: count(s) }))}
          active={filter}
          onChange={setFilter}
        />
        <div className="sm:w-72">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, reg. number…" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="Try a different filter or search term." />
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => (
            <div key={u.uid} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{u.displayName || u.fullName}</h3>
                    <Badge tone="brand">{ROLE_META[u.role]?.label ?? u.role}</Badge>
                    <StatusBadge status={u.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{u.email}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    {u.registrationNumber && <span className="font-mono">{u.registrationNumber}</span>}
                    <span>Joined {formatDate(u.createdAt)}</span>
                  </div>
                  {u.status === 'suspended' && u.suspensionReason && (
                    <Notice tone="danger" className="mt-3"><strong>Suspended:</strong> {u.suspensionReason}</Notice>
                  )}
                  {u.status === 'rejected' && u.rejectionReason && (
                    <Notice tone="danger" className="mt-3"><strong>Rejected:</strong> {u.rejectionReason}</Notice>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {u.status === 'pending' && (
                    <>
                      <Button size="sm" variant="success" onClick={() => open(u, 'approve')}><CheckCircle2 className="h-4 w-4" /> Approve</Button>
                      <Button size="sm" variant="danger" onClick={() => open(u, 'reject')}><XCircle className="h-4 w-4" /> Reject</Button>
                    </>
                  )}
                  {u.status === 'active' && (
                    <Button size="sm" variant="outline" onClick={() => open(u, 'suspend')}><Ban className="h-4 w-4" /> Suspend</Button>
                  )}
                  {(u.status === 'suspended' || u.status === 'rejected') && (
                    <Button size="sm" variant="success" onClick={() => open(u, 'reactivate')}><RotateCcw className="h-4 w-4" /> {u.status === 'rejected' ? 'Approve' : 'Reactivate'}</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => open(u, 'role')}><Shield className="h-4 w-4" /> Role</Button>
                  <Button size="sm" variant="ghost" onClick={() => open(u, 'delete')}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {target && action && (
        <Modal
          onClose={close}
          size="sm"
          title={{
            approve: 'Approve account',
            reject: 'Reject registration',
            suspend: 'Suspend user',
            reactivate: 'Reactivate account',
            role: 'Change role',
            delete: 'Delete user',
          }[action]}
          footer={
            <>
              <Button variant="outline" fullWidth onClick={close} disabled={processing}>Cancel</Button>
              <Button
                fullWidth
                variant={action === 'delete' || action === 'reject' ? 'danger' : action === 'suspend' ? 'secondary' : 'primary'}
                loading={processing}
                onClick={submit}
              >
                Confirm
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-slate-800">{target.displayName || target.fullName}</p>
              <p className="text-slate-500">{target.email}{target.registrationNumber ? ` · ${target.registrationNumber}` : ''}</p>
            </div>

            {action === 'reject' && (
              <FormField label="Reason" required>
                <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this registration being rejected?" />
              </FormField>
            )}
            {action === 'suspend' && (
              <FormField label="Suspension reason" required>
                <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this user being suspended?" />
              </FormField>
            )}
            {action === 'role' && (
              <FormField label="New role">
                <Select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)}>
                  {(['admin', 'author', 'editor', 'reviewer', 'publisher', 'user'] as Role[]).map((r) => (
                    <option key={r} value={r}>{ROLE_META[r]?.label ?? r}</option>
                  ))}
                </Select>
              </FormField>
            )}
            {action === 'approve' && <Notice tone="success">This will activate the account and grant role access.</Notice>}
            {action === 'reactivate' && <Notice tone="success">This will restore the user's access.</Notice>}
            {action === 'delete' && <Notice tone="danger">This permanently removes the user profile and their activity logs. This cannot be undone.</Notice>}

            {error && <Notice tone="danger">{error}</Notice>}
          </div>
        </Modal>
      )}
    </div>
  );
};
