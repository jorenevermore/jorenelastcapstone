import { useState, useCallback } from 'react';
import { db } from '../firebase';
import { BarberAvailabilityService } from '../services/staff/BarberAvailabilityService';
import type { UnavailableDate } from '../../types';

export type { UnavailableDate };

const availabilityService = new BarberAvailabilityService(db);

export interface UseBarberAvailabilityReturn {
  isLoading: boolean;
  error: string | null;
  addUnavailableDate: (barberId: string, date: string) => Promise<UnavailableDate>;
  removeUnavailableDate: (dateId: string) => Promise<void>;
  getUnavailableDates: (barberId: string) => Promise<UnavailableDate[]>;
  isBarberUnavailable: (barberId: string, date: string) => Promise<boolean>;
  clearError: () => void;
}

export function useBarberAvailability(): UseBarberAvailabilityReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addUnavailableDate = useCallback(async (barberId: string, date: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newDate = await availabilityService.addUnavailableDate(barberId, date);
      return newDate;
    } catch (e: any) {
      setError(e?.message ?? 'Failed to add unavailable date');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeUnavailableDate = useCallback(async (dateId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await availabilityService.removeUnavailableDate(dateId);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to remove unavailable date');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUnavailableDates = useCallback(async (barberId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const dates = await availabilityService.getUnavailableDates(barberId);
      return dates;
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch unavailable dates');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isBarberUnavailable = useCallback(async (barberId: string, date: string) => {
    try {
      return await availabilityService.isBarberUnavailable(barberId, date);
    } catch (e) {
      console.error('Error checking barber availability:', e);
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    addUnavailableDate,
    removeUnavailableDate,
    getUnavailableDates,
    isBarberUnavailable,
    clearError
  };
}

