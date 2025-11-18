import React, { useState, useEffect } from 'react';
import { activityLogService, ActivityLog } from '../../services/activityLogService';
import { Activity, Filter, Search, X } from 'lucide-react';

export const ActivityLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<'all' | string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, actionFilter, searchTerm]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const logsData = await activityLogService.getAllLogs();
      setLogs(logsData);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...logs];

    if (actionFilter !== 'all') {
      result = result.filter((log) => log.action === actionFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (log) =>
          log.action.toLowerCase().includes(term) ||
          log.actor.toLowerCase().includes(term) ||
          log.details.toLowerCase().includes(term) ||
          (log.target && log.target.toLowerCase().includes(term))
      );
    }

    setFilteredLogs(result);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));

  const getActionColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('REJECT')) return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (action.includes('SUSPEND')) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    if (action.includes('GENERATED') || action.includes('APPROVED') || action.includes('UNSUSPEND')) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (action.includes('USED') || action.includes('ASSIGNED')) return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  };

  const clearFilters = () => {
    setActionFilter('all');
    setSearchTerm('');
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
          <h2 className="text-2xl font-bold text-white mb-2">Activity Logs</h2>
          <p className="text-slate-400">
            Showing {filteredLogs.length} of {logs.length} activities
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search logs by action, actor, target, or details..."
            className="w-full pl-10 pr-10 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {action.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {(actionFilter !== 'all' || searchTerm) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-slate-500/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getActionColor(log.action)}`}
                    >
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-500 text-xs">{formatDate(log.timestamp)}</span>
                  </div>
                  <p className="text-white mb-3">{log.details}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Actor:</span>
                      <span className="text-slate-300 font-medium">{log.actor}</span>
                      <span className="text-slate-600">({log.actorRole})</span>
                    </div>
                    {log.target && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Target:</span>
                        <span className="text-slate-300 font-medium">{log.target}</span>
                      </div>
                    )}
                    {log.documentId && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Doc ID:</span>
                        <span className="text-slate-400 font-mono">{log.documentId.substring(0, 8)}...</span>
                      </div>
                    )}
                  </div>
                </div>
                <Activity className="w-5 h-5 text-slate-600 flex-shrink-0" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              {searchTerm || actionFilter !== 'all' ? 'No logs match your filters' : 'No activity logs found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
