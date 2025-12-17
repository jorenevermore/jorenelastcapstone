
import { useState, useCallback } from 'react';
import { db } from '../firebase';
import { GlobalServiceManagement } from '../services/service/GlobalServiceManagement';
import type { ServiceResponse, CreateGlobalServiceInput, UpdateGlobalServiceInput } from '../../types';

const serviceManagement = new GlobalServiceManagement(db);

export interface UseGlobalServicesReturn {
  createService: (input: CreateGlobalServiceInput) => Promise<ServiceResponse>;
  updateService: (serviceId: string, input: UpdateGlobalServiceInput) => Promise<ServiceResponse>;
  deleteService: (serviceId: string) => Promise<ServiceResponse>;
  getAllServices: () => Promise<ServiceResponse>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useGlobalServices(): UseGlobalServicesReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createService = useCallback(async (input: CreateGlobalServiceInput): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await serviceManagement.createService(input);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create service';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'CREATE_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateService = useCallback(async (serviceId: string, input: UpdateGlobalServiceInput): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await serviceManagement.updateService(serviceId, input);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update service';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'UPDATE_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteService = useCallback(async (serviceId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await serviceManagement.deleteService(serviceId);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete service';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'DELETE_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllServices = useCallback(async (): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await serviceManagement.getAllServices();
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch services';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'FETCH_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createService,
    updateService,
    deleteService,
    getAllServices,
    isLoading,
    error,
    clearError
  };
}

