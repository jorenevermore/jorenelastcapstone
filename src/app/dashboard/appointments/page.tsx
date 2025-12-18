'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../lib/firebase';
import type { Booking } from '../../../types/appointments';
import {
  DailyViewCard,
  BookingsTable,
  ConfirmationModal,
  FilterBar,
  QueueOverviewCard
} from './components';
import { useAppointments } from '../../../lib/hooks/useAppointments';
import { useAppointmentModals } from './hooks/useAppointmentModals';
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

  const {
    selectedBooking,
    openConfirmAction,
    closeConfirmAction,
    bookingToDelete,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    showCancelReasonModal,
    cancelReason,
    setCancelReason,
    openCancelReasonModal,
    closeCancelReasonModal,
  } = useAppointmentModals();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState<string | null>(appointmentError);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [barberFilter, setBarberFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // setup realtime listener for bookings
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
    setIsUpdating(true);
    try {
      const success = await updateBookingStatus(bookingId, status, reason);
      if (success) {
        closeConfirmAction();
      } else {
        setError('Failed to update booking status. Please try again.');
      }
      return success;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAccept = (bookingId: string) => {
    openConfirmAction(bookingId, 'accept');
  };

  const handleCancel = (bookingId: string) => {
    openConfirmAction(bookingId, 'cancel');
  };

  const handleDelete = (bookingId: string) => {
    openDeleteConfirmation(bookingId);
  };

  const confirmAction = async () => {
    if (selectedBooking) {
      const { id, action } = selectedBooking;
      if (action === 'accept') {
        await handleUpdateBookingStatus(id, 'confirmed');
      } else {
        closeConfirmAction();
        openCancelReasonModal(id);
      }
    }
  };

  const confirmDelete = async () => {
    if (bookingToDelete) {
      setIsDeleting(true);
      try {
        const success = await deleteBooking(bookingToDelete);
        if (success) {
          closeDeleteConfirmation();
        } else {
          setError('Failed to delete booking. Please try again.');
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

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

  // get barber names for filter
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
              <QueueOverviewCard bookings={bookings as Booking[]} isRealtime={true} />
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

          {selectedBooking && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Are you sure you want to {selectedBooking.action === 'accept' ? 'accept' : 'cancel'} this booking?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={closeConfirmAction}
                    disabled={isUpdating}
                    className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Close
                  </button>
                  <button
                    onClick={confirmAction}
                    disabled={isUpdating}
                    className={`px-3 py-1.5 text-white rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedBooking.action === 'accept'
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {isUpdating ? 'Processing...' : (selectedBooking.action === 'accept' ? 'Accept' : 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          )}
          <ConfirmationModal
            isOpen={!!bookingToDelete}
            title="Delete Booking"
            message="Are you sure you want to delete this booking? This action cannot be undone."
            confirmText={isDeleting ? 'Deleting...' : 'Delete'}
            onClose={closeDeleteConfirmation}
            onConfirm={confirmDelete}
            confirmColor="bg-red-600"
          />

          {showCancelReasonModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Cancel Appointment</h3>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  disabled={isUpdating}
                  className="w-full border border-gray-300 rounded p-3 mb-4 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  rows={4}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      closeCancelReasonModal();
                    }}
                    disabled={isUpdating}
                    className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Close
                  </button>
                  <button
                    onClick={async () => {
                      if (showCancelReasonModal) {
                        await handleUpdateBookingStatus(showCancelReasonModal, 'cancelled', cancelReason);
                        closeCancelReasonModal();
                      }
                    }}
                    disabled={isUpdating}
                    className="px-3 py-1.5 bg-red-500 text-white rounded text-xs font-medium transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Processing...' : 'Confirm Cancel'}
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
