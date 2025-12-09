'use client';

import React, { useState } from 'react';
import { Booking } from '../types';
import { PaymentModal } from './PaymentModal';
import { db } from '../../../../lib/firebase';
import { NotificationService } from '../../../../lib/services/notification/NotificationService';
import ConfirmationModal from '../../services/components/ConfirmationModal';
import { StandardModal, ModalButtons } from '../../components';

interface StatusActionsPanelProps {
  appointment: Booking;
  isSubmitting: boolean;
  onStatusUpdate: (status: Booking['status'], reason?: string) => Promise<boolean | void>;
  onPaymentConfirm?: (appointment: Booking) => Promise<void>;
}

export const StatusActionsPanel = ({ appointment, isSubmitting, onStatusUpdate, onPaymentConfirm }: StatusActionsPanelProps) => {
  const [showDeclineConfirmation, setShowDeclineConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [showNoShowConfirmation, setShowNoShowConfirmation] = useState(false);
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

  const canUpdateStatus = ['pending', 'confirmed', 'in-progress'].includes(appointment.status);

  // show notification feedback briefly
  const showNotificationFeedback = () => {
    setNotificationSent(true);
    setTimeout(() => setNotificationSent(false), 3000);
  };

  // notify next in queue
  const handleSendNextInQueueNotification = async () => {
    setNotificationLoading(true);
    const result = await notificationService.notifyNextInQueue(appointment);
    setNotificationLoading(false);
    if (result.success) showNotificationFeedback();
  };

  // notify service started
  const handleSendServiceStartedNotification = async () => {
    setNotificationLoading(true);
    const result = await notificationService.notifyServiceStarted(appointment);
    setNotificationLoading(false);
    if (result.success) showNotificationFeedback();
  };

  // notify no-show status
  const handleSendNoShowNotification = async () => {
    setNotificationLoading(true);
    const result = await notificationService.notifyNoShow(appointment, noShowReason);
    setNotificationLoading(false);
    if (result.success) showNotificationFeedback();
  };

  // notify appointment cancelled
  const handleSendCancelledNotification = async () => {
    setNotificationLoading(true);
    const result = await notificationService.notifyCancelled(appointment, cancelReason);
    setNotificationLoading(false);
    if (result.success) showNotificationFeedback();
  };

  // notify service completed
  const handleSendCompletedNotification = async () => {
    setNotificationLoading(true);
    const result = await notificationService.notifyServiceCompleted(appointment);
    setNotificationLoading(false);
    if (result.success) showNotificationFeedback();
  };

  // notify payment confirmed
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
      {notificationSent && (
        <div className="absolute -top-12 right-0 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-md animate-fadeIn">
          <i className="fas fa-check text-sm"></i>
          Sent
        </div>
      )}
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
              onClick={() => setShowDeclineConfirmation(true)}
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
              onClick={() => setShowCancelConfirmation(true)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 bg-gray-500 text-white rounded text-xs font-medium transition-colors hover:bg-gray-600 disabled:opacity-50"
              onClick={() => setShowNoShowConfirmation(true)}
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
              // check if cash payment needed
              const isCashPayment = appointment.paymentMethod?.toLowerCase() === 'cash';
              const isNotPaid = !appointment.paymentStatus;

              if (isCashPayment && isNotPaid) {
                setShowPaymentModal(true);
              } else {
                // complete directly send notification
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
      <ConfirmationModal
        isOpen={showCancelConfirmation}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? You will need to provide a reason."
        confirmText="Continue"
        onClose={() => setShowCancelConfirmation(false)}
        onConfirm={() => {
          setShowCancelModal(true);
          setShowCancelConfirmation(false);
        }}
        type="danger"
      />
      <StandardModal
        isOpen={showCancelModal}
        title="Cancel Appointment"
        onClose={() => setShowCancelModal(false)}
      >
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Enter reason for cancellation..."
          className="w-full border border-gray-300 rounded p-3 mb-4 text-sm"
          rows={4}
        />
        <ModalButtons
          onCancel={() => setShowCancelModal(false)}
          onConfirm={async () => {
            await handleSendCancelledNotification();
            await onStatusUpdate('cancelled', cancelReason);
            setShowCancelModal(false);
            setCancelReason('');
          }}
          cancelText="Close"
          confirmText="Confirm Cancel"
          confirmType="danger"
          isLoading={isSubmitting || notificationLoading}
          disabled={isSubmitting || notificationLoading}
        />
      </StandardModal>
      <ConfirmationModal
        isOpen={showDeclineConfirmation}
        title="Decline Appointment"
        message="Are you sure you want to decline this appointment? You will need to provide a reason."
        confirmText="Continue"
        onClose={() => setShowDeclineConfirmation(false)}
        onConfirm={() => {
          setShowDeclineModal(true);
          setShowDeclineConfirmation(false);
        }}
        type="danger"
      />
      <StandardModal
        isOpen={showDeclineModal}
        title="Decline Appointment"
        onClose={() => setShowDeclineModal(false)}
      >
        <textarea
          value={declineReason}
          onChange={(e) => setDeclineReason(e.target.value)}
          placeholder="Enter reason for declining..."
          className="w-full border border-gray-300 rounded p-3 mb-4 text-sm"
          rows={4}
        />
        <ModalButtons
          onCancel={() => setShowDeclineModal(false)}
          onConfirm={() => {
            onStatusUpdate('declined', declineReason);
            setShowDeclineModal(false);
            setDeclineReason('');
          }}
          cancelText="Close"
          confirmText="Confirm Decline"
          confirmType="danger"
          disabled={isSubmitting}
        />
      </StandardModal>
      
      <ConfirmationModal
        isOpen={showNoShowConfirmation}
        title="Mark as No-Show"
        message="Are you sure you want to mark this appointment as no-show? You can provide a reason."
        confirmText="Continue"
        onClose={() => setShowNoShowConfirmation(false)}
        onConfirm={() => {
          setShowNoShowModal(true);
          setShowNoShowConfirmation(false);
        }}
        type="warning"
      />
      <StandardModal
        isOpen={showNoShowModal}
        title="Mark as No-Show"
        onClose={() => setShowNoShowModal(false)}
      >
        <textarea
          value={noShowReason}
          onChange={(e) => setNoShowReason(e.target.value)}
          placeholder="Enter reason (optional)..."
          className="w-full border border-gray-300 rounded p-3 mb-4 text-sm"
          rows={4}
        />
        <ModalButtons
          onCancel={() => setShowNoShowModal(false)}
          onConfirm={async () => {
            await handleSendNoShowNotification();
            await onStatusUpdate('no-show', noShowReason);
            setShowNoShowModal(false);
            setNoShowReason('');
          }}
          cancelText="Close"
          confirmText="Confirm No-Show"
          confirmType="warning"
          isLoading={isSubmitting || notificationLoading}
          disabled={isSubmitting || notificationLoading}
        />
      </StandardModal>
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

