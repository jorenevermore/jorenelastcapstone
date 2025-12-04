'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../lib/firebase';
import { Booking } from './types';
import {
  TodayBookingsCard,
  BookingTable,
  ConfirmationModal,
  FilterBar,
  QueueStats
} from './components';
import { useQueueNotifications } from './hooks/useQueueNotifications';
import { useAppointments } from '../../../lib/hooks/useAppointments';
import {
  filterBookings,
  getUniqueBarbers,
  countBookingsByDateCategory,
  filterBookingsByDate
} from './utils/appointmentHelpers';

export default function AppointmentsPage() {
  const [user] = useAuthState(auth);
  const {
    bookings,
    loading,
    error: appointmentError,
    subscribeToBookings,
    updateBookingStatus,
    deleteBooking
  } = useAppointments();

  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState<string | null>(appointmentError);

  const [selectedBooking, setSelectedBooking] = useState<{
    id: string;
    action: 'accept' | 'cancel';
  } | null>(null);

  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [barberFilter, setBarberFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // activate queue notifications
  useQueueNotifications(bookings as Booking[]);

  // subscribe to real-time bookings updates
  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = subscribeToBookings(user.uid);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, subscribeToBookings]);

  useEffect(() => {
    if (appointmentError) {
      setError(appointmentError);
    }
  }, [appointmentError]);

  // update today's bookings when selected date changes
  const updateTodayBookings = useCallback(
    (date: Date, bookingsList: Booking[] = bookings as Booking[]) => {
      const filtered = filterBookingsByDate(bookingsList, date);
      setTodayBookings(filtered);
    },
    [bookings]
  );

  // update today's bookings when bookings data changes
  useEffect(() => {
    updateTodayBookings(selectedDate, bookings as Booking[]);
  }, [bookings, selectedDate, updateTodayBookings]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    updateTodayBookings(date);
  };

  // handle booking status update
  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: Booking['status'],
    reason?: string
  ) => {
    const success = await updateBookingStatus(bookingId, status, reason);
    if (success) {
      setSelectedBooking(null);
    } else {
      setError('Failed to update booking status. Please try again.');
    }
    return success;
  };

  const handleAccept = (bookingId: string) => {
    setSelectedBooking({ id: bookingId, action: 'accept' });
  };

  const handleCancel = (bookingId: string) => {
    setSelectedBooking({ id: bookingId, action: 'cancel' });
  };

  const handleDelete = (bookingId: string) => {
    setBookingToDelete(bookingId);
  };

  const confirmAction = async () => {
    if (selectedBooking) {
      const { id, action } = selectedBooking;
      action === 'accept'
        ? await handleUpdateBookingStatus(id, 'confirmed')
        : await handleUpdateBookingStatus(id, 'cancelled');
    }
  };

  const confirmDelete = async () => {
    if (bookingToDelete) {
      const success = await deleteBooking(bookingToDelete);
      if (success) {
        setBookingToDelete(null);
      } else {
        setError('Failed to delete booking. Please try again.');
      }
    }
  };

  // filter bookings using helper function
  const filteredBookings = filterBookings(
    bookings as Booking[],
    statusFilter,
    barberFilter,
    searchQuery
  );

  // get unique barber names for filter
  const uniqueBarbers = getUniqueBarbers(bookings as Booking[]);

  // count bookings by date category
  const { todayCount, pastCount, upcomingCount } =
    countBookingsByDateCategory(bookings as Booking[]);

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
          <p>Loading appointments...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 mb-6">
            <div className="lg:col-span-7">
              <QueueStats bookings={bookings as Booking[]} />
            </div>
            <div className="lg:col-span-3 max-h-[60vh] overflow-y-auto">
              <TodayBookingsCard
                todayBookings={todayBookings}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </div>
          </div>
          <div className="mb-4">
            <FilterBar
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              barberFilter={barberFilter}
              setBarberFilter={setBarberFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              uniqueBarbers={uniqueBarbers}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              todayCount={todayCount}
              pastCount={pastCount}
              upcomingCount={upcomingCount}
            />
          </div>
          <div className="bg-white rounded-lg shadow-sm">
            <BookingTable
              bookings={filteredBookings as Booking[]}
              handleAccept={handleAccept}
              handleCancel={handleCancel}
              handleDelete={handleDelete}
              dateFilter={dateFilter}
            />
          </div>
          <ConfirmationModal
            title="Confirm Action"
            message={`Are you sure you want to ${
              selectedBooking?.action === 'accept' ? 'accept' : 'cancel'
            } this booking?`}
            isOpen={selectedBooking !== null}
            onClose={() => setSelectedBooking(null)}
            onConfirm={confirmAction}
            confirmText={
              selectedBooking?.action === 'accept' ? 'Accept' : 'Cancel'
            }
            confirmColor={
              selectedBooking?.action === 'accept'
                ? 'bg-green-500'
                : 'bg-yellow-500'
            }
          />
          <ConfirmationModal
            title="Confirm Deletion"
            message="Are you sure you want to delete this booking? This action cannot be undone."
            isOpen={bookingToDelete !== null}
            onClose={() => setBookingToDelete(null)}
            onConfirm={confirmDelete}
            confirmText="Delete"
            confirmColor="bg-red-500"
          />
        </>
      )}
    </div>
  );
}
