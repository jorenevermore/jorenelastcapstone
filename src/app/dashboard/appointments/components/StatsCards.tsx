'use client';

import React from 'react';
import { Booking } from '../types';

interface StatsCardsProps {
  bookings: Booking[];
}

const StatsCards = ({ bookings }: StatsCardsProps) => {
  // Calculate statistics
  const getStatistics = () => {
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const inProgress = bookings.filter(b => b.status === 'in-progress').length;
    const canceled = bookings.filter(b => b.status === 'cancelled').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const noShow = bookings.filter(b => b.status === 'no-show').length;
    const total = bookings.length;

    // Calculate today's appointments
    const today = new Date().toDateString();
    const todayTotal = bookings.filter(b => new Date(b.date).toDateString() === today).length;

    return {
      pending,
      confirmed,
      inProgress,
      canceled,
      completed,
      noShow,
      total,
      todayTotal
    };
  };

  const stats = getStatistics();

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center">
          <i className="fas fa-chart-pie text-gray-400 mr-2"></i>
          <span className="text-sm font-medium text-gray-700">Statistics</span>
        </div>
        <div className="text-sm text-gray-500">
          <span className="font-medium text-black">{stats.total}</span> Total
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-0 divide-x divide-gray-100">
        <StatItem
          label="Pending"
          value={stats.pending}
          color="bg-yellow-500"
          icon="fas fa-clock"
        />

        <StatItem
          label="Confirmed"
          value={stats.confirmed}
          color="bg-blue-500"
          icon="fas fa-check-circle"
        />

        <StatItem
          label="In Progress"
          value={stats.inProgress}
          color="bg-purple-500"
          icon="fas fa-spinner"
        />

        <StatItem
          label="Completed"
          value={stats.completed}
          color="bg-green-500"
          icon="fas fa-check-double"
        />

        <StatItem
          label="Canceled"
          value={stats.canceled}
          color="bg-red-500"
          icon="fas fa-times-circle"
        />

        <StatItem
          label="No-Show"
          value={stats.noShow}
          color="bg-gray-500"
          icon="fas fa-user-slash"
        />

        <StatItem
          label="Today"
          value={stats.todayTotal}
          color="bg-teal-500"
          icon="fas fa-calendar-day"
          colSpan={2}
        />
      </div>
    </div>
  );
};

interface StatItemProps {
  label: string;
  value: number;
  color: string;
  icon: string;
  colSpan?: number;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, color, icon, colSpan = 1 }) => {
  return (
    <div className={`py-3 px-3 flex items-center ${colSpan > 1 ? 'col-span-2' : ''}`}>
      <div className={`w-8 h-8 rounded-full ${color} bg-opacity-15 flex items-center justify-center mr-3 flex-shrink-0`}>
        <i className={`${icon} ${color.replace('bg-', 'text-')}`}></i>
      </div>
      <div>
        <div className="text-xl font-bold">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
};

export default StatsCards;
