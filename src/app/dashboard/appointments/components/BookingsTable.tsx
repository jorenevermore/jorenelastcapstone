'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Booking } from '../../../../types/appointments';
import { BookingUtilService } from '../../../../lib/services/booking/BookingUtilService';

interface BookingsTableProps {
  bookings: Booking[];
  handleAccept: (id: string) => void;
  handleCancel: (id: string) => void;
  handleDelete: (id: string) => void;
  dateFilter: string;
}

const BookingsTable = ({
  bookings,
  handleAccept,
  handleCancel,
  handleDelete,
  dateFilter
}: BookingsTableProps) => {
  const router = useRouter();

  // filter bookings by date
  const getFilteredBookings = () => {
    const today = new Date();
    // use local date calc
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayISO = `${year}-${month}-${day}`;

    return bookings.filter(booking => {
      const bookingDateISO = booking.date.split('T')[0];

      switch (dateFilter) {
        case 'all':
          return true;
        case 'today':
          return bookingDateISO === todayISO;
        case 'upcoming':
          return bookingDateISO > todayISO;
        default:
          return bookingDateISO >= todayISO;
      }
    });
  };

  const filteredBookings = getFilteredBookings();

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
        <div className="flex items-center">
          <i className="fas fa-th-list text-gray-600 mr-2"></i>
          <span className="text-sm font-semibold text-gray-700">
            {dateFilter === 'all' ? 'All Bookings' : dateFilter === 'today' ? "Today's Bookings" : 'Upcoming Bookings'}
          </span>
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
                              RUSH BOOKING
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
                    <div className="font-medium">
                      {BookingUtilService.formatDate(booking.date)}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-gray-500">
                        {BookingUtilService.getSessionType(booking.time)}
                      </span>
                      {BookingUtilService.isPastDue(booking) && (
                        <span className="text-xs text-red-600 font-medium">Past Due</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${BookingUtilService.getStatusBadgeStyle(booking.status)}`}>
                      <i className={`${BookingUtilService.getStatusIcon(booking.status)} text-xs mr-1`}></i>
                      {BookingUtilService.getFormattedStatus(booking.status)}
                    </span>
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

export default BookingsTable;
