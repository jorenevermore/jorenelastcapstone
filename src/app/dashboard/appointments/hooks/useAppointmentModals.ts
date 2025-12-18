'use client';

import { useState, useCallback } from 'react';

interface SelectedBooking {
  id: string;
  action: 'accept' | 'cancel';
}

export interface UseAppointmentModalsReturn {

  selectedBooking: SelectedBooking | null;
  openConfirmAction: (bookingId: string, action: 'accept' | 'cancel') => void;
  closeConfirmAction: () => void;


  bookingToDelete: string | null;
  openDeleteConfirmation: (bookingId: string) => void;
  closeDeleteConfirmation: () => void;

  showCancelReasonModal: string | null;
  cancelReason: string;
  setCancelReason: (reason: string) => void;
  openCancelReasonModal: (bookingId: string) => void;
  closeCancelReasonModal: () => void;
}

export const useAppointmentModals = (): UseAppointmentModalsReturn => {
  const [selectedBooking, setSelectedBooking] = useState<SelectedBooking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [showCancelReasonModal, setShowCancelReasonModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  const openConfirmAction = useCallback((bookingId: string, action: 'accept' | 'cancel') => {
    setSelectedBooking({ id: bookingId, action });
  }, []);

  const closeConfirmAction = useCallback(() => {
    setSelectedBooking(null);
  }, []);

  const openDeleteConfirmation = useCallback((bookingId: string) => {
    setBookingToDelete(bookingId);
  }, []);

  const closeDeleteConfirmation = useCallback(() => {
    setBookingToDelete(null);
  }, []);

  const openCancelReasonModal = useCallback((bookingId: string) => {
    setShowCancelReasonModal(bookingId);
  }, []);

  const closeCancelReasonModal = useCallback(() => {
    setShowCancelReasonModal(null);
    setCancelReason('');
  }, []);

  return {
    selectedBooking,
    openConfirmAction,
    closeConfirmAction,
    bookingToDelete,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    showCancelReasonModal,
    cancelReason,
    setCancelReason,
    openCancelReasonModal,
    closeCancelReasonModal,
  };
};

