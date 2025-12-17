import type { Booking } from './appointments';

export interface AnalyticsStats {
	completed: number;
	cancelled: number;
	pending: number;
	confirmed: number;
	inProgress: number;
	declined: number;
	noShow: number;
	total: number;
	completionRate: string;
	cancellationRate: string;
}

export interface RevenueStats {
	totalRevenue: number;
	averageRevenue: string;
	completedCount: number;
}

export interface DashboardData {
  allBookings: Booking[];
  upcomingAppointments: Booking[];
  recentActivity: Booking[];
  todayAppointments: Booking[];
}

