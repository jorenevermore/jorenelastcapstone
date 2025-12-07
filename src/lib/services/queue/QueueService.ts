
import type { Booking } from '../../../app/dashboard/appointments/types';

export interface QueueStats {
  totalBookings: number;
  rushBookings: number;
  regularBookings: number;
}

export class QueueService {
  // get rush bookings only
  getRushBookings(bookings: Booking[]): Booking[] {
    return bookings.filter(b => b.isEmergency === true);
  }

  // get regular bookings only
  getRegularBookings(bookings: Booking[]): Booking[] {
    return bookings.filter(b => b.isEmergency !== true);
  }

  // get bookings still in queue (pending or confirmed, not being served)
  getActiveBookings(bookings: Booking[]): Booking[] {
    return bookings.filter(b =>
      !['completed', 'completedAndReviewed', 'cancelled', 'declined', 'no-show', 'in-progress'].includes(b.status)
    );
  }

  private getISODateString(dateStr: string): string {

    if (dateStr.includes('-') && dateStr.length === 10) {
      return dateStr;
    }
    // Otherwise parse and convert using local date (not UTC)
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // sort bookings by queue priority
  sortByQueuePriority(bookings: Booking[], todayOnly: boolean = false): Booking[] {
    const today = new Date();
    // Use local date calculation (not UTC) to match booking date format
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayISO = `${year}-${month}-${day}`;
    const filtered = todayOnly
      ? bookings.filter(b => this.getISODateString(b.date) === todayISO)
      : bookings;

    const sorted = filtered.sort((a, b) => {
      // sort by date first
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;

      // morning before afternoon (time is '9' or '1')
      const timeA = parseInt(a.time);
      const timeB = parseInt(b.time);
      const timeCompare = timeA - timeB;
      if (timeCompare !== 0) return timeCompare;

      // rush bookings first
      if (a.isEmergency && !b.isEmergency) return -1;
      if (!a.isEmergency && b.isEmergency) return 1;

      // sort by creation time
      const createdA = a.createdAt ? parseInt(a.createdAt) : 0;
      const createdB = b.createdAt ? parseInt(b.createdAt) : 0;
      return createdA - createdB;
    });

    // Add queue positions
    return sorted.map((booking, index) => {
      const bookingWithPosition = booking as any;
      bookingWithPosition.queuePosition = index + 1;
      return bookingWithPosition;
    });
  }

  addQueuePositions(bookings: Booking[]): Booking[] {
    return bookings.map((booking, index) => {
      const bookingWithPosition = booking as any;
      bookingWithPosition.queuePosition = index + 1;
      return bookingWithPosition;
    });
  }
  
  getQueueStats(bookings: Booking[], todayOnly: boolean = false): QueueStats {
    const today = new Date();
    // Use local date calculation (not UTC) to match booking date format
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayISO = `${year}-${month}-${day}`;

    let filtered = todayOnly
      ? bookings.filter(b => this.getISODateString(b.date) === todayISO)
      : bookings;

    // filter to only active bookings (pending and confirmed)
    filtered = this.getActiveBookings(filtered);

    const rushCount = filtered.filter(b => b.isEmergency).length;
    const totalCount = filtered.length;

    return {
      totalBookings: totalCount,
      rushBookings: rushCount,
      regularBookings: totalCount - rushCount
    };
  }

}

