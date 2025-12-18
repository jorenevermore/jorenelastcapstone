
import { collection, getDocs, query, where, doc, getDoc, addDoc, updateDoc, deleteDoc, onSnapshot, Unsubscribe, Firestore, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { Barber } from '../../../types/barber';
import type { ServiceResponse } from '../../../types/response';

export class StaffManagementService {
  private readonly COLLECTION = 'barbersprofile';

  constructor(private db: Firestore) {}

  private mapDocToBarber(doc: any): Barber {
    const data = doc.data() as Omit<Barber, 'barberId'>;
    return { ...data, barberId: doc.id };
  }

  async getBarbersByBarbershopId(barbershopId: string): Promise<ServiceResponse> {
    try {
      const barbersCollection = collection(this.db, this.COLLECTION);
      const barbersQuery = query(
        barbersCollection,
        where('affiliatedBarbershopId', '==', barbershopId)
      );
      const barberSnapshot = await getDocs(barbersQuery);

      const barbers = barberSnapshot.docs.map(doc => this.mapDocToBarber(doc));

      return {
        success: true,
        message: 'Barbers retrieved successfully',
        data: barbers
      };
    } catch (error) {
      console.error('Staff service error:', error);
      return {
        success: false,
        message: 'Operation failed'
      };
    }
  }

  async getBarberById(barberId: string): Promise<ServiceResponse> {
    try {
      const barberDoc = doc(this.db, this.COLLECTION, barberId);
      const barberSnapshot = await getDoc(barberDoc);

      if (!barberSnapshot.exists()) {
        return {
          success: false,
          message: 'Barber not found'
        };
      }

      const data = barberSnapshot.data() as Barber;
      return {
        success: true,
        message: 'Barber retrieved successfully',
        data: { ...data, barberId: barberSnapshot.id }
      };
    } catch (error) {
      console.error('Staff service error:', error);
      return {
        success: false,
        message: 'Operation failed'
      };
    }
  }

  async addBarberToBarbershop(barbershopId: string, barberData: Omit<Barber, 'barberId'>): Promise<ServiceResponse> {
    try {
      const barbersCollection = collection(this.db, this.COLLECTION);
      const barberWithTimestamp = {
        ...barberData,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(barbersCollection, barberWithTimestamp);
      await updateDoc(docRef, { barberId: docRef.id });

      const barbershopDoc = doc(this.db, 'barbershops', barbershopId);
      await updateDoc(barbershopDoc, {
        barbers: arrayUnion(docRef.id)
      });

      return {
        success: true,
        message: 'Barber added to barbershop successfully',
        data: { ...barberWithTimestamp, barberId: docRef.id }
      };
    } catch (error) {
      console.error('Staff service error:', error);
      return {
        success: false,
        message: 'Operation failed'
      };
    }
  }

  async removeBarberFromBarbershop(barbershopId: string, barberId: string): Promise<ServiceResponse> {
    try {
      const barbershopDoc = doc(this.db, 'barbershops', barbershopId);
      await updateDoc(barbershopDoc, {
        barbers: arrayRemove(barberId)
      });

      const barberDoc = doc(this.db, this.COLLECTION, barberId);
      await updateDoc(barberDoc, {
        affiliationStatus: 'declined'
      });

      return {
        success: true,
        message: 'Barber removed from barbershop successfully'
      };
    } catch (error) {
      console.error('Staff service error:', error);
      return {
        success: false,
        message: 'Operation failed'
      };
    }
  }

  async updateBarber(barberId: string, barberData: Partial<Omit<Barber, 'barberId'>>): Promise<ServiceResponse> {
    try {
      const barberDoc = doc(this.db, this.COLLECTION, barberId);
      await updateDoc(barberDoc, barberData);

      return {
        success: true,
        message: 'Barber updated successfully'
      };
    } catch (error) {
      console.error('Staff service error:', error);
      return {
        success: false,
        message: 'Operation failed'
      };
    }
  }

  async deleteBarber(barberId: string): Promise<ServiceResponse> {
    try {
      const barberDoc = doc(this.db, this.COLLECTION, barberId);
      const barberSnapshot = await getDoc(barberDoc);

      if (!barberSnapshot.exists()) {
        return {
          success: false,
          message: 'Barber not found'
        };
      }

      const barberData = barberSnapshot.data() as Barber;

      await deleteDoc(barberDoc);

      if (barberData.affiliatedBarbershopId) {
        const barbershopDoc = doc(this.db, 'barbershops', barberData.affiliatedBarbershopId);
        await updateDoc(barbershopDoc, {
          barbers: arrayRemove(barberId)
        });
      }

      return {
        success: true,
        message: 'Barber deleted successfully'
      };
    } catch (error) {
      console.error('Staff service error:', error);
      return {
        success: false,
        message: 'Operation failed'
      };
    }
  }

  async getPendingAffiliations(barbershopId: string): Promise<ServiceResponse> {
    try {
      const barbersCollection = collection(this.db, this.COLLECTION);
      const pendingAffiliationsQuery = query(
        barbersCollection,
        where('affiliatedBarbershopId', '==', barbershopId),
        where('affiliationStatus', '==', 'pending')
      );
      const barberSnapshot = await getDocs(pendingAffiliationsQuery);

      const barbers = barberSnapshot.docs.map(doc => this.mapDocToBarber(doc));

      return {
        success: true,
        message: 'Pending affiliations retrieved successfully',
        data: barbers
      };
    } catch (error) {
      console.error('Staff service error:', error);
      return {
        success: false,
        message: 'Operation failed'
      };
    }
  }

  async updateAffiliationStatus(barberId: string, status: 'approved' | 'rejected'): Promise<ServiceResponse> {
    try {
      const barberDoc = doc(this.db, this.COLLECTION, barberId);
      const barberSnapshot = await getDoc(barberDoc);

      if (!barberSnapshot.exists()) {
        return {
          success: false,
          message: 'Barber not found'
        };
      }

      const barberData = barberSnapshot.data() as Barber;
      const affiliationStatus = status === 'approved' ? 'confirmed' : 'declined';

      await updateDoc(barberDoc, { affiliationStatus });

      if (barberData.affiliatedBarbershopId) {
        const barbershopDoc = doc(this.db, 'barbershops', barberData.affiliatedBarbershopId);
        const arrayOperation = status === 'approved' ? arrayUnion(barberId) : arrayRemove(barberId);
        await updateDoc(barbershopDoc, { barbers: arrayOperation });
      }

      return {
        success: true,
        message: `Affiliation ${status} successfully`
      };
    } catch (error) {
      console.error('Staff service error:', error);
      return {
        success: false,
        message: 'Operation failed'
      };
    }
  }

  subscribeToPendingAffiliations(barbershopId: string,onUpdate: (barbers: Barber[]) => void,
  onError?: (error: Error) => void
  ): Unsubscribe {
    const barbersCollection = collection(this.db, this.COLLECTION);
    const pendingAffiliationsQuery = query(
      barbersCollection,
      where('affiliatedBarbershopId', '==', barbershopId),
      where('affiliationStatus', '==', 'pending')
    );

    return onSnapshot(
      pendingAffiliationsQuery,
      (snapshot) => {
        const barbers = snapshot.docs.map(doc => this.mapDocToBarber(doc));
        onUpdate(barbers);
      },
      (error) => {
        console.error('Error in pending affiliations listener:', error);
        if (onError) onError(error as Error);
      }
    );
  }
}

