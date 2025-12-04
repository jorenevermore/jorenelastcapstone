'use client';

import { useState } from 'react';
import { db } from '../../../../lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Booking } from '../types';
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

      // Get current booking
      const bookingDoc = await getDocs(
        query(collection(db, 'bookings'), where('id', '==', appointment.id))
      );

      let currentBooking: any = null;
      bookingDoc.forEach(doc => {
        currentBooking = doc.data();
      });

      if (currentBooking?.statusHistory) {
        updateData.statusHistory = [...currentBooking.statusHistory, historyEntry];
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
        from: 'barbershop'
      };

      const result = await addMessage(messageData);

      if (!result.success) {
        setError(result.message || 'Failed to add message');
        return { success: false };
      }

      // update booking notes
      const newNote = {
        text: note,
        timestamp: new Date().toISOString(),
        from: 'barbershop' as const,
        barbershopId: userId,
        barbershopName: appointment.barbershopName || 'Barbershop'
      };

      const bookingRef = doc(db, 'bookings', appointment.id);
      const existingNotes = appointment.barbershopNotes || [];

      await updateDoc(bookingRef, {
        barbershopNotes: [...existingNotes, newNote]
      });

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

