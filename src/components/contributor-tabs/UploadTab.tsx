import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentService } from '../../services/documentService';
import { fileUploadService } from '../../services/fileUploadService';
import { Upload, FileText, File, AlertCircle, Loader, CheckCircle } from 'lucide-react';

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
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-500/10 rounded-xl">
            <Upload className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Upload Document</h2>
            <p className="text-slate-400 text-sm">Submit your document for review</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={uploading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your document"
              rows={2}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Content (Optional if file is uploaded)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your document content or upload a file below"
              rows={8}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Upload File (TXT, PDF, DOCX)
            </label>
            <div className="border-2 border-dashed border-slate-600/50 rounded-lg p-8 hover:border-green-500/50 transition-colors">
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
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="p-4 bg-slate-700/30 rounded-full mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-300 font-medium mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-slate-500 text-sm">TXT, PDF, or DOCX (max 10MB)</p>
              </label>
            </div>

            {file && (
              <div className="mt-3 flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <File className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <p className="text-green-300 font-medium">{file.name}</p>
                  <p className="text-green-400 text-xs">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-green-400 hover:text-green-300"
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-300 text-sm">Document uploaded successfully!</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setTitle('');
                setDescription('');
                setContent('');
                setFile(null);
                setError('');
              }}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={uploading}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={uploading || (!title.trim() || (!content.trim() && !file))}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              {uploading && <Loader className="w-5 h-5 animate-spin" />}
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
