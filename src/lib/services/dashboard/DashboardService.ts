import type { Booking } from '../../../types/appointments';
import type { DashboardData } from '../../../types/analytics';
import { QueueService } from '../queue/QueueService';
import { getTodayISO, getDateISO } from '../../utils/dateParser';

const OK_NA = ['completed',
  'cancelled',
  'declined',
  'no-show'];

export class DashboardService {

  private static queueService = new QueueService();


  static processDashboardData(bookings: Booking[]): DashboardData {
    const bookingsWithQueuePositions = this.queueService.addQueuePositions(bookings);
    const todayISO = getTodayISO();

    const todayAppointments = this.queueService.sortByQueuePriority(
      bookingsWithQueuePositions
    );

    const upcomingAppointments = bookingsWithQueuePositions
      .filter(booking => {
        const isTerminalStatus = OK_NA.includes(booking.status);
        const bookingDateISO = getDateISO(booking.date);

        return bookingDateISO >= todayISO && !isTerminalStatus;
      })
      .sort((bookingA, bookingB) => {
        const dateDifference =
          new Date(bookingA.date).getTime() - new Date(bookingB.date).getTime();
        if (dateDifference !== 0) return dateDifference;

        const timeDifference =
          parseInt(bookingA.time) - parseInt(bookingB.time);
        return timeDifference;
      })
      .slice(0, 5);

    const recentActivity = bookingsWithQueuePositions
      .sort((bookingA, bookingB) => {
        const createdAtB = parseInt(bookingB.createdAt || '0') || 0;
        const createdAtA = parseInt(bookingA.createdAt || '0') || 0;
        return createdAtB - createdAtA;
      })
      .slice(0, 5);

    return {
      allBookings: bookingsWithQueuePositions as Booking[],
      upcomingAppointments: upcomingAppointments as Booking[],
      recentActivity: recentActivity as Booking[],
      todayAppointments: todayAppointments as Booking[]
    };
  }
}
