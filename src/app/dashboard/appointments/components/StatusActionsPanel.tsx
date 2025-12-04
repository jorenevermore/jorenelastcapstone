'use client';

import React, { useState } from 'react';
import { Booking } from '../types';
import { PaymentModal } from './PaymentModal';

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

  // only show buttons for pending, confirmed, and in-progress statuses
  const canUpdateStatus = ['pending', 'confirmed', 'in-progress'].includes(appointment.status);

  if (!canUpdateStatus) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="space-y-2">
          {appointment.status === 'pending' && (
            <div className="flex gap-2">
              <button
                className="flex-1 bg-black text-white rounded px-3 py-1.5 text-xs font-medium hover:bg-gray-800 transition-colors"
                onClick={() => onStatusUpdate('confirmed')}
                disabled={isSubmitting}
              >
                Accept
              </button>
              <button
                className="flex-1 bg-orange-600 text-white rounded px-3 py-1.5 text-xs font-medium hover:bg-orange-700 transition-colors"
                onClick={() => setShowDeclineModal(true)}
                disabled={isSubmitting}
              >
                Decline
              </button>
            </div>
          )}
          {appointment.status === 'confirmed' && (
            <div className="flex gap-2">
              <button
                className="flex-1 bg-black text-white rounded px-3 py-1.5 text-xs font-medium hover:bg-gray-800 transition-colors"
                onClick={() => onStatusUpdate('in-progress')}
                disabled={isSubmitting}
              >
                Start Service
              </button>
              <button
                className="flex-1 bg-red-600 text-white rounded px-3 py-1.5 text-xs font-medium hover:bg-red-700 transition-colors"
                onClick={() => setShowCancelModal(true)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-gray-600 text-white rounded px-3 py-1.5 text-xs font-medium hover:bg-gray-700 transition-colors"
                onClick={() => setShowNoShowModal(true)}
                disabled={isSubmitting}
              >
                No-Show
              </button>
            </div>
          )}
          {appointment.status === 'in-progress' && (
            <button
              className="w-full bg-black text-white rounded px-3 py-1.5 text-xs font-medium hover:bg-gray-800 transition-colors"
              onClick={() => {
                // If payment method is cash and paymentStatus is not set (not paid yet), show payment modal
                const isCashPayment = appointment.paymentMethod?.toLowerCase() === 'cash';
                const isNotPaid = !appointment.paymentStatus;  // paymentStatus only exists after payment

                if (isCashPayment && isNotPaid) {
                  setShowPaymentModal(true);
                } else {
                  // Otherwise, complete directly
                  onStatusUpdate('completed');
                }
              }}
              disabled={isSubmitting}
            >
              Complete
            </button>
          )}
        </div>
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onStatusUpdate('cancelled', cancelReason);
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700"
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50"
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
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700"
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onStatusUpdate('no-show', noShowReason);
                  setShowNoShowModal(false);
                  setNoShowReason('');
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700"
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
          setShowPaymentModal(false);
          await onStatusUpdate('completed');
        }}
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  );
};

