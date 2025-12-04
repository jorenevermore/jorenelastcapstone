'use client';

import React from 'react';
import { Booking } from '../types';
import { StatusService } from '../../../../lib/services/status/StatusService';

interface AppointmentInfoCardsProps {
  appointment: Booking;
  clientDetails: {
    phoneNumber?: string;
    address?: string;
    email?: string;
    photo?: string;
  } | null;
  onChatClick?: () => void;
}

export const AppointmentInfoCards = ({ appointment, clientDetails, onChatClick }: AppointmentInfoCardsProps) => {
  const statusService = new StatusService();
  const dateIndicator = statusService.getDateIndicator(appointment.date);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
      {/* Top Section: Photo, Name, Status, Chat */}
      <div className="flex items-start justify-between mb-5 pb-5 border-b border-gray-100">
        <div className="flex items-start gap-4 flex-1">
          {/* Client Photo */}
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {clientDetails?.photo ? (
              <img
                src={clientDetails.photo}
                alt={appointment.clientName}
                className="w-full h-full object-cover"
              />
            ) : (
              <i className="fas fa-user text-white text-2xl"></i>
            )}
          </div>

          {/* Client Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{appointment.clientName}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${dateIndicator.color}`}>
                {dateIndicator.label}
              </span>
            </div>
          </div>
        </div>

        {/* Chat Icon */}
        {onChatClick && (
          <button
            onClick={onChatClick}
            className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center flex-shrink-0"
            title="Messages"
          >
            <i className="fas fa-comments text-sm"></i>
          </button>
        )}
      </div>

      {/* Main Content: 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Client Info */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Client</h3>
          {clientDetails?.phoneNumber && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Phone</p>
              <p className="text-sm font-medium text-gray-900">{clientDetails.phoneNumber}</p>
            </div>
          )}
          {clientDetails?.email && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Email</p>
              <p className="text-sm font-medium text-gray-900 truncate">{clientDetails.email}</p>
            </div>
          )}
          {(clientDetails?.address || appointment.location?.streetName) && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Address</p>
              <p className="text-sm font-medium text-gray-900">{clientDetails?.address || appointment.location?.streetName}</p>
            </div>
          )}
        </div>

        {/* Service Info */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Service</h3>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Type</p>
            <p className="text-sm font-medium text-gray-900">{appointment.serviceOrdered}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Style</p>
            <p className="text-sm font-medium text-gray-900">{appointment.styleOrdered}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Barber</p>
            <p className="text-sm font-medium text-gray-900">{appointment.barberName}</p>
          </div>
        </div>

        {/* Schedule & Payment */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Schedule & Payment</h3>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Session</p>
            <p className="text-sm font-medium text-gray-900">
              {(() => {
                const startTime = appointment.time?.split('-')[0]?.trim() || '';
                const hour = parseInt(startTime.split(':')[0]);
                return hour < 13 ? 'Morning' : 'Afternoon';
              })()} ({appointment.time})
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Final Price</p>
            <p className="text-sm font-bold text-green-700">₱{(appointment.finalPrice || appointment.totalPrice - (appointment.discountAmount || 0)).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Payment Method</p>
            <p className="text-sm font-medium text-gray-900 capitalize">{appointment.paymentMethod || 'N/A'}</p>
          </div>
          {appointment.paymentStatus === 'paid' && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Payment Status</p>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <i className="fas fa-check-circle mr-1"></i>
                Paid
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Payment Summary */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
        <div className="flex gap-4">
          <div>
            <p className="text-gray-500 mb-0.5">Total</p>
            <p className="font-semibold text-gray-900">₱{appointment.totalPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-0.5">Discount</p>
            <p className="font-semibold text-gray-900">₱{(appointment.discountAmount || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-500 mb-0.5">Placed On</p>
          <p className="font-semibold text-gray-900">
            {appointment.createdAt ? new Date(parseInt(appointment.createdAt)).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

