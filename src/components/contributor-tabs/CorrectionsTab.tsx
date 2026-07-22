import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { AlertCircle, Send, Loader, Eye, X } from 'lucide-react';

export const CorrectionsTab: React.FC<{ onCorrection: () => void }> = ({ onCorrection }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [correctedContent, setCorrectedContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [user?.uid]);

  const loadDocuments = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const docs = await documentService.getRejectedDocuments(user.uid);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCorrection = async () => {
    if (!selectedDoc || !correctedContent.trim()) {
      setError('Please provide corrected content');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await documentService.resubmitDocument(selectedDoc.id!, correctedContent);

      await loadDocuments();
      setSelectedDoc(null);
      setCorrectedContent('');
      onCorrection();
    } catch (err) {
      console.error('Error submitting correction:', err);
      setError('Failed to submit correction');
    } finally {
      setSubmitting(false);
    }
  };

  const renderHighlightedContent = (doc: Document) => {
    if (!doc.highlights || doc.highlights.length === 0) {
      return <p className="text-slate-200 whitespace-pre-wrap">{doc.content}</p>;
    }

    const content = doc.content;
    const sortedHighlights = [...doc.highlights].sort((a, b) => a.start - b.start);
    const segments: JSX.Element[] = [];
    let lastIndex = 0;

    sortedHighlights.forEach((highlight) => {
      if (highlight.start > lastIndex) {
        segments.push(
          <span key={`text-${lastIndex}`}>
            {content.substring(lastIndex, highlight.start)}
          </span>
        );
      }

      const colorClass = {
        red: 'bg-red-500/30 border-b-2 border-red-500',
        blue: 'bg-purple-500/30 border-b-2 border-purple-500',
        yellow: 'bg-yellow-500/30 border-b-2 border-yellow-500',
      }[highlight.color] || 'bg-slate-500/30 border-b-2 border-slate-500';

      segments.push(
        <span key={highlight.start} className={`${colorClass} px-1 rounded relative group`}>
          {content.substring(highlight.start, highlight.end)}
          {highlight.note && (
            <span className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded p-2 whitespace-nowrap z-10 border border-slate-700">
              {highlight.note}
            </span>
          )}
        </span>
      );

      lastIndex = highlight.end;
    });

    if (lastIndex < content.length) {
      segments.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>);
    }

    return <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">{segments}</div>;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-600 border-t-green-400 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Corrections Needed</h2>
        <p className="text-slate-400">Review feedback and submit corrections</p>
      </div>

      {documents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-5 bg-slate-800/50 border border-slate-700/50 rounded-xl"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{doc.title}</h3>
                  <p className="text-sm text-slate-400">
                    Reviewer: {doc.reviewerName} • {formatDate(doc.updatedAt)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    doc.status === 'needs_correction'
                      ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30'
                      : 'bg-red-500/10 text-red-300 border border-red-500/30'
                  }`}
                >
                  {doc.status === 'needs_correction' ? 'Needs Correction' : 'Rejected'}
                </span>
              </div>

              {doc.correctionNotes && (
                <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    <strong>Correction Notes:</strong> {doc.correctionNotes}
                  </p>
                </div>
              )}

              {doc.rejectionReason && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-200 text-sm">
                    <strong>Reason:</strong> {doc.rejectionReason}
                  </p>
                </div>
              )}

              {doc.reviewComments && (
                <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    <strong>Review Comments:</strong> {doc.reviewComments}
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedDoc(doc);
                  setCorrectedContent(doc.content);
                  setError('');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg text-sm transition-colors"
              >
                <Eye className="w-4 h-4" />
                View & Correct
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <AlertCircle className="w-12 h-12 text-green-400 mx-auto mb-4 opacity-50" />
          <p className="text-slate-400">No corrections needed</p>
        </div>
      )}

      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
              <h3 className="text-xl font-bold text-white">Make Corrections</h3>
              <button
                onClick={() => {
                  setSelectedDoc(null);
                  setCorrectedContent('');
                  setError('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">{selectedDoc.title}</h4>
                <p className="text-slate-400 text-sm">
                  Reviewer: {selectedDoc.reviewerName}
                </p>
              </div>

              {selectedDoc.correctionNotes && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    <strong>Correction Notes:</strong> {selectedDoc.correctionNotes}
                  </p>
                </div>
              )}

              {selectedDoc.reviewComments && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    <strong>Review Comments:</strong> {selectedDoc.reviewComments}
                  </p>
                </div>
              )}

              <div>
                <h5 className="text-sm font-medium text-slate-300 mb-2">
                  Original Content (with highlights)
                </h5>
                <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {renderHighlightedContent(selectedDoc)}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-slate-300 mb-2">
                  Corrected Content *
                </h5>
                <textarea
                  value={correctedContent}
                  onChange={(e) => setCorrectedContent(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                  placeholder="Enter your corrected content"
                />
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => {
                    setSelectedDoc(null);
                    setCorrectedContent('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitCorrection}
                  disabled={submitting || !correctedContent.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  {submitting && <Loader className="w-5 h-5 animate-spin" />}
                  {submitting ? 'Submitting...' : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Corrections
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
