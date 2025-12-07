'use client';

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import type { Booking } from '../../app/dashboard/appointments/types';

export interface UseRealtimeQueueReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

export function useRealtimeQueue(barbershopId: string | undefined): UseRealtimeQueueReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!barbershopId) {
      setLoading(false);
      return;
    }

    let unsubscribe: Unsubscribe | null = null;

    try {
      const bookingsCollection = collection(db, 'bookings');
      const q = query(
        bookingsCollection,
        where('barbershopId', '==', barbershopId)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          try {
            const bookingsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Booking[];

            setBookings(bookingsData);
            setError(null);
            setLoading(false);
          } catch (err) {
            console.error('Error processing bookings snapshot:', err);
            setError(err instanceof Error ? err.message : 'Failed to process bookings');
            setLoading(false);
          }
        },
        (err) => {
          console.error('Error listening to bookings:', err);
          setError(err instanceof Error ? err.message : 'Failed to listen to bookings');
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Error setting up real-time listener:', err);
      setError(err instanceof Error ? err.message : 'Failed to set up real-time listener');
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [barbershopId]);

  return { bookings, loading, error };
}

