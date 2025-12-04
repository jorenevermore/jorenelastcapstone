/**
 * Custom Hook: useBarbershopServices
 * Provides barbershop service management functionality
 */

'use client';

import { useState, useCallback } from 'react';
import { db } from '../firebase';
import { BarbershopServiceManagement } from '../services/service/BarbershopServiceManagement';
import { Service, Style } from '../../app/dashboard/services/types';

const serviceManagement = new BarbershopServiceManagement(db);

export interface UseBarbershopServicesReturn {
  services: Service[];
  styles: Style[];
  loading: boolean;
  error: string | null;
  fetchServices: (barbershopId: string) => Promise<void>;
  fetchStyles: (barbershopId: string) => Promise<void>;
  updateServices: (barbershopId: string, services: Service[]) => Promise<boolean>;
  deleteStyle: (styleDocId: string) => Promise<boolean>;
  clearError: () => void;
}

export function useBarbershopServices(): UseBarbershopServicesReturn {
  const [services, setServices] = useState<Service[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async (barbershopId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await serviceManagement.getServices(barbershopId);
      if (result.success) {
        setServices(result.data || []);
      } else {
        setError(result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch services';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStyles = useCallback(async (barbershopId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await serviceManagement.getStyles(barbershopId);
      if (result.success) {
        setStyles(result.data || []);
      } else {
        setError(result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch styles';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateServices = useCallback(async (barbershopId: string, services: any[]): Promise<boolean> => {
    try {
      const result = await serviceManagement.updateServices(barbershopId, services);
      if (result.success) {
        // Re-fetch services after update
        await fetchServices(barbershopId);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update services';
      setError(errorMessage);
      return false;
    }
  }, [fetchServices]);

  const deleteStyle = useCallback(async (styleDocId: string): Promise<boolean> => {
    try {
      const result = await serviceManagement.deleteStyle(styleDocId);
      if (result.success) {
        // Use functional update to avoid stale closure
        setStyles(prev => prev.filter(s => s.docId !== styleDocId));
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete style';
      setError(errorMessage);
      return false;
    }
  }, []); // Removed styles from dependency - using functional update instead

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    services,
    styles,
    loading,
    error,
    fetchServices,
    fetchStyles,
    updateServices,
    deleteStyle,
    clearError
  };
}

