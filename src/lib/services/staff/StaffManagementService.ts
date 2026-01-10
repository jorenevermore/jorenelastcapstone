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

  constructor(private db: Firestore) {}

  private mapDocToBarber(docSnap: QueryDocumentSnapshot<DocumentData>): Barber {
    const data = docSnap.data() as Omit<Barber, 'barberId'>;
    return { ...data, barberId: docSnap.id };
  }

  async getAffiliatedBarbersByBarbershopId(barbershopId: string): Promise<Barber[]> {
    const colRef = collection(this.db, this.COLLECTION);
    const q = query(colRef, where('affiliatedBarbershopId', '==', barbershopId));
    const snap = await getDocs(q);
    return snap.docs.map(d => this.mapDocToBarber(d));
  }

  async getBarberById(barberId: string): Promise<Barber> {
    const ref = doc(this.db, this.COLLECTION, barberId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      throw new Error('Barber not found');
    }

    const data = snap.data() as Omit<Barber, 'barberId'>;
    return { ...data, barberId: snap.id };
  }

  async addBarberToBarbershop(
    barbershopId: string,
    barberData: Omit<Barber, 'barberId'>
  ): Promise<Barber> {
    const payload = {
      ...barberData,
      affiliatedBarbershopId: barberData.affiliatedBarbershopId ?? barbershopId,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(this.db, this.COLLECTION), payload);

    await updateDoc(docRef, { barberId: docRef.id });

    await updateDoc(doc(this.db, 'barbershops', barbershopId), {
      barbers: arrayUnion(docRef.id)
    });

    return { ...payload, barberId: docRef.id } as Barber;
  }

  async removeBarberFromBarbershop(barbershopId: string, barberId: string): Promise<void> {
    await updateDoc(doc(this.db, 'barbershops', barbershopId), {
      barbers: arrayRemove(barberId)
    });

    await updateDoc(doc(this.db, this.COLLECTION, barberId), {
      affiliationStatus: 'declined'
    });
  }

  async updateBarber(barberId: string, barberData: Partial<Omit<Barber, 'barberId'>>): Promise<void> {
    await updateDoc(doc(this.db, this.COLLECTION, barberId), barberData);
  }

  async deleteBarber(barberId: string): Promise<void> {
    const ref = doc(this.db, this.COLLECTION, barberId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      throw new Error('Barber not found');
    }

    const barberData = snap.data() as Barber;

    await deleteDoc(ref);

    if (barberData.affiliatedBarbershopId) {
      await updateDoc(doc(this.db, 'barbershops', barberData.affiliatedBarbershopId), {
        barbers: arrayRemove(barberId)
      });
    }
  }

  async getPendingAffiliations(barbershopId: string): Promise<Barber[]> {
    const colRef = collection(this.db, this.COLLECTION);
    const q = query(
      colRef,
      where('affiliatedBarbershopId', '==', barbershopId),
      where('affiliationStatus', '==', 'pending')
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => this.mapDocToBarber(d));
  }

  async updateAffiliationStatus(barberId: string, status: 'approved' | 'rejected'): Promise<void> {
    const ref = doc(this.db, this.COLLECTION, barberId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      throw new Error('Barber not found');
    }

    const barberData = snap.data() as Barber;
    const affiliationStatus = status === 'approved' ? 'confirmed' : 'declined';

    await updateDoc(ref, { affiliationStatus });

    if (barberData.affiliatedBarbershopId) {
      const shopRef = doc(this.db, 'barbershops', barberData.affiliatedBarbershopId);
      const op = status === 'approved' ? arrayUnion(barberId) : arrayRemove(barberId);
      await updateDoc(shopRef, { barbers: op });
    }
  }

  subscribeToPendingAffiliations(
    barbershopId: string,
    onUpdate: (barbers: Barber[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const colRef = collection(this.db, this.COLLECTION);
    const q = query(
      colRef,
      where('affiliatedBarbershopId', '==', barbershopId),
      where('affiliationStatus', '==', 'pending')
    );

    return onSnapshot(
      q,
      (snap) => onUpdate(snap.docs.map(d => this.mapDocToBarber(d))),
      (err) => onError?.(err as Error)
    );
  }
}
