import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  type Firestore
} from 'firebase/firestore';
import type { UnavailableDate } from '../../../types';

export class BarberAvailabilityService {
  private readonly COLLECTION = 'barbers_unvailable_dates';

  constructor(private db: Firestore) {}

  async addUnavailableDate(barberId: string, date: string): Promise<UnavailableDate> {
    const payload: Omit<UnavailableDate, 'id'> = {
      barberId,
      date,
      fromBarber: false
    };

    const docRef = await addDoc(collection(this.db, this.COLLECTION), payload);

    return {
      id: docRef.id,
      ...payload
    };
  }

  async getUnavailableDates(barberId: string): Promise<UnavailableDate[]> {
    const colRef = collection(this.db, this.COLLECTION);
    const q = query(
      colRef,
      where('barberId', '==', barberId),
      where('fromBarber', '==', false)
    );

    const snap = await getDocs(q);

    const dates: UnavailableDate[] = snap.docs
      .map(d => {
        const data = d.data() as Omit<UnavailableDate, 'id'>;
        return { id: d.id, ...data };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return dates;
  }

  async removeUnavailableDate(dateId: string): Promise<void> {
    await deleteDoc(doc(this.db, this.COLLECTION, dateId));
  }

  async isBarberUnavailable(barberId: string, date: string): Promise<boolean> {
    const colRef = collection(this.db, this.COLLECTION);
    const q = query(
      colRef,
      where('barberId', '==', barberId),
      where('date', '==', date)
    );

    const snap = await getDocs(q);
    return !snap.empty;
  }
}
