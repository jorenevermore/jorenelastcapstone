
'use client';

import { useState, useCallback } from 'react';
import { db } from '../firebase';
import { AppointmentService } from '../services/appointment/AppointmentService';
import type { Booking } from '../../app/dashboard/appointments/types';

const appointmentService = new AppointmentService(db);

export interface UseAppointmentsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchBookings: (barbershopId: string) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: string, reason?: string) => Promise<boolean>;
  deleteBooking: (bookingId: string) => Promise<boolean>;
  clearError: () => void;
}

export function useAppointments(): UseAppointmentsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch bookings once
  const fetchBookings = useCallback(async (barbershopId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await appointmentService.getBookingsByBarbershop(barbershopId);
      if (result.success) {
        setBookings(result.data as Booking[]);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, []);

    // update booking status
  const updateBookingStatus = useCallback(
    async (bookingId: string, status: string, reason?: string): Promise<boolean> => {
      try {
        const result = await appointmentService.updateBookingStatus(bookingId, status, reason);
        if (!result.success) {
          setError(result.message);
          return false;
        }
        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking.id === bookingId
              ? { ...booking, status: status as Booking['status'], barberReason: reason }
              : booking
          )
        );
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update booking');
        return false;
      }
    },
    []
  );

  const deleteBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    try {
      const result = await appointmentService.deleteBooking(bookingId);
      if (!result.success) {
        setError(result.message);
        return false;
      }
      setBookings(prevBookings =>
        prevBookings.filter(booking => booking.id !== bookingId)
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete booking');
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    updateBookingStatus,
    deleteBooking,
    clearError,
  };
}
