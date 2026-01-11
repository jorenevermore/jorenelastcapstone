'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../lib/firebase';
import {
  SummaryCards,
  AppointmentTrends,
  ServicePopularity,
  RevenueChart,
  AppointmentStatusChart,
  DateRangePicker
} from './components';
import { useAnalytics } from '../../../lib/hooks/useAnalytics';
import { AnalyticsService } from '../../../lib/services/analytics/AnalyticsService';

export default function AnalyticsPage() {
  const [user] = useAuthState(auth);
  const { bookings, loading, error: analyticsError, fetchBookings } = useAnalytics();
  const [error, setError] = useState<string | null>(analyticsError);

  // date range filter
  const [startDate, setStartDate] = useState<Date>(() => {
    let date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());

  // fetch bookings
  useEffect(() => {
    if (!user) {
      return;
    }

    fetchBookings(user.uid);
  }, [user, fetchBookings]);

  useEffect(() => {
    if (analyticsError) {
      setError(analyticsError);
    }
  }, [analyticsError]);
  
    // filter bookings by date range
  const filteredBookings = bookings.filter(booking => {
    let bookingDate = new Date(booking.date);
    // set time to start of day for accurate comparison
    bookingDate.setHours(0, 0, 0, 0);
    let filterStartDate = new Date(startDate);
    filterStartDate.setHours(0, 0, 0, 0);
    let filterEndDate = new Date(endDate);
    filterEndDate.setHours(23, 59, 59, 999);
    return bookingDate >= filterStartDate && bookingDate <= filterEndDate;
  });

  // calculate key metrics
  const {
    totalAppointments,
    completedAppointments,
    canceledAppointments,
    pendingAppointments,
    confirmedAppointments,
    totalRevenue
  } = AnalyticsService.getAnalyticsMetrics(filteredBookings);

  // handle date range change
  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };
  
  return (
    <div className="p-6 flex flex-col bg-gray-50 min-h-screen w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg p-8 text-center flex-1 flex items-center justify-center">
          <div>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
              <p className="text-gray-500 text-xs mt-1">Track your appointments and revenue performance.</p>
            </div>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateRangeChange}
            />
          </div>

          <SummaryCards
            totalAppointments={totalAppointments}
            completedAppointments={completedAppointments}
            canceledAppointments={canceledAppointments}
            pendingAppointments={pendingAppointments}
            confirmedAppointments={confirmedAppointments}
            totalRevenue={totalRevenue}
          />

          <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-80 w-full">
              <AppointmentTrends bookings={filteredBookings} />
              <RevenueChart bookings={filteredBookings} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-80 w-full">
              <ServicePopularity bookings={filteredBookings} />
              <AppointmentStatusChart bookings={filteredBookings} />
            </div>
          </div>


        </>
      )}
    </div>
  );
}
