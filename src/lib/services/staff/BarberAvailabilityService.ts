import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  setDoc,
  type Firestore
} from 'firebase/firestore';
import type { UnavailableDate } from '../../../types';

export class BarberAvailabilityService {
  private readonly COLLECTION = 'barbers_unvailable_dates';

  constructor(private readonly db: Firestore) {}

  async addUnavailableDate(barberId: string, date: string): Promise<UnavailableDate> {

    const docRef = doc(collection(this.db, this.COLLECTION));

    const unavailableDate: UnavailableDate = {
      id: docRef.id,
      barberId,
      date,
      fromBarber: false
    };

    await setDoc(docRef, unavailableDate);

    return unavailableDate;
  }

  async getUnavailableDates(barberId: string): Promise<UnavailableDate[]> {
    const unavailableDatesQuery = query(
      collection(this.db, this.COLLECTION),
      where('barberId', '==', barberId),
      where('fromBarber', '==', false),
      orderBy('date', 'asc')
    );

    const queryResult = await getDocs(unavailableDatesQuery);

  return queryResult.docs.map(document => document.data() as UnavailableDate);
  }


  async removeUnavailableDate(unavailableDateId: string): Promise<void> {
    await deleteDoc(doc(this.db, this.COLLECTION, unavailableDateId));
  }

  async isBarberUnavailable(barberId: string, date: string): Promise<boolean> {

    const unavailableDateQuery = query(
      collection(this.db, this.COLLECTION),
      where('barberId', '==', barberId),
      where('date', '==', date),
      where('fromBarber', '==', false)
    );

    const queryResult = await getDocs(unavailableDateQuery);
    return !queryResult.empty;
  }
}
