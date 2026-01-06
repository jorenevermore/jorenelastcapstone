'use client';

import React from 'react';
import { Barber } from '../../../../lib/hooks/useStaff';
import { UnavailableDate } from '../../../../lib/hooks/useBarberAvailability';

interface UnavailableDatesModalProps {
  isOpen: boolean;
  barber: Barber | null;
  selectedDate: string;
  unavailableDates: UnavailableDate[];
  error: string | null;
  loading: boolean;
  onClose: () => void;
  onDateChange: (date: string) => void;
  onAddDate: () => Promise<void>;
  onRemoveDate: (dateId: string) => Promise<void>;
  onDateChangeWithErrorClear?: (date: string) => void;
}

export default function UnavailableDatesModal({
  isOpen,
  barber,
  selectedDate,
  unavailableDates,
  error,
  loading,
  onClose,
  onDateChange,
  onAddDate,
  onRemoveDate,
  onDateChangeWithErrorClear
}: UnavailableDatesModalProps) {
  if (!isOpen || !barber) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-black">
              Unavailable Dates
            </h2>
            <p className="text-sm text-gray-600 mt-1">{barber.fullName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-4">
              <p>{error}</p>
            </div>
          )}

          {/* Add new unavailable date section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Unavailable Date
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => (onDateChangeWithErrorClear ? onDateChangeWithErrorClear(e.target.value) : onDateChange(e.target.value))}
                min={new Date().toISOString().split('T')[0]}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={onAddDate}
                disabled={loading || !selectedDate}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:bg-gray-300 text-white text-sm font-medium rounded transition-colors"
              >
                {loading ? '...' : '+'}
              </button>
            </div>
          </div>

          {/* List of unavailable dates */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Dates</h3>
            {unavailableDates.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No unavailable dates</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {unavailableDates.map((date: UnavailableDate) => (
                  <div
                    key={date.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm text-gray-900">
                      {new Date(date.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <button
                      onClick={() => onRemoveDate(date.id)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-700 disabled:text-gray-300 transition-colors"
                      title="Remove date"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

