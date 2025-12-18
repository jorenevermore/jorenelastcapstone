import { Firestore } from 'firebase/firestore';
import type { Booking } from '../../../types/appointments';
import type { AnalyticsStats, RevenueStats } from '../../../types/analytics';
import type { ServiceResponse } from '../../../types/response';
import { countBookingsByDateCategory, getDateISO, formatDateShort } from '../../utils/dateParser';
import { AppointmentService } from '../appointment/AppointmentService';
import { DashboardService } from '../dashboard/DashboardService';

export class AnalyticsService {
	private appointmentService: AppointmentService;

	constructor(private db: Firestore) {
		this.appointmentService = new AppointmentService(db);
	}
	static calculateStats(bookings: Booking[]): AnalyticsStats {
    const completed = bookings.filter(booking => booking.status === 'completed').length;
    const cancelled = bookings.filter(booking => booking.status === 'cancelled').length;
    const pending = bookings.filter(booking => booking.status === 'pending').length;
    const confirmed = bookings.filter(booking => booking.status === 'confirmed').length;
    const inProgress = bookings.filter(booking => booking.status === 'in-progress').length;
    const declined = bookings.filter(booking => booking.status === 'declined').length;
    const noShow = bookings.filter(booking => booking.status === 'no-show').length;

    const total = bookings.length;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(2) : '0';
    const cancellationRate = total > 0 ? ((cancelled / total) * 100).toFixed(2) : '0';

		return {completed,cancelled,pending,confirmed,inProgress,declined,noShow,total,completionRate,
		cancellationRate,
		};
	}

	static calculateRevenue(bookings: Booking[]): RevenueStats {
    const completedBookings = bookings.filter(booking => booking.status === 'completed');
    const totalRevenue = completedBookings.reduce((sum, booking) => sum + (booking.finalPrice || booking.totalPrice || 0), 0);
    const averageRevenue = completedBookings.length > 0 ? (totalRevenue / completedBookings.length).toFixed(2) : '0';

 		return {
			totalRevenue,
			averageRevenue,
			completedCount: completedBookings.length,
		};
	}

	static getTodayAppointmentsCount(bookings: Booking[]): number {
		const { todayCount } = countBookingsByDateCategory(bookings);
		return todayCount;
	}

	static calculateRates(totalAppointments: number, completedAppointments: number, canceledAppointments: number): { completionRate: number; cancellationRate: number } {
		const completionRate = totalAppointments > 0
			? Math.round((completedAppointments / totalAppointments) * 100)
			: 0;

		const cancellationRate = totalAppointments > 0
			? Math.round((canceledAppointments / totalAppointments) * 100)
			: 0;

		return { completionRate, cancellationRate };
	}

	static getAppointmentTrendsData(bookings: Booking[]): { labels: string[]; data: number[] } {
		// Group bookings by date
		const bookingsByDate = bookings.reduce<Record<string, number>>((acc, booking) => {
			const date = getDateISO(booking.date);
			acc[date] = (acc[date] || 0) + 1;
			return acc;
		}, {});

		// Sort dates
		const sortedDates = Object.keys(bookingsByDate).sort();

		// Prepare data for chart
		const data = sortedDates.map(date => bookingsByDate[date]);

		// Format dates for display
		const labels = sortedDates.map(date => formatDateShort(date));

		return { labels, data };
	}

	static getRevenueData(bookings: Booking[]): { labels: string[]; data: number[] } {
		// Group revenue by date
		const revenueByDate = bookings
			.filter(b => b.status === 'completed')
			.reduce<Record<string, number>>((acc, booking) => {
				const date = getDateISO(booking.date);
				const revenue = booking.finalPrice || booking.totalPrice || 0;
				acc[date] = (acc[date] || 0) + revenue;
				return acc;
			}, {});

		// Sort dates
		const sortedDates = Object.keys(revenueByDate).sort();

		// Prepare data for chart
		const data = sortedDates.map(date => revenueByDate[date]);

		// Format dates for display
		const labels = sortedDates.map(date => formatDateShort(date));

		return { labels, data };
	}

	static getServicePopularityData(bookings: Booking[]): { labels: string[]; data: number[] } {
		// Group bookings by service
		const serviceCount = bookings.reduce<Record<string, number>>((acc, booking) => {
			const service = booking.serviceOrdered || 'Unknown';
			acc[service] = (acc[service] || 0) + 1;
			return acc;
		}, {});

		// Sort by count descending
		const sortedServices = Object.entries(serviceCount)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10); // Top 10 services

		const labels = sortedServices.map(([service]) => service);
		const data = sortedServices.map(([, count]) => count);

		return { labels, data };
	}

	static getAppointmentStatusData(bookings: Booking[]): { labels: string[]; data: number[] } {
		const statusCount = bookings.reduce<Record<string, number>>((acc, booking) => {
			const status = booking.status;
			acc[status] = (acc[status] || 0) + 1;
			return acc;
		}, {});

		const labels = Object.keys(statusCount).map(status =>
			status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')
		);
		const data = Object.values(statusCount);

		return { labels, data };
	}

	static getAnalyticsMetrics(bookings: Booking[]): {
		totalAppointments: number;
		completedAppointments: number;
		canceledAppointments: number;
		pendingAppointments: number;
		confirmedAppointments: number;
		totalRevenue: number;
		uniqueCustomers: string[];
	} {
		const totalAppointments = bookings.length;
		const completedAppointments = bookings.filter(b => b.status === 'completed').length;
		const canceledAppointments = bookings.filter(b => b.status === 'cancelled').length;
		const pendingAppointments = bookings.filter(b => b.status === 'pending').length;
		const confirmedAppointments = bookings.filter(b => b.status === 'confirmed').length;

		const totalRevenue = bookings
			.filter(b => b.status === 'completed' && (b.finalPrice || b.totalPrice))
			.reduce((sum, booking) => sum + ((booking.finalPrice || booking.totalPrice) || 0), 0);

		const uniqueCustomers = Array.from(new Set(bookings.map(b => b.clientName)));

		return {
			totalAppointments,
			completedAppointments,
			canceledAppointments,
			pendingAppointments,
			confirmedAppointments,
			totalRevenue,
			uniqueCustomers
		};
	}

	static getRevenueMetrics(bookings: Booking[]): {
		totalRevenue: number;
		averageRevenue: number;
	} {
		const completedBookings = bookings.filter(b => b.status === 'completed' && (b.finalPrice || b.totalPrice));
		const totalRevenue = completedBookings.reduce((sum, booking) => sum + ((booking.finalPrice || booking.totalPrice) || 0), 0);
		const averageRevenue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;

		return { totalRevenue, averageRevenue };
	}

	async fetchAnalyticsData(barbershopId: string): Promise<ServiceResponse> {
		try {
			const result = await this.appointmentService.getBookingsByBarbershop(barbershopId);
			if (!result.success) {
				return { success: false, message: result.message || 'Failed to fetch bookings' };
			}

			const bookingsData = result.data || [];
			const dashboardData = DashboardService.processDashboardData(bookingsData);
			const stats = AnalyticsService.calculateStats(bookingsData);
			const revenue = AnalyticsService.calculateRevenue(bookingsData);
			const todayCount = AnalyticsService.getTodayAppointmentsCount(bookingsData);

			return {
				success: true,
				message: 'Analytics data fetched successfully',
				data: { bookings: bookingsData, dashboardData, stats, revenue, todayCount }
			};
		} catch (error) {
			console.error('Analytics fetch error:', error);
			return { success: false, message: 'Failed to fetch analytics data' };
		}
	}
}

