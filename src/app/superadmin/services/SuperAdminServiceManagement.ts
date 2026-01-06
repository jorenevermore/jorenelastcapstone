import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import type { ServiceResponse } from '../../../types/response';
import type { CreateGlobalServiceInput, UpdateGlobalServiceInput, ServiceItem } from '../../../types/services';
import { FileUploadService } from '../../../lib/services/fileUpload/FileUploadService';

export class SuperAdminServiceManagement {
  private readonly COLLECTION = 'services'; 
  private fileUploadService: FileUploadService;

  constructor(private db: Firestore, storage: FirebaseStorage) {
    this.fileUploadService = new FileUploadService(storage);
  }

  async createService(input: CreateGlobalServiceInput, imageFile?: File | null): Promise<ServiceResponse> {
    try {
      const now = Date.now();
      let featuredImage = input.featuredImage || null;

      if (imageFile) {
        const uploadResult = await this.fileUploadService.uploadFile(imageFile, 'services');
        if (!uploadResult.success) {
          return {
            success: false,
            message: uploadResult.message || 'Failed to upload image'
          };
        }
        featuredImage = uploadResult.data as string;
      }

      const serviceData = {
        title: input.title.trim(),
        featuredImage,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(this.db, this.COLLECTION), serviceData);
      await updateDoc(docRef, { id: docRef.id });

      return {
        success: true,
        message: 'Service created successfully',
        data: { id: docRef.id, ...serviceData }
      };
    } catch (error) {
      console.error('SuperAdmin service management error:', error);
      return {
        success: false,
        message: 'Operation failed'
      };
    }
  }

  async updateService(serviceId: string, input: UpdateGlobalServiceInput, imageFile?: File | null, currentImage?: string | null): Promise<ServiceResponse> {
    try {
      const updateData: Partial<ServiceItem> = {};
      if (input.title) updateData.title = input.title.trim();
      
      let featuredImage: string | undefined = currentImage || undefined;
      
      if (imageFile) {
        const uploadResult = await this.fileUploadService.uploadFile(imageFile, 'services');
        if (!uploadResult.success) {
          return {
            success: false,
            message: uploadResult.message || 'Failed to upload image'
          };
        }
        featuredImage = uploadResult.data as string;
      } else if (input.featuredImage !== undefined) {
        featuredImage = input.featuredImage;
      }

      if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
      updateData.updatedAt = Date.now();

      await updateDoc(doc(this.db, this.COLLECTION, serviceId), updateData);

      return {
        success: true,
        message: 'Service updated successfully'
      };
    } catch (error) {
      console.error('SuperAdmin service management error:', error);
      return {
        success: false,
        message: 'Operation failed'
      };
    }
  }

  async deleteService(serviceId: string): Promise<ServiceResponse> {
    try {
      await deleteDoc(doc(this.db, this.COLLECTION, serviceId));

      return {
        success: true,
        message: 'Service deleted successfully'
      };
    } catch (error) {
      console.error('SuperAdmin service management error:', error);
      return {
        success: false,
        message: 'Operation failed'
      };
    }
  }

  async getAllServices(): Promise<ServiceResponse> {
    try {
      const querySnapshot = await getDocs(collection(this.db, this.COLLECTION));
      const services: ServiceItem[] = [];

      querySnapshot.forEach((doc) => {
        services.push({
          id: doc.id,
          ...doc.data()
        } as ServiceItem);
      });

      return {
        success: true,
        message: 'Services retrieved successfully',
        data: services
      };
    } catch (error) {
      console.error('SuperAdmin service management error:', error);
      return {
        success: false,
        message: 'Operation failed'
      };
    }
  }
}
