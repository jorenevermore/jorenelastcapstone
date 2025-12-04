/**
 * Staff Management Service
 * Handles barber/staff management operations
 */

import { BaseStaffService, Barber, ServiceResponse } from './BaseStaffService';
import { collection, getDocs, query, where, doc, getDoc, addDoc, updateDoc, deleteDoc, onSnapshot, Unsubscribe, Firestore, arrayUnion, arrayRemove } from 'firebase/firestore';

export class StaffManagementService extends BaseStaffService {
  private readonly COLLECTION = 'barbersprofile';

  constructor(private db: Firestore) {
    super();
  }

  async getAllBarbers(): Promise<ServiceResponse> {
    try {
      let barbersCollection = collection(this.db, this.COLLECTION);
      let barberSnapshot = await getDocs(barbersCollection);

      let barbers = barberSnapshot.docs.map(doc => {
        let data = doc.data() as Omit<Barber, 'barberId'>;
        return { ...data, barberId: doc.id };
      });

      this.logOperation('Get All Barbers', 'all', true);
      return {
        success: true,
        message: 'Barbers retrieved successfully',
        data: barbers
      };
    } catch (error) {
      this.logOperation('Get All Barbers', 'all', false);
      return this.handleError(error);
    }
  }

  async getBarbersByBarbershopId(barbershopId: string): Promise<ServiceResponse> {
    try {
      let barbersCollection = collection(this.db, this.COLLECTION);
      let q = query(barbersCollection, where('affiliatedBarbershopId', '==', barbershopId));
      let barberSnapshot = await getDocs(q);

      let barbers = barberSnapshot.docs.map(doc => {
        let data = doc.data() as Omit<Barber, 'barberId'>;
        return { ...data, barberId: doc.id };
      });

      return {
        success: true,
        message: 'Barbers retrieved successfully',
        data: barbers
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getBarberById(barberId: string): Promise<ServiceResponse> {
    try {
      let barberDoc = doc(this.db, this.COLLECTION, barberId);
      let barberSnapshot = await getDoc(barberDoc);

      if (!barberSnapshot.exists()) {
        return {
          success: false,
          message: 'Barber not found',
          error: 'NOT_FOUND'
        };
      }

      let data = barberSnapshot.data() as Barber;
      return {
        success: true,
        message: 'Barber retrieved successfully',
        data: { ...data, barberId: barberSnapshot.id }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async addBarber(barberData: Omit<Barber, 'barberId'>): Promise<ServiceResponse> {
    try {
      let validation = this.validateBarberData(barberData);
      if (!validation.success) return validation;

      let barbersCollection = collection(this.db, this.COLLECTION);
      let docRef = await addDoc(barbersCollection, barberData);
      await updateDoc(docRef, { barberId: docRef.id });

      this.logOperation('Add Barber', docRef.id, true);
      return {
        success: true,
        message: 'Barber added successfully',
        data: { ...barberData, barberId: docRef.id }
      };
    } catch (error) {
      this.logOperation('Add Barber', 'unknown', false);
      return this.handleError(error);
    }
  }

  /**
   * Add barber to a specific barbershop
   * This creates the barber profile AND appends the barber ID to the barbershop's barbers array
   */
  async addBarberToBarbershop(barbershopId: string, barberData: Omit<Barber, 'barberId'>): Promise<ServiceResponse> {
    try {
      let validation = this.validateBarberData(barberData);
      if (!validation.success) return validation;

      // 1. Create barber profile
      let barbersCollection = collection(this.db, this.COLLECTION);
      let docRef = await addDoc(barbersCollection, barberData);
      await updateDoc(docRef, { barberId: docRef.id });

      // 2. Append barber ID to barbershop's barbers array
      let barbershopDoc = doc(this.db, 'barbershops', barbershopId);
      await updateDoc(barbershopDoc, {
        barbers: arrayUnion(docRef.id)
      });

      this.logOperation('Add Barber to Barbershop', docRef.id, true);
      return {
        success: true,
        message: 'Barber added to barbershop successfully',
        data: { ...barberData, barberId: docRef.id }
      };
    } catch (error) {
      this.logOperation('Add Barber to Barbershop', 'unknown', false);
      return this.handleError(error);
    }
  }

  /**
   * Remove barber from a specific barbershop (Hard Delete)
   * This removes the barber ID from the barbershop's barbers array AND deletes the barber profile completely
   */
  async removeBarberFromBarbershop(barbershopId: string, barberId: string): Promise<ServiceResponse> {
    try {
      // 1. Remove barber ID from barbershop's barbers array
      let barbershopDoc = doc(this.db, 'barbershops', barbershopId);
      await updateDoc(barbershopDoc, {
        barbers: arrayRemove(barberId)
      });

      // 2. Delete the barber profile completely
      let barberDoc = doc(this.db, this.COLLECTION, barberId);
      await deleteDoc(barberDoc);

      this.logOperation('Remove Barber from Barbershop', barberId, true);
      return {
        success: true,
        message: 'Barber removed from barbershop and profile deleted successfully'
      };
    } catch (error) {
      this.logOperation('Remove Barber from Barbershop', barberId, false);
      return this.handleError(error);
    }
  }

  async updateBarber(barberId: string, barberData: Partial<Omit<Barber, 'barberId'>>): Promise<ServiceResponse> {
    try {
      let validation = this.validateBarberData(barberData);
      if (!validation.success) return validation;

      let barberDoc = doc(this.db, this.COLLECTION, barberId);
      await updateDoc(barberDoc, barberData);

      this.logOperation('Update Barber', barberId, true);
      return {
        success: true,
        message: 'Barber updated successfully'
      };
    } catch (error) {
      this.logOperation('Update Barber', barberId, false);
      return this.handleError(error);
    }
  }

  async deleteBarber(barberId: string): Promise<ServiceResponse> {
    try {
      let barberDoc = doc(this.db, this.COLLECTION, barberId);
      await deleteDoc(barberDoc);

      this.logOperation('Delete Barber', barberId, true);
      return {
        success: true,
        message: 'Barber deleted successfully'
      };
    } catch (error) {
      this.logOperation('Delete Barber', barberId, false);
      return this.handleError(error);
    }
  }

  async getPendingAffiliations(barbershopId: string): Promise<ServiceResponse> {
    try {
      let barbersCollection = collection(this.db, this.COLLECTION);
      let q = query(
        barbersCollection,
        where('affiliatedBarbershopId', '==', barbershopId),
        where('affiliationStatus', '==', 'pending')
      );
      let barberSnapshot = await getDocs(q);

      let barbers = barberSnapshot.docs.map(doc => {
        let data = doc.data() as Omit<Barber, 'barberId'>;
        return { ...data, barberId: doc.id };
      });

      return {
        success: true,
        message: 'Pending affiliations retrieved successfully',
        data: barbers
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateAffiliationStatus(barberId: string, status: 'approved' | 'rejected'): Promise<ServiceResponse> {
    try {
      let barberDoc = doc(this.db, this.COLLECTION, barberId);
      await updateDoc(barberDoc, { affiliationStatus: status });

      this.logOperation('Update Affiliation Status', barberId, true);
      return {
        success: true,
        message: `Affiliation ${status} successfully`
      };
    } catch (error) {
      this.logOperation('Update Affiliation Status', barberId, false);
      return this.handleError(error);
    }
  }

  subscribeToPendingAffiliations(
    barbershopId: string,
    onUpdate: (barbers: Barber[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    let barbersCollection = collection(this.db, this.COLLECTION);
    let q = query(
      barbersCollection,
      where('affiliatedBarbershopId', '==', barbershopId),
      where('affiliationStatus', '==', 'pending')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        let barbers = snapshot.docs.map(doc => {
          let data = doc.data() as Omit<Barber, 'barberId'>;
          return { ...data, barberId: doc.id };
        });
        onUpdate(barbers);
      },
      (error) => {
        console.error('Error in pending affiliations listener:', error);
        if (onError) onError(error as Error);
      }
    );
  }
}

