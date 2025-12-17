
import { useState, useCallback } from 'react';
import { db } from '../firebase';
import { GlobalDiscountService } from '../services/discount/GlobalDiscountService';
import type { ServiceResponse, CreateDiscountInput, UpdateDiscountInput } from '../../types';

const discountService = new GlobalDiscountService(db);

export interface UseGlobalDiscountsReturn {
  createDiscount: (input: CreateDiscountInput) => Promise<ServiceResponse>;
  updateDiscount: (discountId: string, input: UpdateDiscountInput) => Promise<ServiceResponse>;
  deleteDiscount: (discountId: string) => Promise<ServiceResponse>;
  getAllDiscounts: () => Promise<ServiceResponse>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useGlobalDiscounts(): UseGlobalDiscountsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDiscount = useCallback(async (input: CreateDiscountInput): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await discountService.createDiscount(input);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create discount';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'CREATE_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDiscount = useCallback(async (discountId: string, input: UpdateDiscountInput): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await discountService.updateDiscount(discountId, input);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update discount';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'UPDATE_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDiscount = useCallback(async (discountId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await discountService.deleteDiscount(discountId);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete discount';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'DELETE_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllDiscounts = useCallback(async (): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await discountService.getAllDiscounts();
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch discounts';
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
    createDiscount,
    updateDiscount,
    deleteDiscount,
    getAllDiscounts,
    isLoading,
    error,
    clearError
  };
}

