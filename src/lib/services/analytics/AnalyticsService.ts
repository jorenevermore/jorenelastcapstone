
import type { Booking } from '../../../types/appointments';
import type { AnalyticsStats, RevenueStats } from '../../../types/analytics';

export class AnalyticsService {
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

		return {
			completed,
			cancelled,
			pending,
			confirmed,
			inProgress,
			declined,
			noShow,
			total,
			completionRate,
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
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const todayStr = today.toISOString().split('T')[0];
		return bookings.filter(booking => booking.date === todayStr).length;
	}
}

