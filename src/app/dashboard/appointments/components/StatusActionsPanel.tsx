'use client';

import React, { useState } from 'react';
import { Booking } from '../types';
import { PaymentModal } from './PaymentModal';
import { db } from '../../../../lib/firebase';
import { NotificationService } from '../../../../lib/services/notification/NotificationService';

interface StatusActionsPanelProps {
  appointment: Booking;
  isSubmitting: boolean;
  onStatusUpdate: (status: Booking['status'], reason?: string) => Promise<boolean | void>;
  onPaymentConfirm?: (appointment: Booking) => Promise<void>;
}

export const StatusActionsPanel = ({ appointment, isSubmitting, onStatusUpdate, onPaymentConfirm }: StatusActionsPanelProps) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [noShowReason, setNoShowReason] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const notificationService = new NotificationService(db);

  // only show buttons for pending, confirmed, and in-progress statuses
  const canUpdateStatus = ['pending', 'confirmed', 'in-progress'].includes(appointment.status);

  // Helper to show notification feedback
  const showNotificationFeedback = () => {
    setNotificationSent(true);
    setTimeout(() => setNotificationSent(false), 3000);
  };

  // Send "next in queue" notification
  const handleSendNextInQueueNotification = async () => {
    setNotificationLoading(true);
    const result = await notificationService.notifyNextInQueue(appointment);
    setNotificationLoading(false);
    if (result.success) showNotificationFeedback();
  };

  // Send "service started" notification
  const handleSendServiceStartedNotification = async () => {
    setNotificationLoading(true);
    const result = await notificationService.notifyServiceStarted(appointment);
    setNotificationLoading(false);
    if (result.success) showNotificationFeedback();
  };

  // Send "no-show" notification
  const handleSendNoShowNotification = async () => {
    setNotificationLoading(true);
    const result = await notificationService.notifyNoShow(appointment, noShowReason);
    setNotificationLoading(false);
    if (result.success) showNotificationFeedback();
  };

  // Send "cancelled" notification
  const handleSendCancelledNotification = async () => {
    setNotificationLoading(true);
    const result = await notificationService.notifyCancelled(appointment, cancelReason);
    setNotificationLoading(false);
    if (result.success) showNotificationFeedback();
  };

  // Send "service completed" notification
  const handleSendCompletedNotification = async () => {
    setNotificationLoading(true);
    const result = await notificationService.notifyServiceCompleted(appointment);
    setNotificationLoading(false);
    if (result.success) showNotificationFeedback();
  };

  // Send "payment confirmed" notification
  const handleSendPaymentNotification = async () => {
    setNotificationLoading(true);
    const result = await notificationService.notifyPaymentConfirmed(appointment, appointment.finalPrice || appointment.totalPrice);
    setNotificationLoading(false);
    if (result.success) showNotificationFeedback();
  };

  if (!canUpdateStatus) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-4 relative">
      {/* Floating Success Badge */}
      {notificationSent && (
        <div className="absolute -top-12 right-0 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-md animate-fadeIn">
          <i className="fas fa-check text-sm"></i>
          Sent
        </div>
      )}
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end">
        {appointment.status === 'pending' && (
          <>
            <button
              className="px-3 py-1 bg-green-500 text-white rounded text-xs font-medium transition-colors hover:bg-green-600 disabled:opacity-50"
              onClick={async () => {
                await onStatusUpdate('confirmed');
              }}
              disabled={isSubmitting}
            >
              Accept
            </button>
            <button
              className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium transition-colors hover:bg-red-600 disabled:opacity-50"
              onClick={() => setShowDeclineModal(true)}
              disabled={isSubmitting}
            >
              Decline
            </button>
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-medium transition-colors hover:bg-blue-600 disabled:opacity-50"
              onClick={handleSendNextInQueueNotification}
              disabled={isSubmitting || notificationLoading}
              title="Notify Next in Queue"
            >
              <i className="fas fa-bell mr-1"></i>Notify
            </button>
          </>
        )}
        {appointment.status === 'confirmed' && (
          <>
            <button
              className="px-3 py-1 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#BF8F63' }}
              onMouseEnter={(e) => !isSubmitting && !notificationLoading && (e.currentTarget.style.backgroundColor = '#A67C52')}
              onMouseLeave={(e) => !isSubmitting && !notificationLoading && (e.currentTarget.style.backgroundColor = '#BF8F63')}
              onClick={async () => {
                await handleSendServiceStartedNotification();
                await onStatusUpdate('in-progress');
              }}
              disabled={isSubmitting || notificationLoading}
            >
              Start Service
            </button>
            <button
              className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium transition-colors hover:bg-red-600 disabled:opacity-50"
              onClick={() => setShowCancelModal(true)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 bg-gray-500 text-white rounded text-xs font-medium transition-colors hover:bg-gray-600 disabled:opacity-50"
              onClick={() => setShowNoShowModal(true)}
              disabled={isSubmitting}
            >
              No-Show
            </button>
          </>
        )}
        {appointment.status === 'in-progress' && (
          <button
            className="px-3 py-1 bg-green-500 text-white rounded text-xs font-medium transition-colors hover:bg-green-600 disabled:opacity-50"
            onClick={() => {
              // If payment method is cash and paymentStatus is not set (not paid yet), show payment modal
              const isCashPayment = appointment.paymentMethod?.toLowerCase() === 'cash';
              const isNotPaid = !appointment.paymentStatus;  // paymentStatus only exists after payment

              if (isCashPayment && isNotPaid) {
                setShowPaymentModal(true);
              } else {
                // Otherwise, complete directly and send notification
                handleSendCompletedNotification();
                onStatusUpdate('completed');
              }
            }}
            disabled={isSubmitting || notificationLoading}
          >
            Complete
          </button>
        )}
      </div>
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Cancel Appointment</h3>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="w-full border border-gray-300 rounded p-3 mb-4 text-sm"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  await handleSendCancelledNotification();
                  await onStatusUpdate('cancelled', cancelReason);
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                disabled={isSubmitting || notificationLoading}
                className="px-3 py-1.5 bg-red-500 text-white rounded text-xs font-medium transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Decline Appointment</h3>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter reason for declining..."
              className="w-full border border-gray-300 rounded p-3 mb-4 text-sm"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onStatusUpdate('declined', declineReason);
                  setShowDeclineModal(false);
                  setDeclineReason('');
                }}
                disabled={isSubmitting}
                className="px-3 py-1.5 bg-red-500 text-white rounded text-xs font-medium transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
      {showNoShowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Mark as No-Show</h3>
            <textarea
              value={noShowReason}
              onChange={(e) => setNoShowReason(e.target.value)}
              placeholder="Enter reason (optional)..."
              className="w-full border border-gray-300 rounded p-3 mb-4 text-sm"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowNoShowModal(false)}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  await handleSendNoShowNotification();
                  await onStatusUpdate('no-show', noShowReason);
                  setShowNoShowModal(false);
                  setNoShowReason('');
                }}
                disabled={isSubmitting || notificationLoading}
                className="px-3 py-1.5 bg-gray-500 text-white rounded text-xs font-medium transition-colors hover:bg-gray-600 disabled:opacity-50"
              >
                Confirm No-Show
              </button>
            </div>
          </div>
        </div>
      )}
      <PaymentModal
        isOpen={showPaymentModal}
        appointment={appointment}
        isSubmitting={isSubmitting}
        onConfirm={async () => {
          if (onPaymentConfirm) {
            await onPaymentConfirm(appointment);
          }
          await handleSendPaymentNotification();
          await handleSendCompletedNotification();
          setShowPaymentModal(false);
          await onStatusUpdate('completed');
        }}
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  );
};

