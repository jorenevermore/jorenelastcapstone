
'use client';

import { useState, useCallback } from 'react';
import { db } from '../firebase';
import { AnalyticsService } from '../services/analytics/AnalyticsService';
import { DashboardService } from '../services/dashboard/DashboardService';
import { AppointmentService } from '../services/appointment/AppointmentService';
import type { Booking, AnalyticsStats, RevenueStats } from '../../types';
import type { DashboardData } from '../../types/analytics';

const appointmentService = new AppointmentService(db);

export interface UseAnalyticsReturn {
  bookings: Booking[];
  upcomingAppointments: Booking[];
  recentActivity: Booking[];
  stats: AnalyticsStats;
  revenue: RevenueStats;
  todayCount: number;
  loading: boolean;
  error: string | null;
  fetchBookings: (barbershopId: string) => Promise<void>;
  clearError: () => void;
}

export function useAnalytics(): UseAnalyticsReturn {
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [dashboardData, setDashboardData] = useState<DashboardData>({
		allBookings: [],
		upcomingAppointments: [],
		recentActivity: [],
		todayAppointments: []
	});
	const [stats, setStats] = useState<AnalyticsStats>({
		completed: 0,
		cancelled: 0,
		pending: 0,
		confirmed: 0,
		inProgress: 0,
		declined: 0,
		noShow: 0,
		total: 0,
		completionRate: '0',
		cancellationRate: '0'
	});
	const [revenue, setRevenue] = useState<RevenueStats>({
		totalRevenue: 0,
		averageRevenue: '0',
		completedCount: 0
	});
	const [todayCount, setTodayCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);


	const fetchBookings = useCallback(async (barbershopId: string) => {
		setLoading(true);
		setError(null);

		try {
			const result = await appointmentService.getBookingsByBarbershop(barbershopId);
			if (result.success) {
				const bookingsData = result.data || [];
				setBookings(bookingsData);

				const processed = DashboardService.processDashboardData(bookingsData);
				setDashboardData(processed);

				const calculatedStats = AnalyticsService.calculateStats(bookingsData);
				setStats(calculatedStats);

				const calculatedRevenue = AnalyticsService.calculateRevenue(bookingsData);
				setRevenue(calculatedRevenue);

				const todayAppointments = AnalyticsService.getTodayAppointmentsCount(bookingsData);
				setTodayCount(todayAppointments);
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

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		bookings,
		upcomingAppointments: dashboardData.upcomingAppointments,
		recentActivity: dashboardData.recentActivity,
		stats,
		revenue,
		todayCount,
		loading,
		error,
		fetchBookings,
		clearError,
	};
}

