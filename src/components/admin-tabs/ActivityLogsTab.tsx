import React, { useState, useEffect } from 'react';
import { activityLogService, ActivityLog } from '../../services/activityLogService';
import { Activity, Filter, Search, X } from 'lucide-react';
import { Card, CardBody, Button, Badge, Input, Select, Spinner, EmptyState, type Tone } from '../ui';

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

  const getActionTone = (action: string): Tone => {
    if (action.includes('DELETE') || action.includes('REJECT')) return 'rose';
    if (action.includes('SUSPEND')) return 'amber';
    if (action.includes('GENERATED') || action.includes('APPROVED') || action.includes('UNSUSPEND')) return 'emerald';
    if (action.includes('USED') || action.includes('ASSIGNED')) return 'brand';
    return 'slate';
  };

  const clearFilters = () => {
    setActionFilter('all');
    setSearchTerm('');
  };

  if (loading) {
    return <Spinner label="Loading activity logs…" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Activity Logs</h2>
        <p className="mt-1 text-sm text-slate-500">
          Showing {filteredLogs.length} of {logs.length} activities
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search logs by action, actor, target, or details..."
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="all">All Actions</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {action.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
        </div>

        {(actionFilter !== 'all' || searchTerm) && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      <div className="max-h-[600px] space-y-3 overflow-y-auto">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <Card key={log.id} hover>
              <CardBody className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <Badge tone={getActionTone(log.action)}>{log.action.replace(/_/g, ' ')}</Badge>
                      <span className="text-xs text-slate-400">{formatDate(log.timestamp)}</span>
                    </div>
                    <p className="mb-3 text-slate-700">{log.details}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Actor:</span>
                        <span className="font-medium text-slate-700">{log.actor}</span>
                        <span className="text-slate-400">({log.actorRole})</span>
                      </div>
                      {log.target && (
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">Target:</span>
                          <span className="font-medium text-slate-700">{log.target}</span>
                        </div>
                      )}
                      {log.documentId && (
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">Doc ID:</span>
                          <span className="font-mono text-slate-500">{log.documentId.substring(0, 8)}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Activity className="h-5 w-5 flex-shrink-0 text-slate-300" />
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={Activity}
            title={searchTerm || actionFilter !== 'all' ? 'No logs match your filters' : 'No activity logs found'}
          />
        )}
      </div>
    </div>
  );
};
