
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, Firestore } from 'firebase/firestore';
import type { ServiceResponse } from '../../../types/response';
import type { CreateGlobalServiceInput, UpdateGlobalServiceInput, ServiceItem } from '../../../types/services';

export class GlobalServiceManagement {
  private readonly COLLECTION = 'globalServices';

  constructor(private db: Firestore) {}

  async createService(input: CreateGlobalServiceInput): Promise<ServiceResponse> {
    try {
      const now = Date.now();
      const serviceData = {
        title: input.title.trim(),
        featuredImage: input.featuredImage || null,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(this.db, this.COLLECTION), serviceData);

      return {
        success: true,
        message: 'Service created successfully',
        data: { id: docRef.id, ...serviceData }
      };
    } catch (error) {
      console.error('Global service management error:', error);
      return {
        success: false,
        message: 'Operation failed'
      };
    }
  }

  async updateService(serviceId: string, input: UpdateGlobalServiceInput): Promise<ServiceResponse> {
    try {
      const updateData: Partial<ServiceItem> = {};
      if (input.title) updateData.title = input.title.trim();
      if (input.featuredImage !== undefined) updateData.featuredImage = input.featuredImage;
      updateData.updatedAt = Date.now();

      await updateDoc(doc(this.db, this.COLLECTION, serviceId), updateData);

      return {
        success: true,
        message: 'Service updated successfully'
      };
    } catch (error) {
      console.error('Global service management error:', error);
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
      console.error('Global service management error:', error);
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
      console.error('Global service management error:', error);
      return {
        success: false,
        message: 'Operation failed'
      };
    }
  }
}

