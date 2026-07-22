import React, { useState, useEffect } from 'react';
import { authService, AccessID } from '../../services/authService';
import { Key, CheckCircle, Clock, Copy, CheckCheck, X, Eye } from 'lucide-react';

export const GeneratedIDsTab: React.FC = () => {
  const [accessIds, setAccessIds] = useState<AccessID[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'used' | 'unused'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'contributor' | 'reviewer' | 'publisher'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<AccessID | null>(null);

  useEffect(() => {
    loadAccessIds();
  }, []);

  const loadAccessIds = async () => {
    try {
      setLoading(true);
      const ids = await authService.getAllAccessIDs();
      setAccessIds(ids);
    } catch (error) {
      console.error('Error loading access IDs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const filteredAndSortedIds = accessIds
    .filter((id) => {
      if (statusFilter === 'used' && !id.used) return false;
      if (statusFilter === 'unused' && id.used) return false;
      if (roleFilter !== 'all' && id.role !== roleFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt ?? 0).getTime();
      const dateB = new Date(b.createdAt ?? 0).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (date: any) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <h2 className="text-2xl font-bold text-white mb-2">All Generated Access IDs</h2>
        <p className="text-slate-400">Total: {accessIds.length} IDs</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            All ({accessIds.length})
          </button>
          <button
            onClick={() => setStatusFilter('unused')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'unused'
                ? 'bg-red-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            Unused ({accessIds.filter((id) => !id.used).length})
          </button>
          <button
            onClick={() => setStatusFilter('used')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'used'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            Used ({accessIds.filter((id) => id.used).length})
          </button>
        </div>

        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Roles</option>
            <option value="contributor">Contributors</option>
            <option value="reviewer">Reviewers</option>
            <option value="publisher">Publishers</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAndSortedIds.length > 0 ? (
          filteredAndSortedIds.map((id) => (
            <div
              key={id.idString}
              onClick={() => setSelectedId(id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${
                id.used
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Key className={`w-5 h-5 ${id.used ? 'text-green-400' : 'text-red-400'}`} />
                  <span className="font-mono text-white font-semibold">{id.idString}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(id.idString);
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-blue-300 rounded text-xs transition-colors"
                >
                  {copiedId === id.idString ? (
                    <>
                      <CheckCheck className="w-3 h-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Role:</span>
                  <span className="px-2 py-1 bg-slate-600 rounded text-slate-300 text-xs capitalize">
                    {id.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      id.used
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {id.used ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Used
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        Unused
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Created:</span>
                  <span className="text-slate-300">{formatDate(id.createdAt)}</span>
                </div>
                {id.used && id.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Used By:</span>
                    <span className="text-slate-300 truncate max-w-[180px]" title={id.email}>
                      {id.email}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-600/50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(id);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <Key className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No access IDs found</p>
          </div>
        )}
      </div>

      {selectedId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Access ID Details</h3>
              <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center gap-3 p-4 bg-slate-700/30 rounded-lg">
                <Key className={`w-8 h-8 ${selectedId.used ? 'text-green-400' : 'text-red-400'}`} />
                <span className="font-mono text-2xl text-white font-bold">{selectedId.idString}</span>
                <button
                  onClick={() => handleCopy(selectedId.idString)}
                  className="flex items-center gap-1 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-blue-300 rounded text-sm transition-colors"
                >
                  {copiedId === selectedId.idString ? (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className={`p-4 rounded-lg border ${
                selectedId.used
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  {selectedId.used ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-300 font-semibold">Used</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-red-400" />
                      <span className="text-red-300 font-semibold">Unused</span>
                    </>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={selectedId.used ? 'text-green-200' : 'text-red-200'}>Role:</span>
                    <span className={`px-2 py-1 rounded text-xs capitalize ${
                      selectedId.used ? 'bg-green-600/30 text-green-200' : 'bg-red-600/30 text-red-200'
                    }`}>
                      {selectedId.role}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={selectedId.used ? 'text-green-200' : 'text-red-200'}>Created:</span>
                    <span className={selectedId.used ? 'text-green-100' : 'text-red-100'}>
                      {formatDateTime(selectedId.createdAt)}
                    </span>
                  </div>
                  {selectedId.used && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-green-200">Used By:</span>
                        <span className="text-green-100">{selectedId.email}</span>
                      </div>
                      {selectedId.email && (
                    <div className="flex justify-between">
                      <span className="text-green-200">Used On:</span>
                      <span className="text-green-100">{formatDateTime(selectedId.createdAt)}</span>
                    </div>
                  )}
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedId(null)}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
