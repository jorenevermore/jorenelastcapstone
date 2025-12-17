
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

export class StatusService {
  getStatusColor(status: BookingStatus | string): string {
    return STATUS_COLORS[status as BookingStatus] || STATUS_COLORS.default;
  }

  getStatusIcon(status: BookingStatus | string): string {
    return STATUS_ICONS[status as BookingStatus] || STATUS_ICONS.default;
  }

  getDateIndicator(dateString: string): { label: string; color: string } {
    const appointmentDate = new Date(dateString);
    const today = new Date();

    const appointmentDateLocal = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
    const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (appointmentDateLocal.getTime() === todayLocal.getTime()) {
      return { label: 'Today', color: 'bg-blue-100 text-blue-700' };
    }

    if (appointmentDateLocal.getTime() < todayLocal.getTime()) {
      return { label: 'Past', color: 'bg-gray-100 text-gray-700' };
    }

    return { label: 'Upcoming', color: 'bg-green-100 text-green-700' };
  }
}
