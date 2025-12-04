'use client';

import React from 'react';
import { Booking } from '../types';
import { QueueService } from '../../../../lib/services/queue/QueueService';

interface QueueStatsProps {
  bookings: Booking[];
}

const QueueStats = ({ bookings }: QueueStatsProps) => {
  const queueService = new QueueService();

  // Get today's queue statistics
  const stats = queueService.getQueueStats(bookings, true);

  // Get active bookings and sort by queue priority
  const activeBookings = queueService.getActiveBookings(bookings);
  const sortedQueue = queueService.sortByQueuePriority(activeBookings, true);

  // Get top 3 in queue for preview (already sorted, so #1 is first)
  const topInQueue = sortedQueue.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-blue-500 h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
            <i className="fas fa-list-ol text-gray-600 text-sm"></i>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Queue Overview</span>
            <div className="flex items-center text-xs text-gray-500 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              Real-time
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
            <i className="fas fa-bolt text-lg mr-1"></i>
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
            <i className="fas fa-info-circle mr-2"></i>
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
            {topInQueue.map((booking, index) => (
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
                      #{booking.queuePosition}
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0 text-xs font-medium">
                      {booking.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-800 truncate text-xs">{booking.clientName}</span>
                        {booking.isEmergency && (
                          <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 flex-shrink-0">
                            <i className="fas fa-bolt mr-0.5 text-xs"></i> Rush
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 truncate">{booking.serviceOrdered}</div>
                      <div className="text-xs text-gray-400">
                        {booking.barberName}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-gray-500">
                          {(() => {
                            const startTime = booking.time?.split('-')[0]?.trim() || '';
                            const hour = parseInt(startTime.split(':')[0]);
                            const sessionType = hour < 13 ? 'Morning Session' : 'Afternoon Session';
                            const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            });
                            return `${bookingDate} - ${sessionType}`;
                          })()}
                        </span>
                        {(() => {
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

                          const isBookingInPast = bookingDateISO < todayISO;

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
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      booking.status === 'in-progress' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
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

export default QueueStats;

