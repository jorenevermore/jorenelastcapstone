
import {
  BaseAppointmentService,
  Booking,
  ServiceResponse,
} from './BaseAppointmentService';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
  Firestore,
} from 'firebase/firestore';

export class AppointmentService extends BaseAppointmentService {
  private readonly COLLECTION = 'bookings';

  constructor(private db: Firestore) {
    super();
  }

  async getBookingsByBarbershop(barbershopId: string): Promise<ServiceResponse> {
    try {
      const bookingsCollection = collection(this.db, this.COLLECTION);
      const q = query(
        bookingsCollection,
        where('barbershopId', '==', barbershopId),
      );
      const snapshot = await getDocs(q);

      const bookings = snapshot.docs.map((docSnap) => ({
        ...docSnap.data(),
        id: docSnap.id,
      })) as Booking[];

      this.logOperation('Get Bookings', barbershopId, true);
      return {
        success: true,
        message: 'Bookings retrieved successfully',
        data: bookings,
      };
    } catch (error) {
      this.logOperation('Get Bookings', barbershopId, false);
      return this.handleError(error);
    }
  }

  subscribeToBookings(
    barbershopId: string,
    callback: (bookings: Booking[]) => void,
  ): Unsubscribe {
    const bookingsCollection = collection(this.db, this.COLLECTION);
    const q = query(
      bookingsCollection,
      where('barbershopId', '==', barbershopId),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        // get all bookings from the current snapshot (not tracking changes)
        const bookings = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Booking[];

        callback(bookings);
      },
      (error) => {
        console.error('AppointmentService - snapshot error:', error);
      },
    );
  }

  async updateBookingStatus(
    bookingId: string,
    status: string,
    reason?: string,
  ): Promise<ServiceResponse> {
    try {
      const statusValidation = this.validateStatus(status);
      if (!statusValidation.success) return statusValidation;

      const bookingRef = doc(this.db, this.COLLECTION, bookingId);
      const updateData: any = { status };

      if (reason && status === 'cancelled') {
        updateData.barberReason = reason;
      }

      await updateDoc(bookingRef, updateData);
      this.logOperation('Update Status', bookingId, true);

      return {
        success: true,
        message: 'Booking status updated successfully',
      };
    } catch (error) {
      this.logOperation('Update Status', bookingId, false);
      return this.handleError(error);
    }
  }

  async deleteBooking(bookingId: string): Promise<ServiceResponse> {
    try {
      const bookingRef = doc(this.db, this.COLLECTION, bookingId);
      await deleteDoc(bookingRef);
      this.logOperation('Delete Booking', bookingId, true);

      return {
        success: true,
        message: 'Booking deleted successfully',
      };
    } catch (error) {
      this.logOperation('Delete Booking', bookingId, false);
      return this.handleError(error);
    }
  }
}
