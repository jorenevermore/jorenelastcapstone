
'use client';

import { useState, useCallback } from 'react';
import { db } from '../firebase';
import { AnalyticsService } from '../services/analytics/AnalyticsService';
import type { Booking } from '../../app/dashboard/appointments/types';

const analyticsService = new AnalyticsService(db);

export interface UseAnalyticsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchBookings: (barbershopId: string) => Promise<void>;
  getStats: (bookings: Booking[]) => any;
  getRevenue: (bookings: Booking[]) => any;
  clearError: () => void;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (barbershopId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyticsService.getBookingsByBarbershop(barbershopId);
      if (result.success) {
        setBookings(result.data || []);
      } else {
        setError(result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getStats = useCallback((bookings: Booking[]) => {
    return analyticsService.calculateStats(bookings);
  }, []);

  const getRevenue = useCallback((bookings: Booking[]) => {
    return analyticsService.calculateRevenue(bookings);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    getStats,
    getRevenue,
    clearError
  };
}

