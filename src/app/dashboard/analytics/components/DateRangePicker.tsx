
'use client';

import React, { useState } from 'react';
import { formatDateLong } from '../../../../lib/utils/dateParser';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (startDate: Date, endDate: Date) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date) => {
    return formatDateLong(date.toISOString());
  };

  const handleRangeSelect = (days: number) => {
    let end = new Date();
    let start = new Date();
    start.setDate(end.getDate() - days);

    onChange(start, end);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <i className="fas fa-calendar-alt text-gray-400"></i>
        <span className="text-gray-600">{formatDate(startDate)} - {formatDate(endDate)}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-gray-400 ml-auto`}></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
          <div className="py-2">
            <button
              onClick={() => handleRangeSelect(7)}
              className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              Last 7 days
            </button>
            <button
              onClick={() => handleRangeSelect(30)}
              className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              Last 30 days
            </button>
            <button
              onClick={() => handleRangeSelect(90)}
              className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              Last 90 days
            </button>
            <button
              onClick={() => handleRangeSelect(365)}
              className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              Last 12 months
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
