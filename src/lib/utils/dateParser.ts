
import type { Booking } from '../../types/appointments';

export const formatDateLong = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const formatDateShort = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const getDateISO = (dateString: string): string => {
  return dateString.split('T')[0];
};

export const getTodayISO = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getSessionLabel = (timeString: string): string => {
  const hour = parseInt(timeString.split(':')[0]);
  return hour < 13 ? 'Morning Session' : 'Afternoon Session';
};

export const formatTime12Hour = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const hour12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

export const formatTimestamp = (timestamp: string): string => {
  try {
    let date: Date;

    // Handle both ISO strings and milliseconds
    if (timestamp.includes('-') || timestamp.includes('T')) {
      // ISO string format
      date = new Date(timestamp);
    } else {
      // Milliseconds format
      date = new Date(parseInt(timestamp));
    }

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return timestamp;
  }
};

export const formatTimeAgo = (timestamp: string): string => {
  try {
    let time: Date;

    // Handle both ISO strings and milliseconds
    if (timestamp.includes('-') || timestamp.includes('T')) {
      // ISO string format
      time = new Date(timestamp);
    } else {
      // Milliseconds format
      time = new Date(parseInt(timestamp));
    }

    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return formatTimestamp(timestamp);
  } catch {
    return timestamp;
  }
};

export const isPastDue = (booking: Booking): boolean => {
  const bookingDateISO = getDateISO(booking.date);
  const todayISO = getTodayISO();
  const isBookingInPast = bookingDateISO < todayISO;

  return (
    isBookingInPast &&
    booking.status !== 'completed' &&
    booking.status !== 'cancelled' &&
    booking.status !== 'declined' &&
    booking.status !== 'no-show'
  );
};

export const filterBookingsByDateCategory = (
  bookings: Booking[],
  category: 'today' | 'upcoming' | 'all' | 'past'
): Booking[] => {
  const todayISO = getTodayISO();

  switch (category) {
    case 'today':
      return bookings.filter(booking => getDateISO(booking.date) === todayISO);
    case 'upcoming':
      return bookings.filter(booking => getDateISO(booking.date) > todayISO);
    case 'past':
      return bookings.filter(booking => getDateISO(booking.date) < todayISO);
    case 'all':
    default:
      return bookings;
  }
};

export const filterBookingsByDate = (bookings: Booking[], date: Date): Booking[] => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const targetISO = `${year}-${month}-${day}`;

  return bookings.filter(booking => getDateISO(booking.date) === targetISO);
};

export const countBookingsByDateCategory = (bookings: Booking[]): { todayCount: number; pastCount: number; upcomingCount: number } => {
  const todayISO = getTodayISO();

  const todayCount = bookings.filter(booking => getDateISO(booking.date) === todayISO).length;
  const pastCount = bookings.filter(booking => getDateISO(booking.date) < todayISO).length;
  const upcomingCount = bookings.filter(booking => getDateISO(booking.date) > todayISO).length;

  return { todayCount, pastCount, upcomingCount };
};

export interface ParsedDateTime {
  date: string;
  time: string;
  session: 'morning' | 'afternoon' | 'evening';
  sessionLabel: string;
}

export const parseBookingDateTime = (date: string, time: string): ParsedDateTime => {
  const hour = parseInt(time.split(':')[0]);
  const session = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  return {
    date: formatDateLong(date),
    time: formatTime12Hour(time),
    session,
    sessionLabel: getSessionLabel(time)
  };
};
