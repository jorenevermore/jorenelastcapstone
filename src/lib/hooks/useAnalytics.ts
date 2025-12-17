
'use client';

import { useState, useCallback } from 'react';
import { db } from '../firebase';
import { AnalyticsService } from '../services/analytics/AnalyticsService';
import { AppointmentService } from '../services/appointment/AppointmentService';
import type { Booking, AnalyticsStats, RevenueStats } from '../../types';

const appointmentService = new AppointmentService(db);

export interface UseAnalyticsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchBookings: (barbershopId: string) => Promise<void>;
  getStats: (bookings: Booking[]) => AnalyticsStats;
  getRevenue: (bookings: Booking[]) => RevenueStats;
  clearError: () => void;
}

export function useAnalytics(): UseAnalyticsReturn {
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Load all bookings for a barbershop (one-time fetch, no real-time listener)
	const fetchBookings = useCallback(async (barbershopId: string) => {
		setLoading(true);
		setError(null);

		try {
			const result = await appointmentService.getBookingsByBarbershop(barbershopId);
			if (result.success) {
				setBookings(result.data || []);
			} else {
				setError(result.message || 'Failed to fetch analytics data');
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to fetch analytics data';
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	}, []);

	const getStats = useCallback((source: Booking[]) => {
		return AnalyticsService.calculateStats(source);
	}, []);

	const getRevenue = useCallback((source: Booking[]) => {
		return AnalyticsService.calculateRevenue(source);
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
		clearError,
	};
}

