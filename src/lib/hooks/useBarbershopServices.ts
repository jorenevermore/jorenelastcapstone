
'use client';

import { useState, useCallback } from 'react';
import { db } from '../firebase';
import { BarbershopServiceManagement } from '../services/service/BarbershopServiceManagement';
import type { Service, Style } from '../../types/services';

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
      } else if (result.message) {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to fetch services');
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
      } else if (result.message) {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to fetch styles');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateServices = useCallback(async (barbershopId: string, services: any[]): Promise<boolean> => {
    try {
      const result = await serviceManagement.updateServices(barbershopId, services);
      if (result.success) {
        await fetchServices(barbershopId);
        return true;
      } else if (result.message) {
        setError(result.message);
        return false;
      }
      return false;
    } catch (error) {
      setError('Failed to update services');
      return false;
    }
  }, [fetchServices]);

  const deleteStyle = useCallback(async (styleDocId: string): Promise<boolean> => {
    try {
      const result = await serviceManagement.deleteStyle(styleDocId);
      if (result.success) {
        setStyles(prev => prev.filter(style => style.docId !== styleDocId));
        return true;
      } else {
        if (result.message) setError(result.message);
        return false;
      }
    } catch (error) {
      setError('Failed to delete style');
      return false;
    }
  }, []);

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

