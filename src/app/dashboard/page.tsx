'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import StatsCards from './appointments/components/StatsCards';
import type { Booking } from '../../types/appointments';
import { BookingUtilService } from '../../lib/services/booking/BookingUtilService';
import { DashboardService } from '../../lib/services/dashboard/DashboardService';
import { AnalyticsService } from '../../lib/services/analytics/AnalyticsService';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Booking[]>([]);
  const [recentActivity, setRecentActivity] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    canceledAppointments: 0,
    totalRevenue: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const processDashboardData = useCallback((bookingsData: Booking[]) => {
    const dashboardData = DashboardService.processDashboardData(bookingsData);
    const analyticsStats = AnalyticsService.calculateStats(dashboardData.allBookings);
    const revenueStats = AnalyticsService.calculateRevenue(dashboardData.allBookings);
    const todayCount = AnalyticsService.getTodayAppointmentsCount(dashboardData.allBookings);

    setAllBookings(dashboardData.allBookings);
    setStats({
      totalAppointments: analyticsStats.total,
      pendingAppointments: analyticsStats.pending,
      todayAppointments: todayCount,
      completedAppointments: analyticsStats.completed,
      canceledAppointments: analyticsStats.cancelled,
      totalRevenue: revenueStats.totalRevenue
    });

    setUpcomingAppointments(dashboardData.upcomingAppointments);
    setRecentActivity(dashboardData.recentActivity);
  }, []);

  const fetchDashboardData = useCallback(async (barbershopId: string) => {
    try {
      setError(null);
      const bookingsCollection = collection(db, 'bookings');
      const bookingsQuery = query(
        bookingsCollection,
        where('barbershopId', '==', barbershopId)
      );

      const snapshot = await getDocs(bookingsQuery);
      const bookingsData: Booking[] = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          ...docData,
          id: doc.id
        } as Booking;
      });

      processDashboardData(bookingsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    }
  }, [processDashboardData]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchDashboardData(user.uid).finally(() => setLoading(false));
  }, [user, fetchDashboardData]);

  const handleRefresh = async () => {
    if (!user) return;
    setIsRefreshing(true);
    await fetchDashboardData(user.uid);
    setIsRefreshing(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-end items-center">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Refresh dashboard"
        >
          <i className={`fas fa-sync-alt text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}></i>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-2"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <StatsCards bookings={allBookings} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Appointments</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</h3>
                </div>
                <div className="p-2 rounded-lg bg-gray-100">
                  <i className="fas fa-calendar-check text-gray-600"></i>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-gray-500">
                  {stats.pendingAppointments} pending
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Today's Appointments</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</h3>
                </div>
                <div className="p-2 rounded-lg bg-gray-100">
                  <i className="fas fa-calendar-day text-gray-600"></i>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-gray-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900">₱{stats.totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="p-2 rounded-lg bg-gray-100">
                  <i className="fas fa-coins text-gray-600"></i>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-gray-500">
                  From {stats.completedAppointments} completed appointments
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Completion Rate</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {BookingUtilService.calculateCompletionRate(stats.completedAppointments, stats.totalAppointments)}%
                  </h3>
                </div>
                <div className="p-2 rounded-lg bg-gray-100">
                  <i className="fas fa-chart-line text-gray-600"></i>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-gray-500">
                  {stats.completedAppointments} completed • {stats.canceledAppointments} canceled
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Upcoming Appointments</h3>
                <Link href="/dashboard/appointments" className="text-xs text-blue-600 hover:text-blue-800">
                  View All <i className="fas fa-chevron-right ml-1"></i>
                </Link>
              </div>

              <div className="divide-y divide-gray-100">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map(appointment => (
                    <div
                      key={appointment.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/appointments/${appointment.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                            {appointment.clientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{appointment.clientName}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {appointment.serviceOrdered} • {appointment.barberName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{BookingUtilService.formatDate(appointment.date)}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{BookingUtilService.getSessionType(appointment.time)}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No upcoming appointments
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Recent Activity</h3>
                <Link href="/dashboard/appointments" className="text-xs text-blue-600 hover:text-blue-800">
                  View All <i className="fas fa-chevron-right ml-1"></i>
                </Link>
              </div>

              <div className="divide-y divide-gray-100">
                {recentActivity.length > 0 ? (
                  recentActivity.map(activity => (
                    <div
                      key={activity.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/appointments/${activity.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-gray-100 text-gray-600">
                            <span className="text-xs font-semibold">
                              {activity.clientName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {activity.clientName} - {activity.serviceOrdered}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {BookingUtilService.formatDate(activity.date)} • {BookingUtilService.getSessionType(activity.time)}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${BookingUtilService.getStatusBadgeStyle(activity.status)}`}>
                            {BookingUtilService.getFormattedStatus(activity.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
