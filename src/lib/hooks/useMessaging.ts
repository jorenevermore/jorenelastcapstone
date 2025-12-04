import { useState, useCallback } from 'react';
import { Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import { MessagingService } from '../services/messaging/MessagingService';
import { ServiceResponse, Message } from '../services/messaging/BaseMessagingService';

export type { Message } from '../services/messaging/BaseMessagingService';

const messagingService = new MessagingService(db);

export interface UseMessagingReturn {
  addMessage: (messageData: Omit<Message, 'id'>) => Promise<ServiceResponse>;
  getMessagesBetweenUsers: (barberId: string, clientId: string) => Promise<ServiceResponse>;
  getMessagesForAppointment: (appointmentId: string, barberId: string, clientId: string) => Promise<ServiceResponse>;
  getMessagesForBarbershop: (barbershopId: string) => Promise<ServiceResponse>;
  getMessagesForClient: (clientId: string) => Promise<ServiceResponse>;
  subscribeToClientMessages: (
    barberId: string,
    onNewMessage: (message: Message) => void,
    onError?: (error: Error) => void
  ) => Unsubscribe;
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'SEND_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMessagesBetweenUsers = useCallback(async (barberId: string, clientId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await messagingService.getMessagesBetweenUsers(barberId, clientId);
      if (!result.success) setError(result.message);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'FETCH_ERROR' };
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'FETCH_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMessagesForClient = useCallback(async (clientId: string): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await messagingService.getMessagesForClient(clientId);
      if (!result.success) setError(result.message);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
      setError(errorMessage);
      return { success: false, message: errorMessage, error: 'FETCH_ERROR' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const subscribeToClientMessages = useCallback((
    barberId: string,
    onNewMessage: (message: Message) => void,
    onError?: (error: Error) => void
  ): Unsubscribe => {
    return messagingService.subscribeToClientMessages(barberId, onNewMessage, onError);
  }, []);

  return {
    addMessage,
    getMessagesBetweenUsers,
    getMessagesForAppointment,
    getMessagesForBarbershop,
    getMessagesForClient,
    subscribeToClientMessages,
    isLoading,
    error,
    clearError
  };
}

