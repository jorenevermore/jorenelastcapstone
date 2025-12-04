'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { QueueService } from '../../lib/services/queue/QueueService';
import StatsCards from './appointments/components/StatsCards';
import { Booking } from './appointments/types';
import { formatDate, getStatusBadgeStyle, getStatusIcon, calculateCompletionRate } from './utils/dashboardHelpers';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard data
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

  // fetch realtime data
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // realtime listener
    const bookingsCollection = collection(db, 'bookings');
    const bookingsQuery = query(
      bookingsCollection,
      where('barbershopId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const bookingsData: Booking[] = snapshot.docs.map(doc => {
          const docData = doc.data();
          return {
            ...docData,
            id: doc.id
          } as Booking;
        });

        // add queue positions to bookings
        const queueService = new QueueService();
        const bookingsWithQueue = queueService.addQueuePositions(bookingsData);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        // calculate stats
        const totalAppointments = bookingsWithQueue.length;
        const pendingAppointments = bookingsWithQueue.filter(b => b.status === 'pending').length;
        const completedAppointments = bookingsWithQueue.filter(b => b.status === 'completed').length;
        const canceledAppointments = bookingsWithQueue.filter(b => b.status === 'cancelled').length;

        // calculate total revenue
        const totalRevenue = bookingsWithQueue
          .filter(b => b.status === 'completed' && b.totalPrice)
          .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

        // get today's appointments (sorted by queue)
        const todayAppts = queueService.sortByQueuePriority(
          bookingsWithQueue.filter(booking => booking.date === todayStr)
        );

        // get upcoming appointments (future dates, not cancelled)
        const upcomingAppts = queueService.sortByQueuePriority(
          bookingsWithQueue.filter(booking => {
            const bookingDate = new Date(booking.date);
            return bookingDate >= today && booking.status !== 'cancelled';
          })
        ).slice(0, 5);

        // get recent activity
        const recentActs = [...bookingsWithQueue]
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);

        // update state
        setAllBookings(bookingsWithQueue as Booking[]);
        setStats({
          totalAppointments,
          pendingAppointments,
          todayAppointments: todayAppts.length,
          completedAppointments,
          canceledAppointments,
          totalRevenue
        });

        setUpcomingAppointments(upcomingAppts as Booking[]);
        setRecentActivity(recentActs as Booking[]);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="p-4">
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
            <div className="bg-white rounded-lg shadow-sm p-4" style={{ borderLeft: '4px solid #BF8F63' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Appointments</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</h3>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#BF8F6320' }}>
                  <i className="fas fa-calendar-check" style={{ color: '#BF8F63' }}></i>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-gray-500">
                  {stats.pendingAppointments} pending
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4" style={{ borderLeft: '4px solid #BF8F63' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Today's Appointments</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</h3>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#BF8F6320' }}>
                  <i className="fas fa-calendar-day" style={{ color: '#BF8F63' }}></i>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-gray-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4" style={{ borderLeft: '4px solid #BF8F63' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900">₱{stats.totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#BF8F6320' }}>
                  <i className="fas fa-coins" style={{ color: '#BF8F63' }}></i>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-gray-500">
                  From {stats.completedAppointments} completed appointments
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Completion Rate</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {calculateCompletionRate(stats.completedAppointments, stats.totalAppointments)}%
                  </h3>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <i className="fas fa-chart-line text-purple-500"></i>
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
                          <div className="font-medium text-gray-900">{formatDate(appointment.date)}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{appointment.time}</div>
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
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getStatusBadgeStyle(activity.status)}`}>
                            <i className={`${getStatusIcon(activity.status)} text-xs`}></i>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {activity.clientName} - {activity.serviceOrdered}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {formatDate(activity.date)} • {activity.time}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyle(activity.status)}`}>
                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
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
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-base font-medium text-gray-700 mb-3">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Email</div>
                <div className="text-sm font-medium">{user?.email}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Account ID</div>
                <div className="text-sm font-medium">{user?.uid}</div>
              </div>
              {user?.metadata?.creationTime && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Account Created</div>
                  <div className="text-sm font-medium">{user.metadata.creationTime}</div>
                </div>
              )}
              {user?.metadata?.lastSignInTime && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Last Sign In</div>
                  <div className="text-sm font-medium">{user.metadata.lastSignInTime}</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
