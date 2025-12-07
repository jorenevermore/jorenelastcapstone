/**
 * Analytics Service
 * Handles analytics data retrieval and calculations
 */

import type { Booking } from '../../../app/dashboard/appointments/types';
import { collection, query, where, getDocs, Firestore } from 'firebase/firestore';

export interface ServiceResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class AnalyticsService {
  private readonly COLLECTION = 'bookings';

  constructor(private db: Firestore) {}

  async getBookingsByBarbershop(barbershopId: string): Promise<ServiceResponse> {
    try {
      const bookingsCollection = collection(this.db, this.COLLECTION);
      const q = query(bookingsCollection, where('barbershopId', '==', barbershopId));
      const snapshot = await getDocs(q);

      const bookings = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Booking[];

      return {
        success: true,
        message: 'Bookings retrieved successfully',
        data: bookings
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  calculateStats(bookings: Booking[]) {
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const inProgress = bookings.filter(b => b.status === 'in-progress').length;
    const declined = bookings.filter(b => b.status === 'declined').length;
    const noShow = bookings.filter(b => b.status === 'no-show').length;

    const total = bookings.length;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(2) : '0';
    const cancellationRate = total > 0 ? ((cancelled / total) * 100).toFixed(2) : '0';

    return {
      completed,
      cancelled,
      pending,
      confirmed,
      inProgress,
      declined,
      noShow,
      total,
      completionRate,
      cancellationRate
    };
  }

  calculateRevenue(bookings: Booking[]) {
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.finalPrice || b.totalPrice || 0), 0);
    const averageRevenue = completedBookings.length > 0 ? (totalRevenue / completedBookings.length).toFixed(2) : '0';

    return {
      totalRevenue,
      averageRevenue,
      completedCount: completedBookings.length
    };
  }

  private handleError(error: unknown): ServiceResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Analytics error:', errorMessage);
    return {
      success: false,
      message: 'Operation failed',
      error: errorMessage
    };
  }
}

