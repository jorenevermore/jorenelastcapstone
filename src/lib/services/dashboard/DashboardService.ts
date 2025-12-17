import type { Booking } from '../../../types/appointments';
import type { DashboardData } from '../../../types/analytics';
import { QueueService } from '../queue/QueueService';

export class DashboardService {
  private static queueService = new QueueService();


  static processDashboardData(bookingsData: Booking[]): DashboardData {
    const bookingsWithQueue = this.queueService.addQueuePositions(bookingsData);
    const todayStr = new Date().toISOString().split('T')[0];

    const todayAppointments = this.queueService.sortByQueuePriority(
      bookingsWithQueue.filter(booking => booking.date.split('T')[0] === todayStr)
    );

    const upcomingAppointments = this.queueService.sortByQueuePriority(
      bookingsWithQueue.filter(booking => {
        const isTerminalStatus = ['completed', 'cancelled', 'declined', 'no-show'].includes(booking.status);
        return booking.date.split('T')[0] >= todayStr && !isTerminalStatus;
      })
    ).slice(0, 5);

    const recentActivity = bookingsWithQueue
      .sort((firstBooking, secondBooking) => (parseInt(secondBooking.createdAt || '0') || 0) - (parseInt(firstBooking.createdAt || '0') || 0))
      .slice(0, 5);

    return {
      allBookings: bookingsWithQueue as Booking[],
      upcomingAppointments: upcomingAppointments as Booking[],
      recentActivity: recentActivity as Booking[],
      todayAppointments: todayAppointments as Booking[]
    };
  }
}

