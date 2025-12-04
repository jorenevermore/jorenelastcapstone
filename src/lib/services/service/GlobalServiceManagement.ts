
import { BaseServiceManagement, ServiceItem, ServiceResponse } from './BaseServiceManagement';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, Firestore } from 'firebase/firestore';

export interface CreateGlobalServiceInput {
  title: string;
  featuredImage?: string;
}

export interface UpdateGlobalServiceInput {
  title?: string;
  featuredImage?: string;
}

export class GlobalServiceManagement extends BaseServiceManagement {
  private readonly COLLECTION = 'globalServices';

  constructor(private db: Firestore) {
    super();
  }

  async createService(input: CreateGlobalServiceInput): Promise<ServiceResponse> {
    try {
      let titleValidation = this.validateServiceTitle(input.title);
      if (!titleValidation.success) return titleValidation;

      let now = Date.now();
      let serviceData = {
        title: input.title.trim(),
        featuredImage: input.featuredImage || null,
        createdAt: now,
        updatedAt: now
      };

      let docRef = await addDoc(collection(this.db, this.COLLECTION), serviceData);

      this.logOperation('Create Global Service', docRef.id, true);

      return {
        success: true,
        message: 'Service created successfully',
        data: { id: docRef.id, ...serviceData }
      };
    } catch (error) {
      this.logOperation('Create Global Service', 'unknown', false);
      return this.handleError(error);
    }
  }

  async updateService(serviceId: string, input: UpdateGlobalServiceInput): Promise<ServiceResponse> {
    try {
      if (input.title) {
        let titleValidation = this.validateServiceTitle(input.title);
        if (!titleValidation.success) return titleValidation;
      }

      let updateData: any = {};
      if (input.title) updateData.title = input.title.trim();
      if (input.featuredImage !== undefined) updateData.featuredImage = input.featuredImage;
      updateData.updatedAt = Date.now();

      await updateDoc(doc(this.db, this.COLLECTION, serviceId), updateData);

      this.logOperation('Update Global Service', serviceId, true);

      return {
        success: true,
        message: 'Service updated successfully'
      };
    } catch (error) {
      this.logOperation('Update Global Service', serviceId, false);
      return this.handleError(error);
    }
  }

  async deleteService(serviceId: string): Promise<ServiceResponse> {
    try {
      await deleteDoc(doc(this.db, this.COLLECTION, serviceId));

      this.logOperation('Delete Global Service', serviceId, true);

      return {
        success: true,
        message: 'Service deleted successfully'
      };
    } catch (error) {
      this.logOperation('Delete Global Service', serviceId, false);
      return this.handleError(error);
    }
  }

  async getAllServices(): Promise<ServiceResponse> {
    try {
      let querySnapshot = await getDocs(collection(this.db, this.COLLECTION));
      let services: ServiceItem[] = [];

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
      return this.handleError(error);
    }
  }
}

