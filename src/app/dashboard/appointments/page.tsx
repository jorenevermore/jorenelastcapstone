'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../lib/firebase';
import { Booking } from './types';
import {
  DailyViewCard,
  BookingsTable,
  ConfirmationModal,
  FilterBar,
  QueueOverviewCard
} from './components';

import { useAppointments } from '../../../lib/hooks/useAppointments';
import { useRealtimeQueue } from '../../../lib/hooks/useRealtimeQueue';
import { BookingUtilService } from '../../../lib/services/booking/BookingUtilService';
import {
  filterBookings,
  getUniqueBarbers
} from './utils/appointmentHelpers';

export default function AppointmentsPage() {
  const [user] = useAuthState(auth);
  const {
    bookings,
    loading,
    error: appointmentError,
    fetchBookings,
    updateBookingStatus,
    deleteBooking
  } = useAppointments();

  // Real-time queue updates ONLY for Queue Overview
  const { bookings: realtimeQueueBookings } = useRealtimeQueue(user?.uid);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState<string | null>(appointmentError);

  const [selectedBooking, setSelectedBooking] = useState<{
    id: string;
    action: 'accept' | 'cancel';
  } | null>(null);

  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [showCancelReasonModal, setShowCancelReasonModal] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [barberFilter, setBarberFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('today');

  // Fetch bookings once on mount
  useEffect(() => {
    if (!user) return;
    fetchBookings(user.uid);
  }, [user, fetchBookings]);

  useEffect(() => {
    if (appointmentError) {
      setError(appointmentError);
    }
  }, [appointmentError]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
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
      if (action === 'accept') {
        await handleUpdateBookingStatus(id, 'confirmed');
      } else {
        // For cancel action, show reason modal instead of directly cancelling
        setShowCancelReasonModal(id);
      }
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

  // filter bookings: first by date category, then by other filters
  const bookingsByDateCategory = BookingUtilService.filterBookingsByDateCategory(
    bookings as Booking[],
    dateFilter as 'today' | 'upcoming' | 'all'
  );

  const filteredBookings = filterBookings(
    bookingsByDateCategory,
    statusFilter,
    barberFilter,
    searchQuery
  );

  // get unique barber names for filter
  const uniqueBarbers = getUniqueBarbers(bookings as Booking[]);

  // count bookings by date category
  const { todayCount, pastCount, upcomingCount } =
    BookingUtilService.countBookingsByDateCategory(bookings as Booking[]);

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
              <QueueOverviewCard bookings={realtimeQueueBookings as Booking[]} isRealtime={true} />
            </div>
            <div className="lg:col-span-3 max-h-[60vh] overflow-y-auto">
              <DailyViewCard
                todayBookings={BookingUtilService.filterBookingsByDate(bookings as Booking[], selectedDate)}
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
            <BookingsTable
              bookings={filteredBookings as Booking[]}
              handleAccept={handleAccept}
              handleCancel={handleCancel}
              handleDelete={handleDelete}
              dateFilter={dateFilter}
            />
          </div>
          {/* Confirm Action Modal */}
          {selectedBooking && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Are you sure you want to {selectedBooking.action === 'accept' ? 'accept' : 'cancel'} this booking?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={confirmAction}
                    className={`px-3 py-1.5 text-white rounded text-xs font-medium transition-colors ${
                      selectedBooking.action === 'accept'
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {selectedBooking.action === 'accept' ? 'Accept' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Delete Confirmation Modal */}
          {bookingToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Are you sure you want to delete this booking? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBookingToDelete(null)}
                    className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-3 py-1.5 bg-red-500 text-white rounded text-xs font-medium transition-colors hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cancellation Reason Modal */}
          {showCancelReasonModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Cancel Appointment</h3>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  className="w-full border border-gray-300 rounded p-3 mb-4 text-sm"
                  rows={4}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCancelReasonModal(null);
                      setCancelReason('');
                      setSelectedBooking(null);
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={async () => {
                      if (showCancelReasonModal) {
                        await handleUpdateBookingStatus(showCancelReasonModal, 'cancelled', cancelReason);
                        setShowCancelReasonModal(null);
                        setCancelReason('');
                      }
                    }}
                    className="px-3 py-1.5 bg-red-500 text-white rounded text-xs font-medium transition-colors hover:bg-red-600"
                  >
                    Confirm Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
