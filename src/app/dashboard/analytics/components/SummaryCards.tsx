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
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalAppointments,
  completedAppointments,
  canceledAppointments,
  pendingAppointments,
  confirmedAppointments,
  totalRevenue
}) => {
  const { completionRate } = AnalyticsService.calculateRates(
    totalAppointments,
    completedAppointments,
    canceledAppointments
  );
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 w-full">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Total Appointments</p>
            <h3 className="text-3xl font-bold text-gray-900">{totalAppointments}</h3>
          </div>
          <div className="p-3 rounded-lg bg-blue-100">
            <i className="text-lg text-blue-600">
              <i className="fas fa-calendar-check"></i>
            </i>
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-gray-600">
          <span className="font-semibold text-gray-700">{pendingAppointments}</span>
          <span className="mx-1">pending</span>
          <span className="mx-1">•</span>
          <span className="font-semibold text-gray-700">{confirmedAppointments}</span>
          <span className="mx-1">confirmed</span>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Completion Rate</p>
            <h3 className="text-3xl font-bold text-gray-900">{completionRate}%</h3>
          </div>
          <div className="p-3 rounded-lg bg-emerald-100">
            <i className="text-lg text-emerald-600">
              <i className="fas fa-check-circle"></i>
            </i>
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-gray-600">
          <span className="font-semibold text-gray-700">{completedAppointments}</span>
          <span className="mx-1">completed</span>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Total Revenue</p>
            <h3 className="text-3xl font-bold text-gray-900">₱{totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="p-3 rounded-lg bg-purple-100">
            <i className="text-lg text-purple-600">
              <i className="fas fa-coins"></i>
            </i>
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-gray-600">
          <span>From</span>
          <span className="mx-1 font-semibold text-gray-700">{completedAppointments}</span>
          <span>completed</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
