'use client';

import { useState } from 'react';
import { db } from '../../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { Booking } from '../../../../types/appointments';
import { useMessaging, Message } from '../../../../lib/hooks/useMessaging';

interface UseAppointmentActionsReturn {
  isSubmitting: boolean;
  error: string | null;
  updateBookingStatus: (appointment: Booking, status: Booking['status'], reason?: string) => Promise<boolean>;
  addNoteToBooking: (note: string, userId: string, appointment: Booking) => Promise<{ success: boolean; message?: Message }>;
}

export const useAppointmentActions = (): UseAppointmentActionsReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addMessage } = useMessaging();

  const updateBookingStatus = async (
    appointment: Booking,
    status: Booking['status'],
    reason?: string
  ): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setError(null);

      const bookingRef = doc(db, 'bookings', appointment.id);
      const updateData: any = { status };

      if (reason && status === 'cancelled') {
        updateData.barberReason = reason;
      }

      const timestamp = Date.now().toString();
      const historyEntry = {
        ongoingStatus: status,
        timestamp,
        updatedBy: 'barber',
        reason: reason || ''
      };

      if (appointment.statusHistory) {
        updateData.statusHistory = [...appointment.statusHistory, historyEntry];
      } else {
        updateData.statusHistory = [historyEntry];
      }

      await updateDoc(bookingRef, updateData);
      return true;
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNoteToBooking = async (
    note: string,
    userId: string,
    appointment: Booking
  ): Promise<{ success: boolean; message?: Message }> => {
    try {
      setIsSubmitting(true);
      setError(null);

      const messageData: Omit<Message, 'id'> = {
        barberId: appointment.barberId || userId,
        clientId: appointment.clientId,
        senderId: userId,
        message: note,
        timestamp: Date.now().toString(),
        appointmentId: appointment.id,
        from: 'barbershop',
        clientName: appointment.clientName
      };

      const result = await addMessage(messageData);

      if (!result.success) {
        setError(result.message || 'Failed to add message');
        return { success: false };
      }

      return {
        success: true,
        message: result.data as Message
      };
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to add note');
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    updateBookingStatus,
    addNoteToBooking
  };
};

