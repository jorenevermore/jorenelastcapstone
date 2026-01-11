import { useState, useCallback } from 'react';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import { StaffManagementService } from '../services/staff/StaffManagementService';
import type { Barber } from '../../types';

export type { Barber } from '../../types';

const staffService = new StaffManagementService(db);

export interface UseStaffReturn {
  getBarbersFromBarbershop: (barbershopId: string) => Promise<Barber[]>;
  getBarberById: (barberId: string) => Promise<Barber>;
  addBarberToBarbershop: (barbershopId: string, barberData: Omit<Barber, 'barberId'>) => Promise<Barber>;
  removeBarberFromBarbershop: (barbershopId: string, barberId: string) => Promise<void>;
  updateBarber: (barberId: string, barberData: Partial<Omit<Barber, 'barberId'>>) => Promise<void>;
  deleteBarber: (barberId: string) => Promise<void>;
  getPendingAffiliations: (barbershopId: string) => Promise<Barber[]>;
  updateAffiliationStatus: (barberId: string, status: 'approved' | 'rejected') => Promise<void>;
  subscribeToPendingAffiliations: (barbershopId: string, onUpdate: (barbers: Barber[]) => void,
   onError?: (error: Error) => void
  ) => Unsubscribe;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useStaff(): UseStaffReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBarbersFromBarbershop = useCallback(async (barbershopId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await staffService.getBarbersFromBarbershop(barbershopId, );
    } catch (error: any) {
      setError(error?.message ?? 'Failed to fetch barbers');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBarberById = useCallback(async (barberId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await staffService.getBarberById(barberId);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch barber');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addBarberToBarbershop = useCallback(async (barbershopId: string, barberData: Omit<Barber, 'barberId'>) => {
    setIsLoading(true);
    setError(null);
    try {
      return await staffService.addBarberToBarbershop(barbershopId, barberData);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to add barber');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeBarberFromBarbershop = useCallback(async (barbershopId: string, barberId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await staffService.removeBarberFromBarbershop(barbershopId, barberId);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to remove barber');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBarber = useCallback(async (barberId: string, barberData: Partial<Omit<Barber, 'barberId'>>) => {
    setIsLoading(true);
    setError(null);
    try {
      await staffService.updateBarber(barberId, barberData);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update barber');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBarber = useCallback(async (barberId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await staffService.deleteBarber(barberId);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to delete barber');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPendingAffiliations = useCallback(async (barbershopId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await staffService.getPendingAffiliations(barbershopId);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch pending affiliations');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAffiliationStatus = useCallback(async (barberId: string, status: 'approved' | 'rejected') => {
    setIsLoading(true);
    setError(null);
    try {
      await staffService.updateAffiliationStatus(barberId, status);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update affiliation status');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const subscribeToPendingAffiliations = useCallback(
    (barbershopId: string, onUpdate: (barbers: Barber[]) => void, onError?: (error: Error) => void): Unsubscribe => {
      return staffService.subscribeToPendingAffiliations(barbershopId, onUpdate, onError);
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    getBarbersFromBarbershop,
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
