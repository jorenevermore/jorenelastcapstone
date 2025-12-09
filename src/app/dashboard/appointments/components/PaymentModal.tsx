'use client';

import React, { useState } from 'react';
import { Booking } from '../types';
import { StandardModal, ModalButtons } from '../../components';

interface PaymentModalProps {
  isOpen: boolean;
  appointment: Booking;
  isSubmitting: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export const PaymentModal = ({
  isOpen,
  appointment,
  isSubmitting,
  onConfirm,
  onClose
}: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePaymentConfirm = async () => {
    setError('');
    setIsProcessing(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <StandardModal
      isOpen={isOpen}
      title="Cash Payment"
      onClose={onClose}
    >
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Service:</span>
            <span className="font-medium">{appointment.serviceOrdered}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Style:</span>
            <span className="font-medium">{appointment.styleOrdered}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Price:</span>
              <span className="font-bold text-lg">₱{appointment.finalPrice || appointment.totalPrice}</span>
            </div>
          </div>
          {appointment.discountAmount && appointment.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-₱{appointment.discountAmount}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-amber-800">
          <i className="fas fa-info-circle mr-2"></i>
          Please confirm that you have received the cash payment of <strong>₱{appointment.finalPrice || appointment.totalPrice}</strong> from the client.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <ModalButtons
        onCancel={onClose}
        onConfirm={handlePaymentConfirm}
        cancelText="Cancel"
        confirmText="Confirm Payment"
        confirmType="success"
        isLoading={isProcessing}
        disabled={isProcessing || isSubmitting}
      />
    </StandardModal>
  );
};

