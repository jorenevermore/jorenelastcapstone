
import { Booking } from '../types';

export const filterBookings = (
  bookings: Booking[],
  statusFilter: string,
  barberFilter: string,
  searchQuery: string
): Booking[] => {
  return bookings
    .filter(booking => {

      if (statusFilter !== 'all' && booking.status !== statusFilter) return false;

      if (barberFilter !== 'all' && booking.barberName !== barberFilter) return false;

      if (searchQuery &&
          !booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !booking.serviceOrdered.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });
};

export const getUniqueBarbers = (bookings: Booking[]): string[] => {
  return Array.from(new Set(bookings.map(b => b.barberName)));
};

export const countBookingsByDateCategory = (bookings: Booking[]) => {
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];

  const todayCount = bookings.filter(b => {
    const bookingDateISO = b.date.split('T')[0];
    return bookingDateISO === todayISO;
  }).length;

  const pastCount = bookings.filter(b => {
    const bookingDateISO = b.date.split('T')[0];
    return bookingDateISO < todayISO;
  }).length;

  const upcomingCount = bookings.filter(b => {
    const bookingDateISO = b.date.split('T')[0];
    return bookingDateISO > todayISO;
  }).length;

  return { todayCount, pastCount, upcomingCount };
};

export const filterBookingsByDate = (bookings: Booking[], date: Date): Booking[] => {
  // Convert to ISO date string (YYYY-MM-DD) for reliable comparison
  const dateISO = date.toISOString().split('T')[0];
  return bookings.filter(booking => {
    // Extract ISO date from booking.date (handles ISO format like "2025-11-25T00:00:00.000Z")
    const bookingDateISO = booking.date.split('T')[0];
    return bookingDateISO === dateISO;
  });
};

