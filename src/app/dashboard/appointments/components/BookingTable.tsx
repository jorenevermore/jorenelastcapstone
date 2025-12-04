'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '../types';

interface BookingTableProps {
  bookings: Booking[];
  handleAccept: (id: string) => void;
  handleCancel: (id: string) => void;
  handleDelete: (id: string) => void;
  dateFilter: string;
}

const BookingTable = ({
  bookings,
  handleAccept,
  handleCancel,
  handleDelete,
  dateFilter
}: BookingTableProps) => {
  const router = useRouter();

  // Filter bookings by date
  const getFilteredBookings = () => {
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];

    return bookings.filter(booking => {
      // Extract ISO date from booking.date (handles ISO format like "2025-11-25T00:00:00.000Z")
      const bookingDateISO = booking.date.split('T')[0];

      switch (dateFilter) {
        case 'all':
          return true;
        case 'today':
          return bookingDateISO === todayISO;
        case 'upcoming':
          return bookingDateISO > todayISO;
        default:
          return true;
      }
    });
  };

  const filteredBookings = getFilteredBookings();

  // Helper function to get status badge styling
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'no-show':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'fas fa-clock';
      case 'confirmed':
        return 'fas fa-check-circle';
      case 'in-progress':
        return 'fas fa-spinner fa-spin';
      case 'completed':
        return 'fas fa-check-double';
      case 'cancelled':
        return 'fas fa-times-circle';
      case 'no-show':
        return 'fas fa-user-slash';
      default:
        return 'fas fa-question-circle';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
        <div className="flex items-center">
          <i className="fas fa-th-list text-gray-600 mr-2"></i>
          <span className="text-sm font-semibold text-gray-700">All Bookings</span>
        </div>
        <p className="text-xs text-gray-500">
          Showing <span className="font-medium text-gray-700">{filteredBookings.length}</span> booking{filteredBookings.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="overflow-auto flex-1">
        {filteredBookings.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500">CUSTOMER</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">SERVICE</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">BARBER</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">DATE & TIME</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">STATUS</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500 w-24">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map(booking => (
                <tr
                  key={booking.id}
                  className={`hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
                    booking.isEmergency
                      ? 'border-red-500 bg-red-50/30'
                      : 'border-transparent hover:border-black'
                  }`}
                  onClick={() => router.push(`/dashboard/appointments/${booking.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3 flex-shrink-0">
                        {booking.clientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-1">{booking.clientName}</div>
                        <div className="flex items-center mt-0.5">
                          {booking.isHomeService && (
                            <span className="inline-flex items-center mr-2 text-xs text-blue-600">
                              <i className="fas fa-home text-xs mr-1"></i> Home
                            </span>
                          )}
                          {booking.isEmergency && (
                            <span className="inline-flex items-center text-xs text-red-600 font-semibold">
                              <i className="fas fa-exclamation-circle text-xs mr-1"></i> RUSH BOOKING
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="line-clamp-1 font-medium">{booking.serviceOrdered}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{booking.styleOrdered}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="line-clamp-1">{booking.barberName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{new Date(booking.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-gray-500">
                        {(() => {
                          const startTime = booking.time?.split('-')[0]?.trim() || '';
                          const hour = parseInt(startTime.split(':')[0]);
                          return hour < 13 ? 'Morning Session' : 'Afternoon Session';
                        })()}
                      </span>
                      {(() => {
                        const startTime = booking.time?.split('-')[0]?.trim() || '';
                        const hour = parseInt(startTime.split(':')[0]);

                        const now = new Date();

                        // Get today's date in ISO format (YYYY-MM-DD)
                        const todayISO = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                          .toISOString().split('T')[0];

                        // Parse booking date - handle both ISO format and other formats
                        let bookingDateISO: string;
                        if (booking.date.includes('-') && booking.date.length === 10) {
                          // Already in ISO format (YYYY-MM-DD)
                          bookingDateISO = booking.date;
                        } else {
                          // Parse from other format
                          const bookingDate = new Date(booking.date);
                          bookingDateISO = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate())
                            .toISOString().split('T')[0];
                        }

                        // Simple logic: Past Due if booking date is in the past
                        const isBookingInPast = bookingDateISO < todayISO;

                        // Only show "Past Due" if:
                        // 1. Booking date is in the past (before today)
                        // 2. Status is not completed/cancelled/declined/no-show
                        const isPastDue =
                          isBookingInPast &&
                          booking.status !== 'completed' &&
                          booking.status !== 'cancelled' &&
                          booking.status !== 'declined' &&
                          booking.status !== 'no-show';

                        return isPastDue ? (
                          <span className="text-xs text-red-600 font-medium">Past Due</span>
                        ) : null;
                      })()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyle(booking.status)}`}>
                      <i className={`${getStatusIcon(booking.status)} text-xs mr-1`}></i>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                    </span>
                    {(booking.reason || booking.barberReason) && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <i className="fas fa-comment-alt text-xs mr-1"></i> Has notes
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-1">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            className="p-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccept(booking.id);
                            }}
                            title="Accept"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            className="p-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancel(booking.id);
                            }}
                            title="Cancel"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      )}

                      <button
                        className="p-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(booking.id);
                        }}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-6 text-center text-gray-500">
            <div className="text-3xl mb-3"><i className="far fa-calendar-times"></i></div>
            <p className="font-medium mb-1">No appointments found</p>
            <p className="text-xs">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingTable;
