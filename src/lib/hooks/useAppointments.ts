
'use client';

import { useState, useCallback, useEffect } from 'react';
import { db } from '../firebase';
import { AppointmentService } from '../services/appointment/AppointmentService';
import { collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import type { Booking } from '../../types/appointments';

const appointmentService = new AppointmentService(db);

export interface UseAppointmentsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchBookings: (barbershopId: string) => void;
  updateBookingStatus: (bookingId: string, status: string, reason?: string) => Promise<boolean>;
  deleteBooking: (bookingId: string) => Promise<boolean>;
  clearError: () => void;
}

export function useAppointments(): UseAppointmentsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsubscribe, setUnsubscribe] = useState<Unsubscribe | null>(null);

  // realtime listener for bookings
  const fetchBookings = useCallback((barbershopId: string) => {
    try {
      setLoading(true);
      setError(null);

      const bookingsCollection = collection(db, 'bookings');
      const bookingsQuery = query(
        bookingsCollection,
        where('barbershopId', '==', barbershopId)
      );

      const newUnsubscribe = onSnapshot(
        bookingsQuery,
        (snapshot) => {
          try {
            const bookingsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Booking[];

            setBookings(bookingsData);
            setError(null);
            setLoading(false);
          } catch (error) {
            console.error('Error processing bookings snapshot:', error);
            setError(error instanceof Error ? error.message : 'Failed to process bookings');
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error listening to bookings:', error);
          setError(error instanceof Error ? error.message : 'Failed to listen to bookings');
          setLoading(false);
        }
      );

      // cleanup previous listener
      setUnsubscribe(prev => {
        if (prev) prev();
        return newUnsubscribe;
      });
    } catch (err) {
      console.error('Error setting up real-time listener:', err);
      setError(err instanceof Error ? err.message : 'Failed to set up real-time listener');
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
              ? {
                  ...booking,
                  status: status as Booking['status'],
                  barberReason: reason,
                  confirmedAt: status === 'confirmed' ? Date.now().toString() : booking.confirmedAt
                }
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

  // cleanup listener on unmount
  useEffect(() => {
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unsubscribe]);

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
