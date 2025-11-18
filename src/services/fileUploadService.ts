import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

export interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

export const fileUploadService = {
  async uploadFile(file: File, userId: string): Promise<UploadedFile> {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `documents/${userId}/${timestamp}_${safeName}`;
    const fileRef = ref(storage, filePath);

    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    return {
      name: file.name,
      url,
      type: file.type,
      size: file.size,
    };
  },

  validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only TXT, PDF, and DOCX files are allowed',
      };
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must not exceed 10MB',
      };
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
