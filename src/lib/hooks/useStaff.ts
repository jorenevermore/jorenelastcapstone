
import { useState, useCallback } from 'react';
import { Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import { StaffManagementService } from '../services/staff/StaffManagementService';
import type { Barber, ServiceResponse } from '../../types';

export type { Barber } from '../../types';

const staffService = new StaffManagementService(db);

export interface UseStaffReturn {
  getBarbersByBarbershopId: (barbershopId: string) => Promise<ServiceResponse>;
  getBarberById: (barberId: string) => Promise<ServiceResponse>;
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

  const getBarbersByBarbershopId = useCallback(async (barbershopId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.getBarbersByBarbershopId(barbershopId);
      if (!result.success && result.message) setError(result.message);
      return result;
    } catch (error) {
      setError('Failed to fetch barbers');
      return { success: false, message: 'Failed to fetch barbers' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBarberById = useCallback(async (barberId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.getBarberById(barberId);
      if (!result.success && result.message) setError(result.message);
      return result;
    } catch (error) {
      setError('Failed to fetch barber');
      return { success: false, message: 'Failed to fetch barber' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addBarberToBarbershop = useCallback(async (barbershopId: string, barberData: Omit<Barber, 'barberId'>): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.addBarberToBarbershop(barbershopId, barberData);
      if (!result.success && result.message) setError(result.message);
      return result;
    } catch (error) {
      setError('Failed to add barber to barbershop');
      return { success: false, message: 'Failed to add barber to barbershop' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeBarberFromBarbershop = useCallback(async (barbershopId: string, barberId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.removeBarberFromBarbershop(barbershopId, barberId);
      if (!result.success && result.message) setError(result.message);
      return result;
    } catch (error) {
      setError('Failed to remove barber from barbershop');
      return { success: false, message: 'Failed to remove barber from barbershop' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBarber = useCallback(async (barberId: string, barberData: Partial<Omit<Barber, 'barberId'>>): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.updateBarber(barberId, barberData);
      if (!result.success && result.message) setError(result.message);
      return result;
    } catch (error) {
      setError('Failed to update barber');
      return { success: false, message: 'Failed to update barber' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBarber = useCallback(async (barberId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.deleteBarber(barberId);
      if (!result.success && result.message) setError(result.message);
      return result;
    } catch (error) {
      setError('Failed to delete barber');
      return { success: false, message: 'Failed to delete barber' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPendingAffiliations = useCallback(async (barbershopId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.getPendingAffiliations(barbershopId);
      if (!result.success && result.message) setError(result.message);
      return result;
    } catch (error) {
      setError('Failed to fetch pending affiliations');
      return { success: false, message: 'Failed to fetch pending affiliations' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAffiliationStatus = useCallback(async (barberId: string, status: 'approved' | 'rejected'): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.updateAffiliationStatus(barberId, status);
      if (!result.success && result.message) setError(result.message);
      return result;
    } catch (error) {
      setError('Failed to update affiliation status');
      return { success: false, message: 'Failed to update affiliation status' };
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
    getBarbersByBarbershopId,
    getBarberById,
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

