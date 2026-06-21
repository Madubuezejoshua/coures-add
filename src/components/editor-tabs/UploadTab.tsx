import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService } from '../../services/documentService';
import { fileUploadService } from '../../services/fileUploadService';
import { Upload, FileText, File, X } from 'lucide-react';
import { Card, CardBody, FormField, Input, Textarea, Button, Notice } from '../ui';

export const UploadTab: React.FC<{ onUploadComplete: () => void }> = ({ onUploadComplete }) => {
  const { user, displayName } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validation = fileUploadService.validateFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim() || (!content.trim() && !file)) {
      setError('Please provide a title and either content or a file');
      return;
    }

    try {
      setUploading(true);
      setError('');

      let fileUrl: string | undefined;
      let fileName: string | undefined;
      let fileType: string | undefined;

      if (file) {
        const uploadedFile = await fileUploadService.uploadFile(file, user.uid);
        fileUrl = uploadedFile.url;
        fileName = uploadedFile.name;
        fileType = uploadedFile.type;
      }

      await documentService.createDocument(
        title,
        content || 'See attached file',
        description,
        user.uid,
        displayName || user.email || 'Unknown',
        fileUrl,
        fileName,
        fileType
      );

      setSuccess(true);
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setContent('');
        setFile(null);
        setSuccess(false);
        onUploadComplete();
      }, 2000);
    } catch (err: any) {
      console.error('Error uploading document:', err);
      const code = err?.code as string | undefined;
      if (err?.status === 401) {
        setError('Your session appears to have expired. Please sign in again and try the upload once more.');
      } else if (code === 'storage/unauthorized') {
        setError('File upload was blocked. Please check your access or try again without a file.');
      } else if (code === 'storage/retry-limit-exceeded' || code === 'storage/canceled') {
        setError('The file upload timed out. Please check your connection and try again.');
      } else {
        setError(err?.message ? `Failed to upload document: ${err.message}` : 'Failed to upload document');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardBody className="p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
              <Upload className="h-6 w-6 text-brand-600" />
            </span>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Upload Document</h2>
              <p className="text-sm text-slate-500">Submit your document for review</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Title" required>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                disabled={uploading}
                required
              />
            </FormField>

            <FormField label="Description">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your document"
                rows={2}
                disabled={uploading}
              />
            </FormField>

            <FormField label="Content" hint="Optional if a file is uploaded">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your document content or upload a file below"
                rows={8}
                disabled={uploading}
                className="font-mono text-sm"
              />
            </FormField>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Upload File (TXT, PDF, DOCX)
              </label>
              <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 transition-colors hover:border-brand-300">
                <input
                  type="file"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex cursor-pointer flex-col items-center justify-center"
                >
                  <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <FileText className="h-8 w-8 text-slate-400" />
                  </span>
                  <p className="mb-1 font-medium text-slate-700">Click to upload or drag and drop</p>
                  <p className="text-sm text-slate-400">TXT, PDF, or DOCX (max 10MB)</p>
                </label>
              </div>

              {file && (
                <div className="mt-3 flex items-center gap-3 rounded-xl bg-emerald-50 p-3 ring-1 ring-inset ring-emerald-200">
                  <File className="h-5 w-5 text-emerald-600" />
                  <div className="flex-1">
                    <p className="font-medium text-emerald-800">{file.name}</p>
                    <p className="text-xs text-emerald-600">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" /> Remove
                  </Button>
                </div>
              )}
            </div>

            {error && <Notice tone="danger">{error}</Notice>}

            {success && <Notice tone="success">Document uploaded successfully!</Notice>}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => {
                  setTitle('');
                  setDescription('');
                  setContent('');
                  setFile(null);
                  setError('');
                }}
                disabled={uploading}
              >
                Clear
              </Button>
              <Button
                type="submit"
                fullWidth
                loading={uploading}
                disabled={uploading || !title.trim() || (!content.trim() && !file)}
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
