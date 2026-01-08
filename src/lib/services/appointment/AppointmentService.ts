import type { Booking } from '../../../types/appointments';
import type { ServiceResponse } from '../../../types/response';
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

  async getBookingsByBarbershop(barbershopId: string): Promise<ServiceResponse> {
    
    try {
      const bookingsQuery = query(
        collection(this.db, this.COLLECTION),
        where('barbershopId', '==', barbershopId),
      );

      const snapshot = await getDocs(bookingsQuery);

      const bookingsFromBarbershop = snapshot.docs.map((bookingsDoc) => ({
        ...bookingsDoc.data(),
        id: bookingsDoc.id,
      })) as Booking[];

      return {
        success: true,
        message: 'Bookings retrieved successfully',
        data: bookingsFromBarbershop,
      };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return { success: false, message: 'Failed to fetch bookings' };
    }
  }

  async updateBookingStatus(bookingId: string,status: Booking['status'],reason?: string,): Promise<ServiceResponse> {
    try {
      const updateData: Partial<Booking> = { status };

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
      console.error('Error updating booking status:', error);
      return { success: false, message: 'Failed to update booking status' };
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
      console.error('Error deleting booking:', error);
      return { success: false, message: 'Failed to delete booking' };
    }
  }
}
