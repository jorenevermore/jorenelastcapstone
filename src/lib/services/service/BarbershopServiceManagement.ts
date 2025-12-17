
import { collection, updateDoc, deleteDoc, getDocs, query, where, doc, Firestore, getDoc } from 'firebase/firestore';
import type { ServiceResponse } from '../../../types/api';
import type { Service, Style } from '../../../types/services';

export class BarbershopServiceManagement {
  private readonly COLLECTION = 'services';

  constructor(private db: Firestore) {}

  private handleError(error: unknown): ServiceResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Service management error:', errorMessage);
    return {
      success: false,
      message: 'Operation failed',
      error: errorMessage
    };
  }

  async getServicesByBarbershop(barbershopId: string): Promise<ServiceResponse> {
    try {

      const barbershopDoc = await getDoc(doc(this.db, 'barbershops', barbershopId));

      if (!barbershopDoc.exists()) {
        return {
          success: true,
          message: 'Barbershop not found',
          data: []
        };
      }

      const barbershopData = barbershopDoc.data();
      const services = barbershopData?.services || [];

      return {
        success: true,
        message: 'Services retrieved successfully',
        data: services
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateBarbershopServices(barbershopId: string, services: Service[]): Promise<ServiceResponse> {
    try {
      const barbershopRef = doc(this.db, 'barbershops', barbershopId);
      await updateDoc(barbershopRef, { services });

      return {
        success: true,
        message: 'Services updated successfully'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getServices(barbershopId: string): Promise<ServiceResponse> {
    return this.getServicesByBarbershop(barbershopId);
  }

  async getStyles(barbershopId: string): Promise<ServiceResponse> {
    try {
      const stylesQuery = query(collection(this.db, 'styles'), where('barberOrBarbershop', '==', barbershopId));
      const querySnapshot = await getDocs(stylesQuery);
      const styles: Style[] = [];

      querySnapshot.forEach((styleDoc) => {
        styles.push({
          docId: styleDoc.id,
          ...styleDoc.data()
        } as Style);
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

  async updateServices(barbershopId: string, services: Service[]): Promise<ServiceResponse> {
    return this.updateBarbershopServices(barbershopId, services);
  }

  async deleteStyle(styleDocId: string): Promise<ServiceResponse> {
    try {
      await deleteDoc(doc(this.db, 'styles', styleDocId));

      return {
        success: true,
        message: 'Style deleted successfully'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

