'use client';

import { useState, useCallback } from 'react';
import { db } from '../firebase';
import { MayaPaymentService, MayaPaymentReceipt } from '../services/payment/MayaPaymentService';

const mayaPaymentService = new MayaPaymentService(db);

export interface UseMayaPaymentReturn {
  receipt: MayaPaymentReceipt | null;
  loading: boolean;
  error: string | null;
  fetchReceipt: (bookingId: string) => Promise<void>;
  clearError: () => void;
}

export function useMayaPayment(): UseMayaPaymentReturn {
  const [receipt, setReceipt] = useState<MayaPaymentReceipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipt = useCallback(async (bookingId: string) => {
    try {
      setLoading(true);
      setError(null);
      setReceipt(null);

      const result = await mayaPaymentService.getPaymentReceiptByBookingId(bookingId);

      if (result.success && result.data) {
        setReceipt(result.data as MayaPaymentReceipt);
      } else if (result.message) {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to fetch payment receipt');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    receipt,
    loading,
    error,
    fetchReceipt,
    clearError
  };
}

