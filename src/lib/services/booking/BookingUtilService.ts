
import type { Booking } from '../../../types/appointments';
import {
  formatDateLong,
  formatDateShort,
  getSessionLabel,
  isPastDue,
  filterBookingsByDateCategory,
  filterBookingsByDate,
  countBookingsByDateCategory,
  getTodayISO,
  getDateISO
} from '../../utils/dateParser';

export class BookingUtilService {

  static getSessionType(time: string): string {
    return getSessionLabel(time);
  }

  static isPastDue(booking: Booking): boolean {
    return isPastDue(booking);
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
    return formatDateShort(date);
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
    return formatDateLong(dateStr);
  }

  static filterBookingsByDateCategory(
    bookings: Booking[],
    category: 'today' | 'upcoming' | 'all' | 'past'
  ): Booking[] {
    return filterBookingsByDateCategory(bookings, category);
  }

  static filterBookingsByDate(bookings: Booking[], date: Date): Booking[] {
    return filterBookingsByDate(bookings, date);
  }

  static countBookingsByDateCategory(bookings: Booking[]): { todayCount: number; pastCount: number; upcomingCount: number } {
    return countBookingsByDateCategory(bookings);
  }

  static calculateCompletionRate(completed: number, total: number): number {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  static getBookingStatistics(bookings: Booking[]): {
    pending: number;
    confirmed: number;
    inProgress: number;
    canceled: number;
    completed: number;
    noShow: number;
    total: number;
    todayTotal: number;
  } {
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const inProgress = bookings.filter(b => b.status === 'in-progress').length;
    const canceled = bookings.filter(b => b.status === 'cancelled').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const noShow = bookings.filter(b => b.status === 'no-show').length;
    const total = bookings.length;

    const today = new Date().toDateString();
    const todayTotal = bookings.filter(b => new Date(b.date).toDateString() === today).length;

    return {
      pending,
      confirmed,
      inProgress,
      canceled,
      completed,
      noShow,
      total,
      todayTotal
    };
  }

  static filterBookingsByStatus(bookings: Booking[], status: 'all' | 'pending' | 'ongoing' | 'completed'): Booking[] {
    switch (status) {
      case 'pending':
        return bookings.filter(b => b.status === 'pending');
      case 'ongoing':
        return bookings.filter(b => ['confirmed', 'in-progress'].includes(b.status));
      case 'completed':
        return bookings.filter(b => ['completed', 'completedAndReviewed', 'cancelled', 'declined', 'no-show'].includes(b.status));
      default:
        return bookings;
    }
  }

  static filterBookingsByDateFilter(bookings: Booking[], dateFilter: string): Booking[] {
    const todayISO = getTodayISO();

    return bookings.filter(booking => {
      const bookingDateISO = getDateISO(booking.date);

      switch (dateFilter) {
        case 'all':
          return true;
        case 'today':
          return bookingDateISO === todayISO;
        case 'upcoming':
          return bookingDateISO > todayISO;
        default:
          return bookingDateISO >= todayISO;
      }
    });
  }

  static getStatusCounts(bookings: Booking[]): { pendingCount: number; ongoingCount: number; completedCount: number } {
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    const ongoingCount = bookings.filter(b => ['confirmed', 'in-progress'].includes(b.status)).length;
    const completedCount = bookings.filter(b => ['completed', 'cancelled', 'declined', 'no-show'].includes(b.status)).length;

    return { pendingCount, ongoingCount, completedCount };
  }
}

