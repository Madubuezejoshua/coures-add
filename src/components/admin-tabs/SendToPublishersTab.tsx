import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { userManagementService, UserData } from '../../services/userManagementService';
import { activityLogService } from '../../services/activityLogService';
import { Send, CheckCircle, Loader } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export const SendToPublishersTab: React.FC = () => {
  const { user, displayName } = useAuth();
  const [approvedDocs, setApprovedDocs] = useState<Document[]>([]);
  const [publishers, setPublishers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [selectedPublisher, setSelectedPublisher] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docs, users] = await Promise.all([
        documentService.getDocumentsForPublishing(),
        userManagementService.getAllUsers(),
      ]);
      setApprovedDocs(docs);
      setPublishers(users.filter((u) => u.role === 'publisher' && u.status === 'active'));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!selectedDoc || !selectedPublisher || !user) return;

    try {
      setSending(true);
      setError('');

      const publisher = publishers.find((p) => p.uid === selectedPublisher);
      if (!publisher) {
        setError('Publisher not found');
        return;
      }

      await activityLogService.logActivity(
        'DOCUMENT_ASSIGNED_TO_PUBLISHER',
        displayName || 'Admin',
        user.uid,
        'admin',
        `Assigned document "${selectedDoc.title}" to publisher ${publisher.displayName}`,
        publisher.displayName,
        publisher.uid,
        selectedDoc.id
      );

      await loadData();
      setSelectedDoc(null);
      setSelectedPublisher('');
    } catch (err) {
      console.error('Error assigning document:', err);
      setError('Failed to assign document to publisher');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
        <h2 className="text-2xl font-bold text-white mb-2">Send to Publishers</h2>
        <p className="text-slate-400">{approvedDocs.length} approved documents ready for publishing</p>
      </div>

      {publishers.length === 0 && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-300 text-sm">No active publishers available</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {approvedDocs.length > 0 ? (
          approvedDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-slate-500/50 transition-colors"
            >
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-white mb-1">{doc.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-2">
                  {doc.description || doc.content.substring(0, 100)}...
                </p>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Author:</span>
                  <span className="text-slate-200">{doc.contributorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reviewer:</span>
                  <span className="text-slate-200">{doc.reviewerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Approved:</span>
                  <span className="text-slate-200">{formatDate(doc.updatedAt)}</span>
                </div>
              </div>

              {doc.reviewComments && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-200">
                    <strong>Review:</strong> {doc.reviewComments}
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedDoc(doc);
                  setError('');
                }}
                disabled={publishers.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-lg text-sm transition-colors"
              >
                <Send className="w-4 h-4" />
                Assign to Publisher
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4 opacity-50" />
            <p className="text-slate-400">No approved documents waiting for publishing</p>
          </div>
        )}
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Assign to Publisher</h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-white font-semibold mb-1">{selectedDoc.title}</p>
                <p className="text-slate-400 text-sm">By {selectedDoc.contributorName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Publisher *
                </label>
                <select
                  value={selectedPublisher}
                  onChange={(e) => setSelectedPublisher(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Choose a publisher...</option>
                  {publishers.map((publisher) => (
                    <option key={publisher.uid} value={publisher.uid}>
                      {publisher.displayName} ({publisher.email})
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedDoc(null);
                    setSelectedPublisher('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={!selectedPublisher || sending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  {sending && <Loader className="w-4 h-4 animate-spin" />}
                  {sending ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
