'use client';

import React, { useMemo } from 'react';
import type { Booking } from '../../../../types/appointments';
import { QueueService } from '../../../../lib/services/queue/QueueService';
import { BookingUtilService } from '../../../../lib/services/booking/BookingUtilService';

interface QueueOverviewCardProps {
  bookings: Booking[];
  isRealtime?: boolean;
}

const QueueOverviewCard = ({ bookings, isRealtime = false }: QueueOverviewCardProps) => {
  const queueService = new QueueService();

  const { stats, sortedQueue } = useMemo(() => {
    const todayISO = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(booking => booking.date.split('T')[0] === todayISO);

    const stats = queueService.getQueueStats(todayBookings);
    const activeBookings = queueService.getActiveBookings(todayBookings);
    const sortedQueue = queueService.sortByQueuePriority(activeBookings);
    return { stats, sortedQueue };
  }, [bookings, queueService]);

  // get top 3 in queue for preview
  const topInQueue = sortedQueue.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center">
          <div>
            <span className="text-sm font-medium text-gray-700">Queue Overview</span>
            <div className="flex items-center text-xs text-gray-500 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isRealtime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
              {isRealtime ? 'Real-time' : 'Cached'}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Total</div>
          <div className="text-lg font-semibold text-gray-700">{stats.totalBookings}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-0 divide-x divide-gray-200 border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-2 text-center bg-white hover:bg-gray-50 transition-colors">
          <div className="text-2xl font-semibold text-red-500 flex items-center justify-center">
            {stats.rushBookings}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Rush
          </div>
        </div>
        <div className="px-4 py-2 text-center bg-white hover:bg-gray-50 transition-colors">
          <div className="text-2xl font-semibold text-blue-500">
            {stats.regularBookings}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Regular
          </div>
        </div>
      </div>
      {stats.rushBookings > 0 && (
        <div className="bg-red-50 border-t border-red-100 px-4 py-2">
          <div className="flex items-center text-xs text-red-700">
            <span>
              <strong>{stats.rushBookings}</strong> rush booking{stats.rushBookings > 1 ? 's' : ''} will be prioritized in the queue
            </span>
          </div>
        </div>
      )}
      {topInQueue.length > 0 && (
        <div className="border-t border-gray-200 flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-1.5 bg-white border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-users text-gray-400 mr-1.5 text-xs"></i>
                <span className="text-xs font-medium text-gray-600">Next in queue</span>
              </div>
              <span className="text-xs text-gray-400">{topInQueue.length}</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
            {topInQueue.map((booking) => (
              <div
                key={booking.id}
                className={`px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer ${
                  booking.isEmergency ? 'bg-red-50/30' : ''
                }`}
                onClick={() => window.location.href = `/dashboard/appointments/${booking.id}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center flex-1 min-w-0 gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                      booking.isEmergency
                        ? 'bg-red-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {booking.queuePosition}
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0 text-xs font-medium">
                      {booking.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-800 truncate text-xs">{booking.clientName}</span>
                        {booking.isEmergency && (
                          <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 flex-shrink-0">
                            Rush
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 truncate">{booking.serviceOrdered}</div>
                      <div className="text-xs text-gray-400">
                        {booking.barberName}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-gray-500">
                          {BookingUtilService.formatBookingDate(booking.date)} - {BookingUtilService.getSessionType(booking.time)}
                        </span>
                        {BookingUtilService.isPastDue(booking) && (
                          <span className="text-xs text-red-600 font-medium">Past Due</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${BookingUtilService.getStatusBadgeStyle(booking.status)}`}>
                      {BookingUtilService.getFormattedStatus(booking.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {sortedQueue.length > 3 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center flex-shrink-0">
              <span className="text-xs text-gray-600">
                +{sortedQueue.length - 3} more in queue
              </span>
            </div>
          )}
        </div>
      )}
      {sortedQueue.length === 0 && (
        <div className="px-4 py-8 text-center border-t border-gray-200 flex-1 flex flex-col items-center justify-center">
          <i className="fas fa-inbox text-gray-300 text-4xl mb-3"></i>
          <p className="text-gray-500 font-medium">No bookings in queue</p>
          <p className="text-xs text-gray-400 mt-1">All bookings are completed or canceled</p>
        </div>
      )}
    </div>
  );
};

export default QueueOverviewCard;

