
import type { Booking } from '../../../types/appointments';
import type { ServiceResponse } from '../../../types/api';
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

export class AppointmentService {
  private readonly COLLECTION = 'bookings';

  constructor(private db: Firestore) {}

  private handleError(error: unknown): ServiceResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Appointment error:', errorMessage);
    return {
      success: false,
      message: 'Operation failed',
      error: errorMessage
    };
  }

  async getBookingsByBarbershop(barbershopId: string): Promise<ServiceResponse> {
    try {
      const bookingsQuery = query(
        collection(this.db, this.COLLECTION),
        where('barbershopId', '==', barbershopId),
      );
      const snapshot = await getDocs(bookingsQuery);

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
      const updateData: Partial<Booking> = { status: status as Booking['status'] };

      if (reason && status === 'cancelled') {
        updateData.barberReason = reason;
      }

      if (status === 'confirmed') {
        updateData.confirmedAt = Date.now().toString();
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
