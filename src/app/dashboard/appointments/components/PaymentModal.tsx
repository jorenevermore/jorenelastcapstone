'use client';

import React, { useState } from 'react';
import { Booking } from '../types';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Cash Payment</h3>
        
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <i className="fas fa-info-circle mr-2"></i>
            Please confirm that you have received the cash payment of <strong>₱{appointment.finalPrice || appointment.totalPrice}</strong> from the client.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={isProcessing || isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePaymentConfirm}
            disabled={isProcessing || isSubmitting}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-check mr-2"></i>
                Confirm Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

