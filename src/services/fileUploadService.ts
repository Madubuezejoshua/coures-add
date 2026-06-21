import { postForm } from '../lib/api';

export interface UploadedFile {
  name: string;
  url: string; // stored object key (resolved to a temporary URL on download)
  type: string;
  size: number;
}

export const fileUploadService = {
  async uploadFile(file: File, _userId: string): Promise<UploadedFile> {
    const form = new FormData();
    form.append('file', file);
    const res = await postForm('/uploads', form);
    return { name: res.fileName, url: res.key, type: res.fileType, size: res.size };
  },

  validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only TXT, PDF, and DOCX files are allowed' };
    }
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'File size must not exceed 10MB' };
    }
    return { valid: true };
  },

  getFileIcon(type: string): string {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('text')) return '📃';
    return '📎';
  },
};
