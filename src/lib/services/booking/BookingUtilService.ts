
import type { Booking } from '../../../types/appointments';

export class BookingUtilService {
 
  static getSessionType(time: string): string {
    const startTime = time?.split('-')[0]?.trim() || '';
    const hour = parseInt(startTime.split(':')[0]);
    return hour < 13 ? 'Morning Session' : 'Afternoon Session';
  }
  
  static isPastDue(booking: Booking): boolean {
    const bookingDate = booking.date.split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const isBookingInPast = bookingDate < today;

    return (
      isBookingInPast &&
      booking.status !== 'completed' &&
      booking.status !== 'cancelled' &&
      booking.status !== 'declined' &&
      booking.status !== 'no-show'
    );
  }

  static getStatusBadgeStyle(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'no-show':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }

  static getStatusIconStyle(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  static getStatusIcon(status: string): string {
    switch (status) {
      case 'pending':
        return 'fas fa-clock';
      case 'confirmed':
        return 'fas fa-check-circle';
      case 'in-progress':
        return 'fas fa-spinner fa-spin';
      case 'completed':
        return 'fas fa-check-double';
      case 'cancelled':
        return 'fas fa-times-circle';
      case 'no-show':
        return 'fas fa-user-slash';
      default:
        return 'fas fa-question-circle';
    }
  }

  static formatBookingDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
  
  static getFormattedStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  }

  static getCancellationInfo(booking: any): { reason: string; timestamp: string } | null {
    if (booking.status !== 'cancelled') {
      return null;
    }

    const reason = booking.barberReason || booking.reason || 'No reason provided';
    const timestamp = new Date().toLocaleString();

    return { reason, timestamp };
  }

  static formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  private static toISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static filterBookingsByDateCategory(
    bookings: Booking[],
    category: 'today' | 'upcoming' | 'all' | 'past'
  ): Booking[] {
    const todayISO = this.toISO(new Date());

    switch (category) {
      case 'today':
        return bookings.filter(booking => booking.date.split('T')[0] === todayISO);
      case 'upcoming':
        return bookings.filter(booking => booking.date.split('T')[0] > todayISO);
      case 'past':
        return bookings.filter(booking => booking.date.split('T')[0] < todayISO);
      case 'all':
      default:
        return bookings;
    }
  }

  static filterBookingsByDate(bookings: Booking[], date: Date): Booking[] {
    const dateISO = this.toISO(date);
    return bookings.filter(booking => booking.date.split('T')[0] === dateISO);
  }

  static countBookingsByDateCategory(bookings: Booking[]): { todayCount: number; pastCount: number; upcomingCount: number } {
    const todayISO = this.toISO(new Date());

    const todayCount = bookings.filter(booking => booking.date.split('T')[0] === todayISO).length;
    const pastCount = bookings.filter(booking => booking.date.split('T')[0] < todayISO).length;
    const upcomingCount = bookings.filter(booking => booking.date.split('T')[0] > todayISO).length;

    return { todayCount, pastCount, upcomingCount };
  }

  static calculateCompletionRate(completed: number, total: number): number {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }
}

