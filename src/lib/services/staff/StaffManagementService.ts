import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  type Unsubscribe,
  type Firestore,
  arrayUnion,
  arrayRemove,
  type QueryDocumentSnapshot,
  type DocumentData
} from 'firebase/firestore';

import type { Barber } from '../../../types/barber';

export class StaffManagementService {

  private readonly COLLECTION = 'barbersprofile';

  constructor(private readonly db: Firestore) {}

  private mapDocToBarber(docSnapshot: QueryDocumentSnapshot<DocumentData>): Barber {

    const barberData = docSnapshot.data() as Omit<Barber, 'barberId'>;

    return { ...barberData, barberId: docSnapshot.id };    
  }

    async getBarbersFromBarbershop(barbershopId: string): Promise<Barber[]> {

    const barbershopRef = doc(this.db, 'barbershops', barbershopId);
    const barbershopSnap = await getDoc(barbershopRef);

    if (!barbershopSnap.exists()) {
      throw new Error('Barbershop not found');
    }

    const { barbers = [] } = barbershopSnap.data() as { barbers?: string[] };

      if (barbers.length === 0) return [];
      return Promise.all(barbers.map(barberId => this.getBarberById(barberId)));
  }


  async getBarberById(barberId: string): Promise<Barber> {

    const barberRef = doc(this.db, this.COLLECTION, barberId);
    const documentSnap = await getDoc(barberRef);

    if (!documentSnap.exists){
      throw new Error('Barber not found');
    }

    const barberData = documentSnap.data() as Omit<Barber, 'barberId'>;
    return { ...barberData, barberId: documentSnap.id };
  }

  async addBarberToBarbershop(barbershopId: string,barberData: Omit<Barber, 'barberId'>): Promise<Barber> {
    
    const newBarberData = {
      ...barberData,
      affiliatedBarbershopId: barberData.affiliatedBarbershopId ?? barbershopId,
      createdAt: new Date().toISOString()
    };

    const newBarberRef = await addDoc(
      collection(this.db, this.COLLECTION),
      newBarberData
    );

    await updateDoc(newBarberRef, { barberId: newBarberRef.id });

    const barbershopRef = doc(this.db, 'barbershops', barbershopId);
    await updateDoc(barbershopRef, { barbers: arrayUnion(newBarberRef.id) });

    return { ...newBarberData, barberId: newBarberRef.id } as Barber;
  }

  async removeBarberFromBarbershop(barbershopId: string,barberId: string): Promise<void> {

    const barbershopRef = doc(this.db, 'barbershops', barbershopId);
    await updateDoc(barbershopRef, { barbers: arrayRemove(barberId) });

    const barberRef = doc(this.db, this.COLLECTION, barberId);
    await updateDoc(barberRef, { affiliationStatus: 'declined' });
  }

  async updateBarber(barberId: string,updates: Partial<Omit<Barber, 'barberId'>>): Promise<void> {

    const barberRef = doc(this.db, this.COLLECTION, barberId);
    await updateDoc(barberRef, updates);
  }

  async deleteBarber(barberId: string): Promise<void> {

    const barberRef = doc(this.db, this.COLLECTION, barberId);
    const documentSnap = await getDoc(barberRef);

    if (!documentSnap.exists()) {
      throw new Error('Barber not found');
    }

    const barberData = documentSnap.data() as Barber;

    await deleteDoc(barberRef);

    if (barberData.affiliatedBarbershopId) {
      const barbershopRef = doc(
        this.db,
        'barbershops',
        barberData.affiliatedBarbershopId
      );

      await updateDoc(barbershopRef, { barbers: arrayRemove(barberId) });
    }
  }

  async getPendingAffiliations(barbershopId: string): Promise<Barber[]> {
    const collectionRef = collection(this.db, this.COLLECTION);

    const pendingQuery = query(
      collectionRef,
      where('affiliatedBarbershopId', '==', barbershopId),
      where('affiliationStatus', '==', 'pending')
    );

    const querySnapshot = await getDocs(pendingQuery);
    return querySnapshot.docs.map(d => this.mapDocToBarber(d));
  }

  async updateAffiliationStatus(barberId: string,status: 'approved' | 'rejected'): Promise<void> {
    
    const barberRef = doc(this.db, this.COLLECTION, barberId);
    const documentSnap = await getDoc(barberRef);

    if (!documentSnap.exists()) {
      throw new Error('Barber not found');
    }

    const barberData = documentSnap.data() as Barber;
    const affiliationStatus = status === 'approved' ? 'confirmed' : 'declined';

    await updateDoc(barberRef, { affiliationStatus });

    if (barberData.affiliatedBarbershopId) {
      const barbershopRef = doc(
        this.db,
        'barbershops',
        barberData.affiliatedBarbershopId
      );

      const barbersUpdateOperation =
        status === 'approved' ? arrayUnion(barberId) : arrayRemove(barberId);

      await updateDoc(barbershopRef, { barbers: barbersUpdateOperation });
    }
  }

  subscribeToPendingAffiliations(barbershopId: string, onUpdate: (barbers: Barber[]) => void, onError?: (error: Error) => void
  ): Unsubscribe {

    const collectionRef = collection(this.db, this.COLLECTION);

    const pendingQuery = query(
      collectionRef,
      where('affiliatedBarbershopId', '==', barbershopId),
      where('affiliationStatus', '==', 'pending')
    );

    return onSnapshot(
      pendingQuery,
      snapshot => onUpdate(snapshot.docs.map(d => this.mapDocToBarber(d))),
      error => onError?.(error as Error)
    );
  }
}
