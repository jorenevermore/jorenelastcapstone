
import { BaseServiceManagement, ServiceItem, ServiceResponse } from './BaseServiceManagement';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, query, where, doc, Firestore, getDoc } from 'firebase/firestore';

export interface CreateBarbershopServiceInput {
  barbershopId: string;
  serviceCategoryId: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  featuredImage?: string;
}

export interface UpdateBarbershopServiceInput {
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
  featuredImage?: string;
}

export class BarbershopServiceManagement extends BaseServiceManagement {
  private readonly COLLECTION = 'services';

  constructor(private db: Firestore) {
    super();
  }



  async getServicesByBarbershop(barbershopId: string): Promise<ServiceResponse> {
    try {
      // get barbershop profile to get their services array
      let barbershopDoc = await getDoc(doc(this.db, 'barbershops', barbershopId));

      if (!barbershopDoc.exists()) {
        return {
          success: true,
          message: 'Barbershop not found',
          data: []
        };
      }

      let barbershopData = barbershopDoc.data();
      let services = barbershopData?.services || [];

      return {
        success: true,
        message: 'Services retrieved successfully',
        data: services
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateBarbershopServices(barbershopId: string, services: any[]): Promise<ServiceResponse> {
    try {
      let barbershopRef = doc(this.db, 'barbershops', barbershopId);
      await updateDoc(barbershopRef, { services });

      this.logOperation('Update Barbershop Services', barbershopId, true);

      return {
        success: true,
        message: 'Barbershop services updated successfully'
      };
    } catch (error) {
      this.logOperation('Update Barbershop Services', barbershopId, false);
      return this.handleError(error);
    }
  }

  async getServices(barbershopId: string): Promise<ServiceResponse> {
    return this.getServicesByBarbershop(barbershopId);
  }

  async getStyles(barbershopId: string): Promise<ServiceResponse> {
    try {
      let q = query(collection(this.db, 'styles'), where('barberOrBarbershop', '==', barbershopId));
      let querySnapshot = await getDocs(q);
      let styles: any[] = [];

      querySnapshot.forEach((doc) => {
        styles.push({
          docId: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        message: 'Styles retrieved successfully',
        data: styles
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateServices(barbershopId: string, services: any[]): Promise<ServiceResponse> {
    return this.updateBarbershopServices(barbershopId, services);
  }

  async deleteStyle(styleDocId: string): Promise<ServiceResponse> {
    try {
      await deleteDoc(doc(this.db, 'styles', styleDocId));

      this.logOperation('Delete Style', styleDocId, true);

      return {
        success: true,
        message: 'Style deleted successfully'
      };
    } catch (error) {
      this.logOperation('Delete Style', styleDocId, false);
      return this.handleError(error);
    }
  }
}

