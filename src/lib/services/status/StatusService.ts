
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'completedAndReviewed'
  | 'cancelled'
  | 'declined'
  | 'no-show';

export interface Booking {
  date: string;  
  status: BookingStatus;
}

const STATUS_COLORS: Readonly<Record<BookingStatus | 'default', string>> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  completedAndReviewed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  declined: 'bg-gray-100 text-gray-800',
  'no-show': 'bg-orange-100 text-orange-800',
  default: 'bg-gray-100 text-gray-800',
};

const STATUS_ICONS: Readonly<Record<BookingStatus | 'default', string>> = {
  pending: 'fas fa-clock',
  confirmed: 'fas fa-check-circle',
  'in-progress': 'fas fa-spinner',
  completed: 'fas fa-check-double',
  completedAndReviewed: 'fas fa-check-double',
  cancelled: 'fas fa-times-circle',
  declined: 'fas fa-ban',
  'no-show': 'fas fa-user-slash',
  default: 'fas fa-question-circle',
};

const FINAL_STATUSES: Readonly<BookingStatus[]> = [
  'completed',
  'cancelled',
  'declined',
  'no-show',
];

export class StatusService {
  private normalizeStatus(status: BookingStatus | string): BookingStatus | 'unknown' {
    if (status === 'completedAndReviewed') {
      return 'completed';
    }

    const validStatuses: BookingStatus[] = [
      'pending',
      'confirmed',
      'in-progress',
      'completed',
      'completedAndReviewed',
      'cancelled',
      'declined',
      'no-show',
    ];

    return validStatuses.includes(status as BookingStatus)
      ? (status as BookingStatus)
      : 'unknown';
  }

  private toStartOfDay(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  getStatusColor(status: BookingStatus | string): string {
    const normalized = this.normalizeStatus(status);

    if (normalized === 'unknown') {
      return STATUS_COLORS.default;
    }

    return STATUS_COLORS[normalized];
  }

  getStatusIcon(status: BookingStatus | string): string {
    const normalized = this.normalizeStatus(status);

    if (normalized === 'unknown') {
      return STATUS_ICONS.default;
    }

    return STATUS_ICONS[normalized];
  }

  getDateIndicator(dateString: string): { label: string; color: string } {
    const appointmentDateRaw = new Date(dateString);

    if (isNaN(appointmentDateRaw.getTime())) {
      return { label: 'Invalid date', color: 'bg-red-100 text-red-700' };
    }

    const appointmentDate = this.toStartOfDay(appointmentDateRaw);
    const today = this.toStartOfDay(new Date());

    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { label: 'Today', color: 'bg-blue-100 text-blue-700' };
    }

    if (diffDays === 1) {
      return { label: 'Tomorrow', color: 'bg-green-100 text-green-700' };
    }

    if (diffDays === -1) {
      return { label: 'Yesterday', color: 'bg-gray-100 text-gray-700' };
    }

    if (diffDays > 1) {
      return { label: `In ${diffDays} days`, color: 'bg-purple-100 text-purple-700' };
    }

    return { label: `${Math.abs(diffDays)} days ago`, color: 'bg-gray-100 text-gray-700' };
  }

  isPastDue(booking: Booking): boolean {
  const today = this.toStartOfDay(new Date());

  const bookingDateRaw =
    booking.date.length === 10 && booking.date.includes('-')
      ? new Date(`${booking.date}T00:00:00`)
      : new Date(booking.date);

  if (isNaN(bookingDateRaw.getTime())) {
    return false;
  }

  const bookingDate = this.toStartOfDay(bookingDateRaw);

  const isBookingInPast = bookingDate.getTime() < today.getTime();
  
  const normalizedStatus = this.normalizeStatus(booking.status);
  const isNotCompleted = !FINAL_STATUSES.includes(normalizedStatus as BookingStatus);

  return isBookingInPast && isNotCompleted;
}
}
