import { useState } from 'react';
import { Barber } from './useStaff';
import { UnavailableDate } from './useBarberAvailability';

export const useUnavailableDatesModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openModal = (barber: Barber) => {
    setSelectedBarber(barber);
    setShowModal(true);
    setSelectedDate('');
    setError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBarber(null);
    setSelectedDate('');
    setError(null);
    setUnavailableDates([]);
  };

  const setSelectedDateWithErrorClear = (date: string) => {
    setSelectedDate(date);
    setError(null);
  };

  const addDate = (date: UnavailableDate) => {
    setUnavailableDates([...unavailableDates, date]);
  };

  const removeDate = (dateId: string) => {
    setUnavailableDates(unavailableDates.filter(d => d.id !== dateId));
  };

  // Validate date - must be today or in the future, and not a duplicate
  const validateDate = (dateString: string): { valid: boolean; message?: string } => {
    if (!dateString) {
      return { valid: false, message: 'Please select a date' };
    }

    const selectedDateObj = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDateObj.setHours(0, 0, 0, 0);

    // Check if date is in the past
    if (selectedDateObj < today) {
      return { valid: false, message: 'Cannot add past dates. Please select today or a future date.' };
    }

    // Check for duplicates
    const isDuplicate = unavailableDates.some(d => {
      const existingDate = new Date(d.date);
      existingDate.setHours(0, 0, 0, 0);
      return existingDate.getTime() === selectedDateObj.getTime();
    });

    if (isDuplicate) {
      return { valid: false, message: 'This date is already marked as unavailable.' };
    }

    return { valid: true };
  };

  return {
    // State
    showModal,
    selectedBarber,
    selectedDate,
    unavailableDates,
    error,
    loading,
    // Setters
    setShowModal,
    setSelectedBarber,
    setSelectedDate,
    setUnavailableDates,
    setError,
    setLoading,
    // Methods
    openModal,
    closeModal,
    addDate,
    removeDate,
    validateDate,
    setSelectedDateWithErrorClear
  };
};

