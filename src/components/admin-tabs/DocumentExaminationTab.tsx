import React, { useState, useEffect, useRef } from 'react';
import { documentService, Document } from '../../services/documentService';
import { FileSearch, Eye, X, Circle, Type, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Annotation {
  id: string;
  type: 'circle' | 'note';
  color?: 'red' | 'blue' | 'black';
  text?: string;
  position: { start: number; end: number };
  timestamp: Date;
}

interface DocumentAnnotations {
  documentId: string;
  annotations: Annotation[];
  updatedAt: Date;
  updatedBy: string;
}

export const DocumentExaminationTab: React.FC = () => {
  const { user, displayName } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [statusFilter, setStatusFilter] = useState<Document['status'] | 'all'>('all');
  const [annotationMode, setAnnotationMode] = useState<'view' | 'circle' | 'note'>('view');
  const [selectedColor, setSelectedColor] = useState<'red' | 'blue' | 'black'>('red');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedText, setSelectedText] = useState<{ start: number; end: number } | null>(null);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (selectedDoc) {
      loadAnnotations(selectedDoc.id!);
    }
  }, [selectedDoc]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentService.getAllDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnnotations = async (documentId: string) => {
    try {
      const annotationRef = doc(db, 'documentAnnotations', documentId);
      const annotationDoc = await getDoc(annotationRef);
      if (annotationDoc.exists()) {
        const data = annotationDoc.data() as DocumentAnnotations;
        setAnnotations(data.annotations || []);
      } else {
        setAnnotations([]);
      }
    } catch (error) {
      console.error('Error loading annotations:', error);
      setAnnotations([]);
    }
  };

  const saveAnnotations = async () => {
    if (!selectedDoc || !user) return;
    try {
      setSaving(true);
      const annotationRef = doc(db, 'documentAnnotations', selectedDoc.id!);
      await setDoc(annotationRef, {
        documentId: selectedDoc.id,
        annotations,
        updatedAt: new Date(),
        updatedBy: displayName || user.email || 'Admin',
      });
    } catch (error) {
      console.error('Error saving annotations:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTextSelection = () => {
    if (annotationMode === 'view') return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const contentElement = contentRef.current;
    if (!contentElement || !contentElement.contains(range.commonAncestorContainer)) return;

    const preRange = document.createRange();
    preRange.setStart(contentElement, 0);
    preRange.setEnd(range.startContainer, range.startOffset);
    const start = preRange.toString().length;
    const end = start + range.toString().length;

    if (start === end) return;

    setSelectedText({ start, end });

    if (annotationMode === 'circle') {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'circle',
        color: selectedColor,
        position: { start, end },
        timestamp: new Date(),
      };
      setAnnotations([...annotations, newAnnotation]);
      selection.removeAllRanges();
    }
  };

  const addNote = () => {
    if (!selectedText || !noteText.trim()) return;

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: 'note',
      text: noteText,
      position: selectedText,
      timestamp: new Date(),
    };

    setAnnotations([...annotations, newAnnotation]);
    setNoteText('');
    setSelectedText(null);
    setAnnotationMode('view');
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter((a) => a.id !== id));
  };

  const renderAnnotatedContent = () => {
    if (!selectedDoc) return null;

    const content = selectedDoc.content;
    const sortedAnnotations = [...annotations].sort((a, b) => a.position.start - b.position.start);

    const segments: JSX.Element[] = [];
    let lastIndex = 0;

    sortedAnnotations.forEach((annotation, idx) => {
      if (annotation.type !== 'circle') return;

      if (annotation.position.start > lastIndex) {
        segments.push(
          <span key={`text-${lastIndex}`}>
            {content.substring(lastIndex, annotation.position.start)}
          </span>
        );
      }

      const colorClass = {
        red: 'bg-red-500/30 border-b-2 border-red-500',
        blue: 'bg-purple-500/30 border-b-2 border-purple-500',
        black: 'bg-slate-900/50 border-b-2 border-slate-400',
      }[annotation.color || 'red'];

      segments.push(
        <span key={annotation.id} className={`${colorClass} px-1 rounded`}>
          {content.substring(annotation.position.start, annotation.position.end)}
        </span>
      );

      lastIndex = annotation.position.end;
    });

    if (lastIndex < content.length) {
      segments.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>);
    }

    return segments;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/10 text-green-300 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/10 text-red-300 border-red-500/30';
      case 'under_review':
      case 'submitted':
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
      case 'approved':
        return 'bg-purple-500/10 text-blue-300 border-purple-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
    }
  };

  const filteredDocuments =
    statusFilter === 'all' ? documents : documents.filter((doc) => doc.status === statusFilter);

  const closeModal = () => {
    setSelectedDoc(null);
    setAnnotationMode('view');
    setAnnotations([]);
    setSelectedText(null);
    setNoteText('');
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
          <h2 className="text-2xl font-bold text-white mb-2">Document Examination</h2>
          <p className="text-slate-400">Total: {documents.length} documents</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="p-5 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-slate-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white flex-1">{doc.title}</h3>
                <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(doc.status)}`}>
                  {doc.status.replace(/_/g, ' ')}
                </span>
              </div>

              <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                {doc.description || doc.content.substring(0, 100)}...
              </p>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Author:</span>
                  <span className="text-slate-200">{doc.contributorName}</span>
                </div>
                {doc.reviewerName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reviewer:</span>
                    <span className="text-slate-200">{doc.reviewerName}</span>
                  </div>
                )}
                {doc.publisherName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Publisher:</span>
                    <span className="text-slate-200">{doc.publisherName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Created:</span>
                  <span className="text-slate-200">{formatDate(doc.createdAt)}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedDoc(doc)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-blue-300 rounded-lg text-sm transition-colors"
              >
                <Eye className="w-4 h-4" />
                Examine Document
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <FileSearch className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No documents found</p>
          </div>
        )}
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Document Examination</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-3 gap-6 p-6">
                <div className="col-span-2 space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">{selectedDoc.title}</h4>
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm border ${getStatusColor(selectedDoc.status)}`}
                    >
                      {selectedDoc.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex gap-2 p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg">
                    <button
                      onClick={() => setAnnotationMode('view')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        annotationMode === 'view'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => setAnnotationMode('circle')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        annotationMode === 'circle'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <Circle className="w-4 h-4" />
                      Mark Text
                    </button>
                    <button
                      onClick={() => setAnnotationMode('note')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        annotationMode === 'note'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <Type className="w-4 h-4" />
                      Add Note
                    </button>
                  </div>

                  {annotationMode === 'circle' && (
                    <div className="flex gap-2 p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg">
                      <span className="text-slate-300 text-sm font-medium mr-2">Marker Color:</span>
                      <button
                        onClick={() => setSelectedColor('red')}
                        className={`w-8 h-8 rounded-full bg-red-500 border-2 transition-all ${
                          selectedColor === 'red'
                            ? 'border-white scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                      />
                      <button
                        onClick={() => setSelectedColor('blue')}
                        className={`w-8 h-8 rounded-full bg-purple-500 border-2 transition-all ${
                          selectedColor === 'blue'
                            ? 'border-white scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                      />
                      <button
                        onClick={() => setSelectedColor('black')}
                        className={`w-8 h-8 rounded-full bg-slate-900 border-2 transition-all ${
                          selectedColor === 'black'
                            ? 'border-white scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                      />
                      <span className="text-slate-400 text-xs ml-2 self-center">
                        Select text to mark it
                      </span>
                    </div>
                  )}

                  {annotationMode === 'note' && (
                    <div className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg">
                      <p className="text-slate-300 text-sm mb-2">
                        Select text, then add a note below:
                      </p>
                      {selectedText && (
                        <div className="space-y-2">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Enter your note..."
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                          <button
                            onClick={addNote}
                            disabled={!noteText.trim()}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                          >
                            Add Note
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <h5 className="text-sm font-medium text-slate-400 mb-2">Document Content</h5>
                    <div
                      ref={contentRef}
                      onMouseUp={handleTextSelection}
                      className={`bg-slate-700/30 border border-slate-600/50 rounded-lg p-6 ${
                        annotationMode !== 'view' ? 'cursor-text select-text' : ''
                      }`}
                    >
                      <div className="text-slate-200 whitespace-pre-wrap leading-relaxed text-base">
                        {renderAnnotatedContent()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-slate-400 mb-2">Author</h5>
                      <p className="text-white">{selectedDoc.contributorName}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-slate-400 mb-2">Created</h5>
                      <p className="text-white">{formatDate(selectedDoc.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Annotations ({annotations.length})
                    </h5>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {annotations.length > 0 ? (
                        annotations.map((annotation) => (
                          <div
                            key={annotation.id}
                            className="p-3 bg-slate-800/50 border border-slate-600/30 rounded-lg"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {annotation.type === 'circle' ? (
                                  <>
                                    <Circle className="w-4 h-4 text-slate-400" />
                                    <div
                                      className={`w-3 h-3 rounded-full ${
                                        annotation.color === 'red'
                                          ? 'bg-red-500'
                                          : annotation.color === 'blue'
                                            ? 'bg-purple-500'
                                            : 'bg-slate-900 border border-slate-400'
                                      }`}
                                    />
                                  </>
                                ) : (
                                  <Type className="w-4 h-4 text-slate-400" />
                                )}
                                <span className="text-xs text-slate-400">
                                  {annotation.type === 'circle' ? 'Marked Text' : 'Note'}
                                </span>
                              </div>
                              <button
                                onClick={() => deleteAnnotation(annotation.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {annotation.type === 'note' && annotation.text && (
                              <p className="text-sm text-slate-200 mb-2">{annotation.text}</p>
                            )}

                            <p className="text-xs text-slate-500">
                              Position: {annotation.position.start} - {annotation.position.end}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm text-center py-4">No annotations yet</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={saveAnnotations}
                    disabled={saving || annotations.length === 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Annotations'}
                  </button>

                  {selectedDoc.reviewComments && (
                    <div>
                      <h5 className="text-sm font-medium text-slate-400 mb-2">Review Comments</h5>
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                        <p className="text-blue-200 text-sm">{selectedDoc.reviewComments}</p>
                      </div>
                    </div>
                  )}

                  {selectedDoc.rejectionReason && (
                    <div>
                      <h5 className="text-sm font-medium text-slate-400 mb-2">Rejection Reason</h5>
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <p className="text-red-200 text-sm">{selectedDoc.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
