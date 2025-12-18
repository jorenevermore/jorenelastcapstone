'use client';

import React from 'react';
import { AnalyticsService } from '../../../../lib/services/analytics/AnalyticsService';

interface SummaryCardsProps {
  totalAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  totalRevenue: number;
  uniqueCustomers: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalAppointments,
  completedAppointments,
  canceledAppointments,
  pendingAppointments,
  confirmedAppointments,
  totalRevenue,
  uniqueCustomers
}) => {
  const { completionRate, cancellationRate } = AnalyticsService.calculateRates(
    totalAppointments,
    completedAppointments,
    canceledAppointments
  );
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Appointments</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalAppointments}</h3>
          </div>
          <div className="p-2 rounded-lg bg-gray-100">
            <i className="fas fa-calendar-check text-gray-600"></i>
          </div>
        </div>
        <div className="mt-2 flex items-center text-xs">
          <span className="text-gray-500">
            {pendingAppointments} pending • {confirmedAppointments} confirmed
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">Completion Rate</p>
            <h3 className="text-2xl font-bold text-gray-900">{completionRate}%</h3>
          </div>
          <div className="p-2 rounded-lg bg-gray-100">
            <i className="fas fa-check-circle text-gray-600"></i>
          </div>
        </div>
        <div className="mt-2 flex items-center text-xs">
          <span className="text-gray-500">
            {completedAppointments} completed appointments
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">₱{totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="p-2 rounded-lg bg-gray-100">
            <i className="fas fa-coins text-gray-600"></i>
          </div>
        </div>
        <div className="mt-2 flex items-center text-xs">
          <span className="text-gray-500">
            From {completedAppointments} completed appointments
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">Unique Customers</p>
            <h3 className="text-2xl font-bold text-gray-900">{uniqueCustomers}</h3>
          </div>
          <div className="p-2 rounded-lg bg-gray-100">
            <i className="fas fa-users text-gray-600"></i>
          </div>
        </div>
        <div className="mt-2 flex items-center text-xs">
          <span className="text-gray-500">
            {cancellationRate}% cancellation rate
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
