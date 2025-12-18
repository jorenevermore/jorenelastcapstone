
import { useState, useCallback } from 'react';
import { db } from '../firebase';
import { BarbershopService } from '../services/barbershop/BarbershopService';
import type { ServiceResponse, CreateBarbershopInput, UpdateBarbershopInput } from '../../types';

const barbershopService = new BarbershopService(db);

export interface UseBarbershopReturn {
  createProfile: (input: CreateBarbershopInput) => Promise<ServiceResponse>;
  getProfile: (barbershopId: string) => Promise<ServiceResponse>;
  updateProfile: (barbershopId: string, input: UpdateBarbershopInput) => Promise<ServiceResponse>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useBarbershop(): UseBarbershopReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProfile = useCallback(async (input: CreateBarbershopInput): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await barbershopService.createProfile(input);

      if (!result.success && result.message) {
        setError(result.message);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProfile = useCallback(async (barbershopId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await barbershopService.getProfile(barbershopId);

      if (!result.success && result.message) {
        setError(result.message);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (barbershopId: string, input: UpdateBarbershopInput): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await barbershopService.updateProfile(barbershopId, input);

      if (!result.success && result.message) {
        setError(result.message);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createProfile,
    getProfile,
    updateProfile,
    isLoading,
    error,
    clearError
  };
}

