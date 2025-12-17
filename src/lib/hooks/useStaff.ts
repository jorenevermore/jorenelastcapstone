
import { useState, useCallback } from 'react';
import { Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import { StaffManagementService } from '../services/staff/StaffManagementService';
import type { Barber, ServiceResponse } from '../../types';

export type { Barber } from '../../types';

const staffService = new StaffManagementService(db);

export interface UseStaffReturn {
  getAllBarbers: () => Promise<ServiceResponse>;
  getBarbersByBarbershopId: (barbershopId: string) => Promise<ServiceResponse>;
  getBarberById: (barberId: string) => Promise<ServiceResponse>;
  addBarber: (barberData: Omit<Barber, 'barberId'>) => Promise<ServiceResponse>;
  addBarberToBarbershop: (barbershopId: string, barberData: Omit<Barber, 'barberId'>) => Promise<ServiceResponse>;
  removeBarberFromBarbershop: (barbershopId: string, barberId: string) => Promise<ServiceResponse>;
  updateBarber: (barberId: string, barberData: Partial<Omit<Barber, 'barberId'>>) => Promise<ServiceResponse>;
  deleteBarber: (barberId: string) => Promise<ServiceResponse>;
  getPendingAffiliations: (barbershopId: string) => Promise<ServiceResponse>;
  updateAffiliationStatus: (barberId: string, status: 'approved' | 'rejected') => Promise<ServiceResponse>;
  subscribeToPendingAffiliations: (
    barbershopId: string,
    onUpdate: (barbers: Barber[]) => void,
    onError?: (error: Error) => void
  ) => Unsubscribe;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useStaff(): UseStaffReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllBarbers = useCallback(async (): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.getAllBarbers();
      if (!result.success) setError(result.message);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch barbers';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'FETCH_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBarbersByBarbershopId = useCallback(async (barbershopId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.getBarbersByBarbershopId(barbershopId);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch barbers';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'FETCH_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBarberById = useCallback(async (barberId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.getBarberById(barberId);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch barber';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'FETCH_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addBarber = useCallback(async (barberData: Omit<Barber, 'barberId'>): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.addBarber(barberData);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add barber';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'ADD_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addBarberToBarbershop = useCallback(async (barbershopId: string, barberData: Omit<Barber, 'barberId'>): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.addBarberToBarbershop(barbershopId, barberData);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add barber to barbershop';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'ADD_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeBarberFromBarbershop = useCallback(async (barbershopId: string, barberId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.removeBarberFromBarbershop(barbershopId, barberId);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove barber from barbershop';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'REMOVE_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBarber = useCallback(async (barberId: string, barberData: Partial<Omit<Barber, 'barberId'>>): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.updateBarber(barberId, barberData);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update barber';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'UPDATE_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBarber = useCallback(async (barberId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.deleteBarber(barberId);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete barber';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'DELETE_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPendingAffiliations = useCallback(async (barbershopId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.getPendingAffiliations(barbershopId);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pending affiliations';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'FETCH_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAffiliationStatus = useCallback(async (barberId: string, status: 'approved' | 'rejected'): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.updateAffiliationStatus(barberId, status);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update affiliation status';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'UPDATE_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const subscribeToPendingAffiliations = useCallback((
    barbershopId: string,
    onUpdate: (barbers: Barber[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe => {
    return staffService.subscribeToPendingAffiliations(barbershopId, onUpdate, onError);
  }, []);

  return {
    getAllBarbers,
    getBarbersByBarbershopId,
    getBarberById,
    addBarber,
    addBarberToBarbershop,
    removeBarberFromBarbershop,
    updateBarber,
    deleteBarber,
    getPendingAffiliations,
    updateAffiliationStatus,
    subscribeToPendingAffiliations,
    isLoading,
    error,
    clearError
  };
}

