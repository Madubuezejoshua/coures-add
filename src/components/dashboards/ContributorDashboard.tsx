import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService, Document } from '../../services/documentService';
import { HeaderNav } from '../HeaderNav';
import { DocumentCard } from '../DocumentCard';
import { UploadTab } from '../contributor-tabs/UploadTab';
import { CorrectionsTab } from '../contributor-tabs/CorrectionsTab';
import { Upload, AlertCircle, FileText } from 'lucide-react';

type Tab = 'upload' | 'corrections' | 'my-documents';

export const ContributorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('upload');

  useEffect(() => {
    loadDocuments();
  }, [user?.uid]);

  const loadDocuments = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const docs = await documentService.getContributorDocuments(user.uid);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'upload' as Tab, label: 'Upload', icon: Upload },
    { id: 'corrections' as Tab, label: 'Corrections', icon: AlertCircle },
    { id: 'my-documents' as Tab, label: 'My Documents', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <HeaderNav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Author Dashboard</h1>
          <p className="text-slate-400">Create manuscripts, submit them for review, and track feedback.</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="flex border-b border-slate-700/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'bg-green-600/10 border-green-500 text-green-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'upload' && <UploadTab onUploadComplete={loadDocuments} />}
            {activeTab === 'corrections' && <CorrectionsTab onCorrection={loadDocuments} />}
            {activeTab === 'my-documents' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">My Documents</h2>
                  <p className="text-slate-400">{documents.length} documents</p>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-600 border-t-green-400 rounded-full"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {documents.length > 0 ? (
                      documents.map((doc) => (
                        <DocumentCard
                          key={doc.id}
                          document={doc}
                          isOwner={true}
                        />
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12">
                        <FileText className="w-12 h-12 text-green-400 mx-auto mb-4 opacity-50" />
                        <p className="text-slate-400 mb-4">No documents yet</p>
                        <button
                          onClick={() => setActiveTab('upload')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          Upload Your First Document
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
