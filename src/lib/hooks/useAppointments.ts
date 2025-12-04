
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { AppointmentService } from '../services/appointment/AppointmentService';
import { Booking } from '../services/appointment/BaseAppointmentService';
import { Unsubscribe } from 'firebase/firestore';

const appointmentService = new AppointmentService(db);

export interface UseAppointmentsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchBookings: (barbershopId: string) => Promise<void>;
  subscribeToBookings: (barbershopId: string) => Unsubscribe | null;
  updateBookingStatus: (
    bookingId: string,
    status: string,
    reason?: string
  ) => Promise<boolean>;
  deleteBooking: (bookingId: string) => Promise<boolean>;
  clearError: () => void;
}

export function useAppointments(): UseAppointmentsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const currentBarbershopRef = useRef<string | null>(null);
  const setBookingsRef = useRef(setBookings);
  const setErrorRef = useRef(setError);

  // Keep refs in sync with state setters
  useEffect(() => {
    setBookingsRef.current = setBookings;
    setErrorRef.current = setError;
  }, []);

  const fetchBookings = useCallback(async (barbershopId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await appointmentService.getBookingsByBarbershop(
        barbershopId
      );
      if (result.success) {
        setBookings(result.data || []);
      } else {
        setError(result.message);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch bookings';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Real-time subscription to bookings for a barbershop.
   * - If we are already subscribed to this barbershop, we just reuse the existing listener.
   * - Only when barbershopId changes do we unsubscribe + create a new listener.
   */
  const subscribeToBookings = useCallback(
    (barbershopId: string): Unsubscribe | null => {
      try {
        if (
          currentBarbershopRef.current === barbershopId &&
          unsubscribeRef.current
        ) {
          return unsubscribeRef.current;
        }
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }

        const unsubscribe = appointmentService.subscribeToBookings(
          barbershopId,
          (updatedBookings) => {
            setBookingsRef.current(updatedBookings);
          }
        );

        unsubscribeRef.current = unsubscribe;
        currentBarbershopRef.current = barbershopId;

        return unsubscribe;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to subscribe to bookings';
        setErrorRef.current(errorMessage);
        return null;
      }
    },
    []
  );

  const updateBookingStatus = useCallback(
    async (
      bookingId: string,
      status: string,
      reason?: string
    ): Promise<boolean> => {
      try {
        const result = await appointmentService.updateBookingStatus(
          bookingId,
          status,
          reason
        );
        if (!result.success) {
          setError(result.message);
          return false;
        }
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update booking';
        setError(errorMessage);
        return false;
      }
    },
    []
  );

  const deleteBooking = useCallback(
    async (bookingId: string): Promise<boolean> => {
      try {
        const result = await appointmentService.deleteBooking(bookingId);
        if (!result.success) {
          setError(result.message);
          return false;
        }
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete booking';
        setError(errorMessage);
        return false;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      currentBarbershopRef.current = null;
    };
  }, []);

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    subscribeToBookings,
    updateBookingStatus,
    deleteBooking,
    clearError,
  };
}
