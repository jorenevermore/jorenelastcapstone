'use client';

import React from 'react';
import { Barber } from '../../../../lib/hooks/useStaff';

interface BarbersTableProps {
  barbers: Barber[];
  loading: boolean;
  onEdit: (barber: Barber) => void;
  onDelete: (barber: Barber) => void;
  onOpenUnavailableDates: (barber: Barber) => void;
}

export default function BarbersTable({
  barbers,
  loading,
  onEdit,
  onDelete,
  onOpenUnavailableDates
}: BarbersTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-2"></div>
        <p>Loading barbers...</p>
      </div>
    );
  }

  if (barbers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">No barbers found. Add your first barber to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {barbers.map((barber) => (
              <tr key={barber.barberId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
                      {barber.image ? (
                        <img
                          src={barber.image}
                          alt={barber.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <i className="fas fa-user-alt"></i>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{barber.fullName}</div>
                      <div className="text-sm text-gray-500">{barber.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{barber.contactNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{barber.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    onClick={() => onOpenUnavailableDates(barber)}
                    title="Manage unavailable dates"
                  >
                    <i className="fas fa-calendar-times"></i>
                  </button>
                  <button
                    className="text-gray-600 hover:text-black mr-3"
                    onClick={() => onEdit(barber)}
                    title="Edit barber"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => onDelete(barber)}
                    title="Delete barber"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

