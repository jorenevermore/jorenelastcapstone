'use client';

import React from 'react';
import type { Booking } from '../../../../lib/services/appointment/BaseAppointmentService';
import { BookingUtilService } from '../../../../lib/services/booking/BookingUtilService';

interface CancellationReasonsProps {
  bookings: Booking[];
}

const CancellationReasons: React.FC<CancellationReasonsProps> = ({ bookings }) => {
  // Get cancelled bookings with reasons
  const cancelledBookings = bookings
    .filter(b => b.status === 'cancelled' && (b.barberReason || b.reason))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Count reasons
  const reasonCounts: { [key: string]: number } = {};
  cancelledBookings.forEach(booking => {
    const reason = booking.barberReason || booking.reason || 'No reason provided';
    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
  });

  const sortedReasons = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1]);

  if (cancelledBookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-base font-medium text-gray-700 mb-4">Cancellation Reasons</h3>
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-check-circle text-3xl text-green-500 mb-2 block"></i>
          <p>No cancelled appointments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-base font-medium text-gray-700 mb-4">Cancellation Reasons</h3>
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-3">Recent Cancellations</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {cancelledBookings.slice(0, 10).map(booking => {
            const cancellationInfo = BookingUtilService.getCancellationInfo(booking);
            return cancellationInfo ? (
              <div key={booking.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.clientName}</p>
                    <p className="text-xs text-gray-500">{booking.serviceOrdered} - {booking.styleOrdered}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {cancellationInfo.timestamp}
                  </span>
                </div>
                <p className="text-xs text-red-600 mt-2">
                  <i className="fas fa-times-circle mr-1"></i>
                  {cancellationInfo.reason}
                </p>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
};

export default CancellationReasons;

