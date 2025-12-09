'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../lib/firebase';
import {
  SummaryCards,
  AppointmentTrends,
  ServicePopularity,
  BarberPerformance,
  RevenueChart,
  CustomerRetention,
  AppointmentStatusChart,
  CancellationReasons,
  DateRangePicker
} from './components';
import { useAnalytics } from '../../../lib/hooks/useAnalytics';

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
  const totalAppointments = filteredBookings.length;
  const completedAppointments = filteredBookings.filter(b => b.status === 'completed').length;
  const canceledAppointments = filteredBookings.filter(b => b.status === 'cancelled').length;
  const pendingAppointments = filteredBookings.filter(b => b.status === 'pending').length;
  const confirmedAppointments = filteredBookings.filter(b => b.status === 'confirmed').length;

  // calculate total revenue (if price is available)
  const totalRevenue = filteredBookings
    .filter(b => b.status === 'completed' && (b.finalPrice || b.totalPrice))
    .reduce((sum, booking) => sum + ((booking.finalPrice || booking.totalPrice) || 0), 0);

  // get unique customers
  const uniqueCustomers = [...new Set(filteredBookings.map(b => b.clientId || b.clientName))];

  // handle date range change
  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };
  
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
          <p>Loading analytics data...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-700">Business Analytics</h2>
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
            uniqueCustomers={uniqueCustomers.length}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <AppointmentTrends bookings={filteredBookings} />
            <RevenueChart bookings={filteredBookings} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <ServicePopularity bookings={filteredBookings} />
            <AppointmentStatusChart bookings={filteredBookings} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <BarberPerformance bookings={filteredBookings} />
            <CustomerRetention bookings={filteredBookings} />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <CancellationReasons bookings={filteredBookings} />
          </div>
        </>
      )}
    </div>
  );
}
