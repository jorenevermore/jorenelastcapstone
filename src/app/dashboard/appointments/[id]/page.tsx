'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../../lib/firebase';
import type { Booking } from '../../../../types/appointments';
import Link from 'next/link';
import { ChatModal, AppointmentInfoCards, StatusActionsPanel, MayaReceiptModal } from '../components';
import { StatusService } from '../../../../lib/services/status/StatusService';
import { useAppointmentDetails } from '../hooks/useAppointmentDetails';
import { useAppointmentActions } from '../hooks/useAppointmentActions';
import { useMayaPayment } from '../../../../lib/hooks/useMayaPayment';
import { Message } from '../../../../lib/hooks/useMessaging';
import { BookingUtilService } from '../../../../lib/services/booking/BookingUtilService';

export default function AppointmentDetailsPage() {
  const params = useParams();
  const [user] = useAuthState(auth);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [appointment, setAppointment] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const statusService = new StatusService();

  const appointmentId = params?.id as string;

  const {
    appointment: fetchedAppointment,
    clientDetails,
    messages: fetchedMessages,
    loading,
    error: fetchError
  } = useAppointmentDetails(user?.uid, appointmentId);

  const { isSubmitting, updateBookingStatus, addNoteToBooking } =
    useAppointmentActions();

  const {
    receipt,
    loading: receiptLoading,
    error: receiptError,
    fetchReceipt
  } = useMayaPayment();

  useEffect(() => {
    setAppointment(fetchedAppointment);
  }, [fetchedAppointment]);

  useEffect(() => {
    setMessages(fetchedMessages);
  }, [fetchedMessages]);

  const updateAppointmentStatus = async (
    status: Booking['status'],
    reason?: string
  ): Promise<boolean | void> => {
    if (!appointment) return false;

    const success = await updateBookingStatus(appointment, status, reason);
    if (success) {
      setAppointment(prev =>
        prev
          ? {
              ...prev,
              status,
              barberReason: status === 'cancelled' ? reason : prev.barberReason
            }
          : null
      );
    }
    return success;
  };

  const sendMessage = async (noteText: string) => {
    if (!noteText.trim() || !appointment || !user) return false;

    const result = await addNoteToBooking(noteText, user.uid, appointment);
    if (result.success && result.message) {
      setMessages(prev => [...prev, result.message!]);
    }
    return result.success;
  };

  const confirmPayment = async (bookingToUpdate: Booking) => {
    if (!bookingToUpdate) return;
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../../../lib/firebase');

      await updateDoc(doc(db, 'bookings', bookingToUpdate.id), {
        paymentStatus: 'paid'
      });

      setAppointment(prev =>
        prev ? { ...prev, paymentStatus: 'paid' } : null
      );
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  };

  const handleViewReceipt = async () => {
    if (!appointment) return;
    setIsReceiptModalOpen(true);
    await fetchReceipt(appointment.id);
  };

  return (
    <div className="p-6">
      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p>{fetchError}</p>
        </div>
      )}

      {loading ? (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-2"></div>
          <p>Loading appointment details...</p>
        </div>
      ) : appointment ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6 animate-fadeIn">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-black">
                  Appointment #{appointment.id.substring(0, 6)}
                </h3>
                <span
                  className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${statusService.getStatusColor(appointment.status)}`}
                >
                  <i className={`${BookingUtilService.getStatusIcon(appointment.status)} mr-1.5`}></i>
                  {BookingUtilService.getFormattedStatus(appointment.status)}
                </span>
              </div>
              <Link
                href="/dashboard/appointments"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back
              </Link>
            </div>
          </div>

          <div className="p-6">
            {clientDetails && (
              <AppointmentInfoCards
                appointment={appointment}
                clientDetails={clientDetails}
                onChatClick={() => setIsChatModalOpen(true)}
                onViewReceipt={handleViewReceipt}
              />
            )}

            <StatusActionsPanel
              appointment={appointment}
              isSubmitting={isSubmitting}
              onStatusUpdate={updateAppointmentStatus}
              onPaymentConfirm={confirmPayment}
            />

            <div className="mt-6 space-y-4">

              {appointment.feedback?.rating && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                    <i className="fas fa-star text-yellow-400 mr-2"></i>
                    Client Feedback
                  </h4>

                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center mb-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <i
                          key={star}
                          className={`fas fa-star text-lg ${
                            star <= appointment.feedback!.rating
                              ? 'text-yellow-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                      <span className="ml-2 font-bold">
                        {appointment.feedback.rating}/5
                      </span>
                    </div>

                    {appointment.feedback.comment && (
                      <p className="italic text-gray-700">
                        “{appointment.feedback.comment}”
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <ChatModal
            isOpen={isChatModalOpen}
            onClose={() => setIsChatModalOpen(false)}
            appointment={appointment}
            onSendMessage={sendMessage}
            isSubmitting={isSubmitting}
            messages={messages}
          />

          <MayaReceiptModal
            isOpen={isReceiptModalOpen}
            receipt={receipt}
            loading={receiptLoading}
            error={receiptError}
            onClose={() => setIsReceiptModalOpen(false)}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Appointment Not Found</h3>
          <Link href="/dashboard/appointments" className="btn-primary">
            Back
          </Link>
        </div>
      )}
    </div>
  );
}
