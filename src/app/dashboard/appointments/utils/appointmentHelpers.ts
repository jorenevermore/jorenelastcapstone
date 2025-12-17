
import type { Booking } from '../../../../types/appointments';

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



