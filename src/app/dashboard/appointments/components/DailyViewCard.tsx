'use client';

import React, { useState } from 'react';
import SimpleDatePicker from './SimpleDatePicker';
import { Booking } from '../types';
import { BookingUtilService } from '../../../../lib/services/booking/BookingUtilService';

interface DailyViewCardProps {
  todayBookings: Booking[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

type StatusFilter = 'all' | 'pending' | 'ongoing' | 'completed';

const DailyViewCard = ({
  todayBookings,
  selectedDate,
  onDateChange
}: DailyViewCardProps) => {
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // filter bookings based on active tab
  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'pending':
        return todayBookings.filter(b => b.status === 'pending');
      case 'ongoing':
        return todayBookings.filter(b => ['confirmed', 'in-progress'].includes(b.status));
      case 'completed':
        return todayBookings.filter(b => ['completed', 'completedAndReviewed', 'cancelled', 'declined', 'no-show'].includes(b.status));
      default:
        return todayBookings;
    }
  };

  const filteredBookings = getFilteredBookings();

  // count bookings by status
  const pendingCount = todayBookings.filter(b => b.status === 'pending').length;
  const ongoingCount = todayBookings.filter(b => ['confirmed', 'in-progress'].includes(b.status)).length;
  const completedCount = todayBookings.filter(b => ['completed', 'cancelled', 'declined', 'no-show'].includes(b.status)).length;



  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <i className="fas fa-calendar-day text-gray-400 mr-2 text-sm"></i>
            <span className="text-xs font-medium text-gray-600">Daily View</span>
          </div>
          <SimpleDatePicker selectedDate={selectedDate} onDateChange={onDateChange} />
        </div>
        <div className="text-xs text-gray-500">
          {formattedDate}
        </div>
        <div className="mt-2">
          <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
            {todayBookings.length} appointment{todayBookings.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex gap-1 flex-shrink-0">
        <button
          onClick={() => setActiveTab('all')}
          className="px-3 py-1.5 text-xs font-medium rounded transition-colors text-white"
          style={{
            backgroundColor: activeTab === 'all' ? '#BF8F63' : 'white',
            color: activeTab === 'all' ? 'white' : '#374151',
            border: activeTab === 'all' ? 'none' : '1px solid #E5E7EB'
          }}
        >
          All ({todayBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className="px-3 py-1.5 text-xs font-medium rounded transition-colors"
          style={{
            backgroundColor: activeTab === 'pending' ? '#BF8F63' : 'white',
            color: activeTab === 'pending' ? 'white' : '#374151',
            border: activeTab === 'pending' ? 'none' : '1px solid #E5E7EB'
          }}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('ongoing')}
          className="px-3 py-1.5 text-xs font-medium rounded transition-colors"
          style={{
            backgroundColor: activeTab === 'ongoing' ? '#BF8F63' : 'white',
            color: activeTab === 'ongoing' ? 'white' : '#374151',
            border: activeTab === 'ongoing' ? 'none' : '1px solid #E5E7EB'
          }}
        >
          Ongoing ({ongoingCount})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className="px-3 py-1.5 text-xs font-medium rounded transition-colors"
          style={{
            backgroundColor: activeTab === 'completed' ? '#BF8F63' : 'white',
            color: activeTab === 'completed' ? 'white' : '#374151',
            border: activeTab === 'completed' ? 'none' : '1px solid #E5E7EB'
          }}
        >
          Completed ({completedCount})
        </button>
      </div>

      <div className="p-3 flex-1 overflow-hidden flex flex-col">
        {filteredBookings.length > 0 ? (
          <div className="space-y-2 overflow-y-auto flex-1">
            {filteredBookings.map(booking => (
              <div
                key={booking.id}
                className={`border rounded p-2 hover:bg-gray-50 cursor-pointer transition-colors ${
                  booking.isEmergency
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
                onClick={() => window.location.href = `/dashboard/appointments/${booking.id}`}
              >
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0 text-xs">
                    {booking.clientName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 text-xs truncate">{booking.clientName}</div>
                    <div className="text-xs text-gray-500 truncate">{booking.serviceOrdered}</div>
                    {booking.isEmergency && (
                      <div className="text-xs text-red-600 font-medium flex items-center mt-0.5">
                        <i className="fas fa-bolt mr-0.5 text-xs"></i> Rush
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-gray-500">
                      {BookingUtilService.getSessionType(booking.time)}
                    </span>
                    {BookingUtilService.isPastDue(booking) && (
                      <span className="text-xs text-red-600 font-medium">Past Due</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end text-xs mt-1.5 pt-1.5 border-t border-gray-100">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${BookingUtilService.getStatusBadgeStyle(booking.status)}`}>
                    <i className={`${BookingUtilService.getStatusIcon(booking.status)} mr-0.5 text-xs`}></i>
                    {BookingUtilService.getFormattedStatus(booking.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 flex-1 flex flex-col items-center justify-center">
            <div className="text-3xl mb-2"><i className="far fa-calendar-check"></i></div>
            <p className="font-medium mb-1">
              {activeTab === 'all' ? 'No appointments for this day' : `No ${activeTab} appointments`}
            </p>
            <p className="text-xs">
              {activeTab === 'all' ? 'Select another date to view appointments' : `Try selecting a different tab`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyViewCard;
