'use client';

import React from 'react';

interface FilterBarProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  barberFilter: string;
  setBarberFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  uniqueBarbers: string[];
  dateFilter: string;
  setDateFilter: (value: string) => void;
  todayCount: number;
  pastCount: number;
  upcomingCount: number;
}

const FilterBar = ({
  statusFilter,
  setStatusFilter,
  barberFilter,
  setBarberFilter,
  searchQuery,
  setSearchQuery,
  uniqueBarbers,
  dateFilter,
  setDateFilter,
  todayCount,
  pastCount,
  upcomingCount
}: FilterBarProps) => {
  const handleReset = () => {
    setStatusFilter('all');
    setBarberFilter('all');
    setSearchQuery('');
    setDateFilter('today');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="flex flex-wrap items-center p-3 gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-gray-400 text-sm"></i>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            placeholder="Search by client or service..."
          />
          {searchQuery && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              onClick={() => setSearchQuery('')}
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
            </div>
          </div>

          <div className="relative">
            <select
              value={barberFilter}
              onChange={(e) => setBarberFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            >
              <option value="all">All Barbers</option>
              {uniqueBarbers.map(barber => (
                <option key={barber} value={barber}>{barber}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
            </div>
          </div>

          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            >
              <option value="all">All Bookings ({todayCount + pastCount + upcomingCount})</option>
              <option value="today">Today's Bookings ({todayCount})</option>
              <option value="upcoming">Upcoming Bookings ({upcomingCount})</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
            </div>
          </div>

          {(statusFilter !== 'all' || barberFilter !== 'all' || searchQuery || dateFilter !== 'today') && (
            <button
              onClick={handleReset}
              className="p-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              title="Reset Filters"
            >
              <i className="fas fa-undo"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
