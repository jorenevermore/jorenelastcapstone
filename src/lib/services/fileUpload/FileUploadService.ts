import { ref, uploadBytes, getDownloadURL, deleteObject, FirebaseStorage } from 'firebase/storage';
import type { ServiceResponse } from '../../../types/response';

export type StoragePath = 'barbershop' | 'staffs' | 'styles' | 'services';

interface FileUploadOptions {
  maxSizeInMB?: number;
  allowedFormats?: string[];
}

const DEFAULT_OPTIONS: FileUploadOptions = {
  maxSizeInMB: 5,
  allowedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

export class FileUploadService {
  constructor(private storage: FirebaseStorage) {}

  private validateFile(file: File, options: FileUploadOptions = {}): ServiceResponse {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const fileSizeInMB = file.size / (1024 * 1024);

    if (fileSizeInMB > (opts.maxSizeInMB || 5)) {
      return { success: false, message: `File size exceeds ${opts.maxSizeInMB}MB limit` };
    }

    if (opts.allowedFormats && !opts.allowedFormats.includes(file.type)) {
      return { success: false, message: 'Invalid file format. Only images are allowed.' };
    }

    return { success: true };
  }

  async uploadFile(
    file: File,
    storagePath: StoragePath,
    options?: FileUploadOptions
  ): Promise<ServiceResponse> {
    const validation = this.validateFile(file, options);
    if (!validation.success) return validation;

    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, `${storagePath}/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        success: true,
        message: 'File uploaded successfully',
        data: downloadURL
      };
    } catch (error) {
      console.error('File upload error:', error);
      return { success: false, message: 'Failed to upload file' };
    }
  }

  async deleteFile(fileUrl: string): Promise<ServiceResponse> {
    if (!fileUrl) return { success: true, message: 'No file to delete' };

    try {
      const decodedUrl = decodeURIComponent(fileUrl);
      const pathStart = decodedUrl.indexOf('/o/') + 3;
      const pathEnd = decodedUrl.indexOf('?');
      const filePath = decodedUrl.substring(pathStart, pathEnd);
      const fileRef = ref(this.storage, filePath);
      await deleteObject(fileRef);

      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('File deletion error:', error);
      return { success: false, message: 'Failed to delete file' };
    }
  }

  async replaceFile(
    newFile: File,
    oldFileUrl: string | null,
    storagePath: StoragePath,
    options?: FileUploadOptions
  ): Promise<ServiceResponse> {
    try {
      if (oldFileUrl) await this.deleteFile(oldFileUrl);
      return await this.uploadFile(newFile, storagePath, options);
    } catch (error) {
      console.error('File replacement error:', error);
      return { success: false, message: 'Failed to replace file' };
    }
  }
}

