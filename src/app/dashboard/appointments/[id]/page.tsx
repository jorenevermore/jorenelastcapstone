'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../../lib/firebase';
import { Booking } from '../types';
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

  // fetch appointment and client data
  const { appointment: fetchedAppointment, clientDetails, messages: fetchedMessages, loading, error: fetchError } =
    useAppointmentDetails(user?.uid, appointmentId);

  const { isSubmitting, updateBookingStatus, addNoteToBooking } =
    useAppointmentActions();

  const { receipt, loading: receiptLoading, error: receiptError, fetchReceipt } = useMayaPayment();

  // sync appointment to local state
  useEffect(() => {
    setAppointment(fetchedAppointment);
  }, [fetchedAppointment]);

  // sync messages to local state
  useEffect(() => {
    setMessages(fetchedMessages);
  }, [fetchedMessages]);

  // update appointment status and reason
  const updateAppointmentStatus = async (status: Booking['status'], reason?: string): Promise<boolean | void> => {
    if (!appointment) return false;
    const success = await updateBookingStatus(appointment, status, reason);
    if (success) {
      setAppointment(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status,
          barberReason: status === 'cancelled' ? reason : prev.barberReason
        };
      });
    }
    return success;
  };

  // add message to appointment
  const sendMessage = async (noteText: string) => {
    if (!noteText.trim() || !appointment || !user) return false;
    const result = await addNoteToBooking(noteText, user.uid, appointment);
    if (result.success && result.message) {
      setMessages(prev => [...prev, result.message!]);
    }
    return result.success;
  };

  // confirm payment and update status
  const confirmPayment = async (bookingToUpdate: Booking) => {
    if (!bookingToUpdate) return;
    try {
      const { doc: firestoreDoc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../../../lib/firebase');

      const bookingRef = firestoreDoc(db, 'bookings', bookingToUpdate.id);
      await updateDoc(bookingRef, {
        paymentStatus: 'paid'
      });
      setAppointment(prev => {
        if (!prev) return null;
        return {
          ...prev,
          paymentStatus: 'paid'
        };
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  };

  // handle view receipt
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
                <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
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
            {appointment && clientDetails !== undefined && (
              <AppointmentInfoCards
                appointment={appointment}
                clientDetails={clientDetails}
                onChatClick={() => setIsChatModalOpen(true)}
                onViewReceipt={handleViewReceipt}
              />
            )}
            {appointment && (
              <StatusActionsPanel
                appointment={appointment}
                isSubmitting={isSubmitting}
                onStatusUpdate={updateAppointmentStatus}
                onPaymentConfirm={confirmPayment}
              />
            )}
            <div className="mt-6 space-y-4">
              {appointment.isHomeService && appointment.location && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3">Location Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{appointment.location.streetName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Distance</p>
                      <p className="font-medium">{appointment.location.distance} km</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${appointment.location.lat},${appointment.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm flex items-center"
                    >
                      <i className="fas fa-map-marker-alt mr-1"></i> View on Map
                    </a>
                  </div>
                </div>
              )}
              {(() => {
                const cancellationInfo = BookingUtilService.getCancellationInfo(appointment);
                return cancellationInfo ? (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
                    <h4 className="font-medium text-red-700 mb-3">
                      Cancellation Information
                    </h4>
                    <div className="bg-white p-3 rounded-lg border-l-4 border-red-400">
                      <p className="text-sm font-medium text-red-700 mb-1">
                        {appointment.barberReason ? "Barbershop's Reason:" : "Client's Reason:"}
                      </p>
                      <p className="text-gray-700">{cancellationInfo.reason}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {cancellationInfo.timestamp}
                      </p>
                    </div>
                  </div>
                ) : null;
              })()}
              {appointment.feedback && appointment.feedback.rating && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3">
                    <div className="flex items-center">
                      <i className="fas fa-star text-yellow-400 mr-2"></i>
                      Client Feedback
                    </div>
                  </h4>

                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="flex mr-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`fas fa-star text-lg ${star <= (appointment.feedback?.rating || 0) ? 'text-yellow-400' : 'text-gray-200'}`}
                          ></i>
                        ))}
                      </div>
                      <span className="font-bold text-lg">{appointment.feedback.rating}/5</span>
                    </div>

                    {appointment.feedback.comment && (
                      <div className="bg-gray-50 p-3 rounded border border-gray-100 relative">
                        <i className="fas fa-quote-left text-gray-200 absolute top-2 left-2 text-lg"></i>
                        <p className="text-gray-700 pl-6 pr-6 italic">{appointment.feedback.comment}</p>
                        <i className="fas fa-quote-right text-gray-200 absolute bottom-2 right-2 text-lg"></i>
                      </div>
                    )}

                    {appointment.feedback.createdAt && (
                      <div className="text-xs text-gray-500 mt-3 text-right">
                        Submitted on {new Date(appointment.feedback.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
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
          <div className="text-6xl mb-4 text-gray-300"><i className="fas fa-calendar-times"></i></div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Appointment Not Found</h3>
          <p className="text-gray-500 mb-6">The appointment you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            href="/dashboard/appointments"
            className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back
          </Link>
        </div>
      )}
    </div>
  );
}


