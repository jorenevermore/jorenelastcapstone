
import type { Booking } from '../../../types/appointments';
import type { QueueStats } from '../../../types/queue';

const INACTIVE_STATUS = [
  'completed',
  'completedAndReviewed',
  'cancelled',
  'declined',
  'no-show',
  'in-progress',
  'pending'
];

export class QueueService {

  getRushBookings(bookings: Booking[]): Booking[] {
    return bookings.filter(booking => booking.isEmergency === true);
  }

  getRegularBookings(bookings: Booking[]): Booking[] {
    return bookings.filter(booking => booking.isEmergency !== true);
  }

  getActiveBookings(bookings: Booking[]): Booking[] {
    return bookings.filter(booking => !INACTIVE_STATUS.includes(booking.status));
  }

  sortByQueuePriority(bookings: Booking[]): Booking[] {
    const sortedBookings = [...bookings].sort((bookingA, bookingB) => {

      const dateDifference = new Date(bookingA.date).getTime() - new Date(bookingB.date).getTime();
      if (dateDifference !== 0) return dateDifference;

      const timeDifference = parseInt(bookingA.time) - parseInt(bookingB.time);
      if (timeDifference !== 0) return timeDifference;

      if (bookingA.isEmergency !== bookingB.isEmergency) {
        return bookingA.isEmergency ? -1 : 1;
      }

      const createdTimeA = parseInt(bookingA.createdAt || '0'); 
      const createdTimeB = parseInt(bookingB.createdAt || '0'); 
      return createdTimeA - createdTimeB;
    });

    return sortedBookings.map((booking, index) => ({
      ...booking,
      queuePosition: index + 1
    }));
  }

  addQueuePositions(bookings: Booking[]): Booking[] {
    return bookings.map((booking, index) => ({
      ...booking,
      queuePosition: index + 1
    }));
  }

  getQueueStats(bookings: Booking[]): QueueStats {
    const activeBookings = this.getActiveBookings(bookings);
    const rushBookings = activeBookings.filter(booking => booking.isEmergency).length;

    return {
      totalBookings: activeBookings.length,
      rushBookings,
      regularBookings: activeBookings.length - rushBookings
    };
  }
}
