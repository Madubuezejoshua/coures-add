import React, { useState, useEffect, useRef } from 'react';
import { documentService, Document } from '../../services/documentService';
import { FileSearch, Eye, Circle, Type, Save, Trash2 } from 'lucide-react';
import {
  Spinner,
  EmptyState,
  PageHeader,
  Notice,
  Button,
  StatusBadge,
  Modal,
  Select,
  Textarea,
} from '../ui';
import { cn } from '../../lib/cn';

interface Annotation {
  id: string;
  type: 'circle' | 'note';
  color?: 'red' | 'blue' | 'black';
  text?: string;
  position: { start: number; end: number };
  timestamp: Date;
}

export const DocumentExaminationTab: React.FC = () => {
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

  // Annotations are kept for the current session (no persistence endpoint yet).
  const loadAnnotations = (_documentId: string) => {
    setAnnotations([]);
  };

  const saveAnnotations = async () => {
    if (!selectedDoc) return;
    setSaving(true);
    setTimeout(() => setSaving(false), 300);
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

    sortedAnnotations.forEach((annotation) => {
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
    return <Spinner label="Loading documents…" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Examination"
        description={`Total: ${documents.length} documents`}
        actions={
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="w-48"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </Select>
        }
      />

      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-slate-900">{doc.title}</h3>
                <StatusBadge status={doc.status} />
              </div>

              <p className="mb-4 line-clamp-2 text-sm text-slate-500">
                {doc.description || doc.content.substring(0, 100)}
              </p>

              <div className="space-y-1.5 text-sm text-slate-500">
                <div className="flex justify-between">
                  <span className="text-slate-400">Author</span>
                  <span className="font-medium text-slate-700">{doc.contributorName}</span>
                </div>
                {doc.reviewerName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reviewer</span>
                    <span className="font-medium text-slate-700">{doc.reviewerName}</span>
                  </div>
                )}
                {doc.publisherName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Publisher</span>
                    <span className="font-medium text-slate-700">{doc.publisherName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Created</span>
                  <span className="font-medium text-slate-700">{formatDate(doc.createdAt)}</span>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <Button fullWidth size="sm" variant="outline" onClick={() => setSelectedDoc(doc)}>
                  <Eye className="h-4 w-4" /> Examine Document
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={FileSearch} title="No documents found" />
      )}

      {selectedDoc && (
        <Modal onClose={closeModal} title="Document Examination" size="xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-lg font-semibold text-slate-900">{selectedDoc.title}</h4>
                <StatusBadge status={selectedDoc.status} />
              </div>

              <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                <Button
                  fullWidth
                  size="sm"
                  variant={annotationMode === 'view' ? 'primary' : 'ghost'}
                  onClick={() => setAnnotationMode('view')}
                >
                  <Eye className="h-4 w-4" /> View
                </Button>
                <Button
                  fullWidth
                  size="sm"
                  variant={annotationMode === 'circle' ? 'primary' : 'ghost'}
                  onClick={() => setAnnotationMode('circle')}
                >
                  <Circle className="h-4 w-4" /> Mark Text
                </Button>
                <Button
                  fullWidth
                  size="sm"
                  variant={annotationMode === 'note' ? 'primary' : 'ghost'}
                  onClick={() => setAnnotationMode('note')}
                >
                  <Type className="h-4 w-4" /> Add Note
                </Button>
              </div>

              {annotationMode === 'circle' && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="mr-2 text-sm font-medium text-slate-600">Marker Color:</span>
                  <button
                    onClick={() => setSelectedColor('red')}
                    className={cn(
                      'h-8 w-8 rounded-full bg-red-500 border-2 transition-all',
                      selectedColor === 'red' ? 'scale-110 border-slate-900' : 'border-transparent hover:scale-105'
                    )}
                  />
                  <button
                    onClick={() => setSelectedColor('blue')}
                    className={cn(
                      'h-8 w-8 rounded-full bg-purple-500 border-2 transition-all',
                      selectedColor === 'blue' ? 'scale-110 border-slate-900' : 'border-transparent hover:scale-105'
                    )}
                  />
                  <button
                    onClick={() => setSelectedColor('black')}
                    className={cn(
                      'h-8 w-8 rounded-full bg-slate-900 border-2 transition-all',
                      selectedColor === 'black' ? 'scale-110 border-slate-400' : 'border-transparent hover:scale-105'
                    )}
                  />
                  <span className="ml-2 self-center text-xs text-slate-400">Select text to mark it</span>
                </div>
              )}

              {annotationMode === 'note' && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-2 text-sm text-slate-600">Select text, then add a note below:</p>
                  {selectedText && (
                    <div className="space-y-2">
                      <Textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Enter your note…"
                        rows={3}
                      />
                      <Button size="sm" variant="success" disabled={!noteText.trim()} onClick={addNote}>
                        Add Note
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h5 className="mb-2 text-sm font-medium text-slate-500">Document Content</h5>
                <div
                  ref={contentRef}
                  onMouseUp={handleTextSelection}
                  className={cn(
                    'rounded-xl border border-slate-200 bg-white p-6',
                    annotationMode !== 'view' && 'cursor-text select-text'
                  )}
                >
                  <div className="whitespace-pre-wrap text-base leading-relaxed text-slate-700">
                    {renderAnnotatedContent()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="mb-1 text-sm font-medium text-slate-500">Author</h5>
                  <p className="font-medium text-slate-800">{selectedDoc.contributorName}</p>
                </div>
                <div>
                  <h5 className="mb-1 text-sm font-medium text-slate-500">Created</h5>
                  <p className="font-medium text-slate-800">{formatDate(selectedDoc.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h5 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Type className="h-4 w-4" />
                  Annotations ({annotations.length})
                </h5>

                <div className="max-h-[400px] space-y-3 overflow-y-auto">
                  {annotations.length > 0 ? (
                    annotations.map((annotation) => (
                      <div key={annotation.id} className="rounded-lg border border-slate-200 bg-white p-3">
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {annotation.type === 'circle' ? (
                              <>
                                <Circle className="h-4 w-4 text-slate-400" />
                                <div
                                  className={cn(
                                    'h-3 w-3 rounded-full',
                                    annotation.color === 'red'
                                      ? 'bg-red-500'
                                      : annotation.color === 'blue'
                                        ? 'bg-purple-500'
                                        : 'bg-slate-900 border border-slate-400'
                                  )}
                                />
                              </>
                            ) : (
                              <Type className="h-4 w-4 text-slate-400" />
                            )}
                            <span className="text-xs text-slate-500">
                              {annotation.type === 'circle' ? 'Marked Text' : 'Note'}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteAnnotation(annotation.id)}
                            className="text-rose-500 transition-colors hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {annotation.type === 'note' && annotation.text && (
                          <p className="mb-2 text-sm text-slate-700">{annotation.text}</p>
                        )}

                        <p className="text-xs text-slate-400">
                          Position: {annotation.position.start} - {annotation.position.end}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-center text-sm text-slate-400">No annotations yet</p>
                  )}
                </div>
              </div>

              <Button
                fullWidth
                variant="success"
                loading={saving}
                disabled={saving || annotations.length === 0}
                onClick={saveAnnotations}
              >
                <Save className="h-5 w-5" />
                {saving ? 'Saving…' : 'Save Annotations'}
              </Button>

              {selectedDoc.reviewComments && (
                <div>
                  <h5 className="mb-2 text-sm font-medium text-slate-500">Review Comments</h5>
                  <Notice tone="info">{selectedDoc.reviewComments}</Notice>
                </div>
              )}

              {selectedDoc.rejectionReason && (
                <div>
                  <h5 className="mb-2 text-sm font-medium text-slate-500">Rejection Reason</h5>
                  <Notice tone="danger">{selectedDoc.rejectionReason}</Notice>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
