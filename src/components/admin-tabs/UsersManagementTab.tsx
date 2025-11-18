import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userManagementService, UserData } from '../../services/userManagementService';
import { Users, Ban, Trash2, RefreshCw, Eye, AlertCircle, Loader } from 'lucide-react';

export const UsersManagementTab: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [actionType, setActionType] = useState<'suspend' | 'delete' | 'reset' | 'unsuspend' | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userManagementService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedUser || !currentUser || !actionType) return;

    try {
      setProcessing(true);
      setError('');

      let result;
      switch (actionType) {
        case 'suspend':
          if (!suspensionReason.trim()) {
            setError('Please provide a suspension reason');
            return;
          }
          result = await userManagementService.suspendUser(selectedUser.uid, suspensionReason, currentUser.uid);
          break;
        case 'unsuspend':
          result = await userManagementService.unsuspendUser(selectedUser.uid, currentUser.uid);
          break;
        case 'delete':
          result = await userManagementService.deleteUser(selectedUser.uid, currentUser.uid);
          break;
        case 'reset':
          result = await userManagementService.resetUser(selectedUser.uid, currentUser.uid);
          break;
      }

      if (result?.success) {
        await loadUsers();
        closeModal();
      } else {
        setError(result?.error || 'Action failed');
      }
    } catch (err) {
      console.error('Error performing action:', err);
      setError('An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setActionType(null);
    setSuspensionReason('');
    setError('');
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate?.() || new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Users Management</h2>
          <p className="text-slate-400">Total: {users.length} users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.uid}
              className={`p-5 rounded-xl border transition-all ${
                user.status === 'suspended'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-slate-700/30 border-slate-600/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{user.displayName}</h3>
                    <span className="px-2 py-1 bg-slate-600 rounded text-slate-300 text-xs">
                      {user.role}
                    </span>
                    {user.status === 'suspended' && (
                      <span className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-xs flex items-center gap-1">
                        <Ban className="w-3 h-3" />
                        Suspended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{user.email}</p>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>Access ID: {user.accessId}</span>
                    <span>Joined: {formatDate(user.createdAt)}</span>
                  </div>
                  {user.status === 'suspended' && user.suspensionReason && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-sm text-red-300">
                        <strong>Reason:</strong> {user.suspensionReason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {user.status === 'suspended' ? (
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setActionType('unsuspend');
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg text-sm transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Unsuspend
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setActionType('suspend');
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 rounded-lg text-sm transition-colors"
                    >
                      <Ban className="w-4 h-4" />
                      Suspend
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setActionType('reset');
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-sm transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setActionType('delete');
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No users found</p>
          </div>
        )}
      </div>

      {selectedUser && actionType && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">
                {actionType === 'suspend' && 'Suspend User'}
                {actionType === 'unsuspend' && 'Unsuspend User'}
                {actionType === 'delete' && 'Delete User'}
                {actionType === 'reset' && 'Reset User'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-white font-semibold mb-1">{selectedUser.displayName}</p>
                <p className="text-slate-400 text-sm">{selectedUser.email}</p>
                <p className="text-slate-500 text-xs mt-1">Role: {selectedUser.role}</p>
              </div>

              {actionType === 'suspend' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Suspension Reason *
                  </label>
                  <textarea
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="Explain why this user is being suspended..."
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {actionType === 'delete' && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-300">
                      <p className="font-semibold mb-1">This action will:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Permanently delete the user account</li>
                        <li>Remove all activity logs</li>
                        <li>Cannot be undone</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {actionType === 'reset' && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-purple-300">
                      <p className="font-semibold mb-1">This action will:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Delete all user data</li>
                        <li>Mark access ID as unused</li>
                        <li>Remove all activity logs</li>
                        <li>Allow access ID to be reused</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {actionType === 'unsuspend' && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-300">
                    This will restore the user's access to the system.
                  </p>
                </div>
              )}

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
                    actionType === 'delete'
                      ? 'bg-red-600 hover:bg-red-700'
                      : actionType === 'suspend'
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {processing && <Loader className="w-4 h-4 animate-spin" />}
                  {processing
                    ? 'Processing...'
                    : actionType === 'suspend'
                      ? 'Suspend'
                      : actionType === 'unsuspend'
                        ? 'Unsuspend'
                        : actionType === 'delete'
                          ? 'Delete'
                          : 'Reset'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
