
import {
  BaseAppointmentService,
  ServiceResponse,
} from './BaseAppointmentService';
import type { Booking } from '../../../app/dashboard/appointments/types';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';

export class AppointmentService extends BaseAppointmentService {
  private readonly COLLECTION = 'bookings';

  constructor(private db: Firestore) {
    super();
  }

  async getBookingsByBarbershop(barbershopId: string): Promise<ServiceResponse> {
    try {
      const q = query(
        collection(this.db, this.COLLECTION),
        where('barbershopId', '==', barbershopId),
      );
      const snapshot = await getDocs(q);

      const bookings = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Booking[];

      return {
        success: true,
        message: 'Bookings retrieved successfully',
        data: bookings,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateBookingStatus(
    bookingId: string,
    status: string,
    reason?: string,
  ): Promise<ServiceResponse> {
    try {
      const statusValidation = this.validateStatus(status);
      if (!statusValidation.success) return statusValidation;

      const updateData: any = { status };
      if (reason && status === 'cancelled') {
        updateData.barberReason = reason;
      }

      await updateDoc(doc(this.db, this.COLLECTION, bookingId), updateData);

      return {
        success: true,
        message: 'Booking status updated successfully',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteBooking(bookingId: string): Promise<ServiceResponse> {
    try {
      await deleteDoc(doc(this.db, this.COLLECTION, bookingId));

      return {
        success: true,
        message: 'Booking deleted successfully',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}
