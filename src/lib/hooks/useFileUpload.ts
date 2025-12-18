'use client';

import { useState, useCallback } from 'react';
import { storage } from '../firebase';
import { FileUploadService, type StoragePath } from '../services/fileUpload/FileUploadService';
import type { ServiceResponse } from '../../types/response';

interface FileUploadOptions {
  maxSizeInMB?: number;
  allowedFormats?: string[];
}

const fileUploadService = new FileUploadService(storage);

export interface UseFileUploadReturn {
  uploadFile: (file: File, storagePath: StoragePath, options?: FileUploadOptions) => Promise<ServiceResponse>;
  deleteFile: (fileUrl: string) => Promise<ServiceResponse>;
  replaceFile: (newFile: File, oldFileUrl: string | null, storagePath: StoragePath, options?: FileUploadOptions) => Promise<ServiceResponse>;
  isUploading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File, storagePath: StoragePath, options?: FileUploadOptions): Promise<ServiceResponse> => {
      setIsUploading(true);
      setError(null);

      const result = await fileUploadService.uploadFile(file, storagePath, options);
      if (!result.success) setError(result.message || 'Upload failed');
      setIsUploading(false);

      return result;
    },
    []
  );

  const deleteFile = useCallback(
    async (fileUrl: string): Promise<ServiceResponse> => {
      setError(null);
      const result = await fileUploadService.deleteFile(fileUrl);
      if (!result.success) setError(result.message || 'Delete failed');
      return result;
    },
    []
  );

  const replaceFile = useCallback(
    async (
      newFile: File,
      oldFileUrl: string | null,
      storagePath: StoragePath,
      options?: FileUploadOptions
    ): Promise<ServiceResponse> => {
      setIsUploading(true);
      setError(null);

      const result = await fileUploadService.replaceFile(newFile, oldFileUrl, storagePath, options);
      if (!result.success) setError(result.message || 'Replace failed');
      setIsUploading(false);

      return result;
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return { uploadFile, deleteFile, replaceFile, isUploading, error, clearError };
}

