import { useState, useCallback } from 'react';
import { db } from '../firebase';
import { MessagingService } from '../services/messaging/MessagingService';
import type { ServiceResponse, Message } from '../../types';

export type { Message };

const messagingService = new MessagingService(db);

export interface UseMessagingReturn {
  addMessage: (messageData: Omit<Message, 'id'>) => Promise<ServiceResponse>;
  getMessagesForAppointment: (appointmentId: string, barberId: string, clientId: string) => Promise<ServiceResponse>;
  getMessagesForBarbershop: (barbershopId: string) => Promise<ServiceResponse>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useMessaging(): UseMessagingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback(async (messageData: Omit<Message, 'id'>): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await messagingService.addMessage(messageData);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'SEND_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMessagesForAppointment = useCallback(async (appointmentId: string, barberId: string, clientId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await messagingService.getMessagesForAppointment(appointmentId, barberId, clientId);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'FETCH_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMessagesForBarbershop = useCallback(async (barbershopId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await messagingService.getMessagesForBarbershop(barbershopId);
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
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
    addMessage,
    getMessagesForAppointment,
    getMessagesForBarbershop,
    isLoading,
    error,
    clearError
  };
}

