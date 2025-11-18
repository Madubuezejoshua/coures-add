import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { FileSearch, Loader, Lock } from 'lucide-react';

export const AllReviewsTab: React.FC<{ onClaim: () => void }> = ({ onClaim }) => {
  const { user, displayName } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentService.getSubmittedDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDocument = async (docId: string) => {
    if (!user) return;

    try {
      setClaiming(docId);
      await documentService.claimDocument(
        docId,
        user.uid,
        displayName || user.email || 'Unknown'
      );
      await loadDocuments();
      onClaim();
    } catch (error) {
      console.error('Error claiming document:', error);
    } finally {
      setClaiming(null);
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
        <h2 className="text-2xl font-bold text-white mb-2">Available for Review</h2>
        <p className="text-slate-400">{documents.length} documents waiting for review</p>
      </div>

      {documents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-5 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all"
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
                  <span className="text-slate-400">Submitted:</span>
                  <span className="text-slate-200">{formatDate(doc.createdAt)}</span>
                </div>
                {doc.fileName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">File:</span>
                    <span className="text-slate-200 truncate max-w-[200px]">{doc.fileName}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleClaimDocument(doc.id!)}
                disabled={claiming === doc.id}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {claiming === doc.id ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Claim for Review
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <FileSearch className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
          <p className="text-slate-400">No documents available for review</p>
        </div>
      )}
    </div>
  );
};
