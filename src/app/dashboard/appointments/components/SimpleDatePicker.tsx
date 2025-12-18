'use client';

import React from 'react';
import { formatDateLong } from '../../../../lib/utils/dateParser';

interface SimpleDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const SimpleDatePicker: React.FC<SimpleDatePickerProps> = ({ selectedDate, onDateChange }) => {
  const formatDate = (date: Date) => {
    const isoString = date.toISOString();
    const formatted = formatDateLong(isoString);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    return `${weekday}, ${formatted}`;
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="flex items-center">
      <button
        onClick={goToPreviousDay}
        className="p-1 hover:bg-gray-100 rounded text-gray-500"
        title="Previous Day"
      >
        <i className="fas fa-chevron-left text-xs"></i>
      </button>

      <div className="flex items-center mx-2">
        <button
          onClick={goToToday}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium
            ${isToday(selectedDate) ? 'bg-black text-white' : 'border border-gray-300 hover:bg-gray-100'}`}
          title={formatDate(selectedDate)}
        >
          {selectedDate.getDate()}
        </button>
      </div>

      <button
        onClick={goToNextDay}
        className="p-1 hover:bg-gray-100 rounded text-gray-500"
        title="Next Day"
      >
        <i className="fas fa-chevron-right text-xs"></i>
      </button>
    </div>
  );
};

export default SimpleDatePicker;
