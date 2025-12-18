
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
  updateBookingStatus: (bookingId: string, status: Booking['status'], reason?: string) => Promise<boolean>;
  deleteBooking: (bookingId: string) => Promise<boolean>;
  clearError: () => void;
}

export function useAppointments(): UseAppointmentsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsubscribe, setUnsubscribe] = useState<Unsubscribe | null>(null);
  const [currentBarbershopId, setCurrentBarbershopId] = useState<string | null>(null);

  // realtime listener for bookings - prevents duplicate listeners
  const fetchBookings = useCallback((barbershopId: string) => {
    // Guard: don't create a new listener if already listening to the same barbershop
    if (currentBarbershopId === barbershopId && unsubscribe) {
      return;
    }

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
            setError('Failed to process bookings');
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error listening to bookings:', error);
          setError('Failed to listen to bookings');
          setLoading(false);
        }
      );

      // cleanup previous listener and set new one
      setUnsubscribe(prev => {
        if (prev) prev();
        return newUnsubscribe;
      });
      setCurrentBarbershopId(barbershopId);
    } catch (err) {
      console.error('Error setting up real-time listener:', err);
      setError('Failed to set up real-time listener');
      setLoading(false);
    }
  }, [currentBarbershopId, unsubscribe]);

    // update booking status
  const updateBookingStatus = useCallback(
    async (bookingId: string, status: Booking['status'], reason?: string): Promise<boolean> => {
      try {
        const result = await appointmentService.updateBookingStatus(bookingId, status, reason);
        if (!result.success) {
          if (result.message) setError(result.message);
          return false;
        }
        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking.id === bookingId
              ? {
                  ...booking,
                  status,
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
    [appointmentService]
  );

  const deleteBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    try {
      const result = await appointmentService.deleteBooking(bookingId);
      if (!result.success) {
        if (result.message) setError(result.message);
        return false;
      }
      setBookings(prevBookings =>
        prevBookings.filter(booking => booking.id !== bookingId)
      );
      return true;
    } catch (err) {
      setError('Failed to delete booking');
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
