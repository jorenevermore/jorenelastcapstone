import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  Firestore,
  updateDoc
} from 'firebase/firestore';
import type { ServiceResponse, UnavailableDate } from '../../../types';

export class BarberAvailabilityService {
  private readonly COLLECTION = 'barbers_unvailable_dates';

  constructor(private db: Firestore) {}

  async addUnavailableDate(barberId: string, date: string): Promise<ServiceResponse> {
    try {
      const docRef = await addDoc(collection(this.db, this.COLLECTION), {
        barberId,
        date,
        fromBarber: false
      });

      await updateDoc(docRef, { id: docRef.id });

      return {
        success: true,
        message: 'Unavailable date added successfully',
        data: { id: docRef.id, barberId, date, fromBarber: false }
      };
    } catch (error) {
      console.error('Barber availability service error:', error);
      return {
        success: false,
        message: 'Failed to add unavailable date'
      };
    }
  }

  async getUnavailableDates(barberId: string): Promise<ServiceResponse> {
    try {
      const unavailableDatesCollection = collection(this.db, this.COLLECTION);
      const unavailableDatesQuery = query(
        unavailableDatesCollection,
        where('barberId', '==', barberId),
        where('fromBarber', '==', false)
      );
      const snapshot = await getDocs(unavailableDatesQuery);

      const unavailableDates: UnavailableDate[] = snapshot.docs.map(doc => ({
        id: doc.id,
        barberId: doc.data().barberId,
        date: doc.data().date,
        fromBarber: doc.data().fromBarber
      })).sort((dateA, dateB) => new Date(dateA.date).getTime() - new Date(dateB.date).getTime());

      return { 
        success: true,
        message: 'Unavailable dates retrieved successfully',
        data: unavailableDates
      };
    } catch (error) {
      console.error('Barber availability service error:', error);
      return {
        success: false,
        message: 'Failed to retrieve unavailable dates'
      };
    }
  }

  async removeUnavailableDate(dateId: string): Promise<ServiceResponse> {
    try {
      const dateDoc = doc(this.db, this.COLLECTION, dateId);
      await deleteDoc(dateDoc);

      return {
        success: true,
        message: 'Unavailable date removed successfully'
      };
    } catch (error) {
      console.error('Barber availability service error:', error);
      return {
        success: false,
        message: 'Failed to remove unavailable date'
      };
    }
  }

  async isBarberUnavailable(barberId: string, date: string): Promise<boolean> {
    try {
      const unavailableDatesCollection = collection(this.db, this.COLLECTION);
      const unavailableDatesQuery = query(
        unavailableDatesCollection,
        where('barberId', '==', barberId),
        where('date', '==', date)
      );
      const snapshot = await getDocs(unavailableDatesQuery);

      return snapshot.size > 0;
    } catch (error) {
      console.error('Barber availability service error:', error);
      return false;
    }
  }
}

