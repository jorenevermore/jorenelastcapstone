'use client';

import React from 'react';
import type { Booking } from '../../../../lib/services/appointment/BaseAppointmentService';

interface CustomerRetentionProps {
  bookings: Booking[];
}

const CustomerRetention: React.FC<CustomerRetentionProps> = ({ bookings }) => {
  // Group bookings by client
  const bookingsByClient = bookings.reduce<Record<string, Booking[]>>((acc, booking) => {
    const clientId = booking.clientId || booking.clientName;
    if (!acc[clientId]) {
      acc[clientId] = [];
    }
    acc[clientId].push(booking);
    return acc;
  }, {});

  // Calculate customer metrics
  const totalCustomers = Object.keys(bookingsByClient).length;
  const repeatCustomers = Object.values(bookingsByClient).filter(bookings => bookings.length > 1).length;
  const oneTimeCustomers = totalCustomers - repeatCustomers;

  // Calculate repeat customer rate
  const repeatRate = totalCustomers > 0
    ? Math.round((repeatCustomers / totalCustomers) * 100)
    : 0;

  // Find top customers
  const topCustomers = Object.entries(bookingsByClient)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5)
    .map(([clientId, bookings]) => ({
      name: bookings[0].clientName,
      count: bookings.length,
      lastVisit: new Date(Math.max(...bookings.map(b => new Date(b.date).getTime()))),
    }));
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-700">Customer Retention</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Total Customers</div>
          <div className="text-lg font-bold">{totalCustomers}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Repeat Customers</div>
          <div className="text-lg font-bold">{repeatCustomers}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Repeat Rate</div>
          <div className="text-lg font-bold">{repeatRate}%</div>
        </div>
      </div>
      
      <h4 className="text-sm font-medium text-gray-700 mb-2">Top Customers</h4>
      <div className="space-y-2">
        {topCustomers.map((customer, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div>
              <div className="font-medium text-sm">{customer.name}</div>
              <div className="text-xs text-gray-500">
                Last visit: {customer.lastVisit.toLocaleDateString()}
              </div>
            </div>
            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {customer.count} visits
            </div>
          </div>
        ))}
        
        {topCustomers.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No customer data available
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerRetention;
