import { useState, useCallback } from 'react';
import { db } from '../firebase';
import { BarberAvailabilityService } from '../services/staff/BarberAvailabilityService';
import type { ServiceResponse, UnavailableDate } from '../../types';

export type { UnavailableDate };

const availabilityService = new BarberAvailabilityService(db);

export interface UseBarberAvailabilityReturn {
  unavailableDates: UnavailableDate[];
  isLoading: boolean;
  error: string | null;
  addUnavailableDate: (barberId: string, date: string) => Promise<ServiceResponse>;
  removeUnavailableDate: (dateId: string) => Promise<ServiceResponse>;
  getUnavailableDates: (barberId: string) => Promise<ServiceResponse>;
  isBarberUnavailable: (barberId: string, date: string) => Promise<boolean>;
  clearError: () => void;
}

export function useBarberAvailability(): UseBarberAvailabilityReturn {
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addUnavailableDate = useCallback(async (barberId: string, date: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await availabilityService.addUnavailableDate(barberId, date);
      if (result.success && result.data) {
        setUnavailableDates(prev => [...prev, result.data as UnavailableDate]);
      } else if (result.message) {
        setError(result.message);
      }
      return result;
    } catch (error) {
      const errorMsg = 'Failed to add unavailable date';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeUnavailableDate = useCallback(async (dateId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await availabilityService.removeUnavailableDate(dateId);
      if (result.success) {
        setUnavailableDates(prev => prev.filter(d => d.id !== dateId));
      } else if (result.message) {
        setError(result.message);
      }
      return result;
    } catch (error) {
      const errorMsg = 'Failed to remove unavailable date';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUnavailableDates = useCallback(async (barberId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await availabilityService.getUnavailableDates(barberId);
      if (result.success && result.data) {
        setUnavailableDates(result.data as UnavailableDate[]);
      } else if (result.message) {
        setError(result.message);
      }
      return result;
    } catch (error) {
      const errorMsg = 'Failed to fetch unavailable dates';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isBarberUnavailable = useCallback(async (barberId: string, date: string): Promise<boolean> => {
    try {
      return await availabilityService.isBarberUnavailable(barberId, date);
    } catch (error) {
      console.error('Error checking barber availability:', error);
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    unavailableDates,
    isLoading,
    error,
    addUnavailableDate,
    removeUnavailableDate,
    getUnavailableDates,
    isBarberUnavailable,
    clearError
  };
}

