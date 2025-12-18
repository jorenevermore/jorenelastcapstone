
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

const VALID_STATUSES = ['pending', 'confirmed', 'in-progress', 'completed', 'completedAndReviewed', 'cancelled', 'declined', 'no-show'] as const;

export class AppointmentService {
  private readonly COLLECTION = 'bookings';

  constructor(private db: Firestore) {}

  private validateBookingId(bookingId: string): boolean {
    return !!(bookingId && bookingId.trim().length > 0);
  }

  private validateBarbershopId(barbershopId: string): boolean {
    return !!(barbershopId && barbershopId.trim().length > 0);
  }

  private validateStatus(status: string): boolean {
    return VALID_STATUSES.includes(status as any);
  }

  async getBookingsByBarbershop(barbershopId: string): Promise<ServiceResponse> {
    try {
      if (!this.validateBarbershopId(barbershopId)) {
        return {
          success: false,
          message: 'Invalid barbershop ID provided'
        };
      }

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
      console.error('Error fetching bookings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bookings from database';
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  async updateBookingStatus(
    bookingId: string,
    status: Booking['status'],
    reason?: string,
  ): Promise<ServiceResponse> {
    try {
      if (!this.validateBookingId(bookingId)) {
        return {
          success: false,
          message: 'Invalid booking ID provided'
        };
      }

      if (!this.validateStatus(status)) {
        return {
          success: false,
          message: `Invalid status '${status}'. Must be one of: ${VALID_STATUSES.join(', ')}`
        };
      }

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
      const errorMessage = error instanceof Error ? error.message : 'Failed to update booking status';
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  async deleteBooking(bookingId: string): Promise<ServiceResponse> {
    try {
      if (!this.validateBookingId(bookingId)) {
        return {
          success: false,
          message: 'Invalid booking ID provided'
        };
      }

      await deleteDoc(doc(this.db, this.COLLECTION, bookingId));

      return {
        success: true,
        message: 'Booking deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting booking:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete booking';
      return {
        success: false,
        message: errorMessage
      };
    }
  }
}
