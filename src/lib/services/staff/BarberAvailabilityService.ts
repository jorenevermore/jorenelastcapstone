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

  constructor(private readonly db: Firestore) {}

  async addUnavailableDate(barberId: string,date: string): Promise<UnavailableDate> {

    const unavailableDateData: Omit<UnavailableDate, 'id'> = { barberId,date,fromBarber: false};

    const documentRef = await addDoc(
      collection(this.db, this.COLLECTION),
      unavailableDateData
    );

    return {
      id: documentRef.id,
      ...unavailableDateData
    };
  }

  async getUnavailableDates(barberId: string): Promise<UnavailableDate[]> {
    const collectionRef = collection(this.db, this.COLLECTION);

    const unavailableDatesQuery = query(
      collectionRef,
      where('barberId', '==', barberId),
      where('fromBarber', '==', false)
    );

    const querySnapshot = await getDocs(unavailableDatesQuery);

    const unavailableDates: UnavailableDate[] = querySnapshot.docs
      .map(docSnap => {
        const data = docSnap.data() as Omit<UnavailableDate, 'id'>;
        return { id: docSnap.id, ...data };
      })
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );

    return unavailableDates;
  }

  async removeUnavailableDate(unavailableDateId: string): Promise<void> {
    await deleteDoc(
      doc(this.db, this.COLLECTION, unavailableDateId)
    );
  }

  async isBarberUnavailable(
    barberId: string,
    date: string
  ): Promise<boolean> {
    const collectionRef = collection(this.db, this.COLLECTION);

    const unavailableDateQuery = query(
      collectionRef,
      where('barberId', '==', barberId),
      where('date', '==', date)
    );

    const querySnapshot = await getDocs(unavailableDateQuery);
    return !querySnapshot.empty;
  }
}
