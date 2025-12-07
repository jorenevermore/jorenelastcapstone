'use client';

import React from 'react';
import { MayaPaymentReceipt } from '../../../../lib/services/payment/MayaPaymentService';

interface MayaReceiptModalProps {
  isOpen: boolean;
  receipt: MayaPaymentReceipt | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export const MayaReceiptModal = ({
  isOpen,
  receipt,
  loading,
  error,
  onClose
}: MayaReceiptModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center">
            <i className="fas fa-receipt mr-2"></i>
            Payment Receipt
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-gray-600 text-sm">Loading receipt...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </p>
            </div>
          )}

          {receipt && !loading && (
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                  <i className="fas fa-check-circle mr-2"></i>
                  {receipt.status}
                </span>
              </div>

              {/* Amount */}
              <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                <p className="text-gray-600 text-sm mb-1">Amount Paid</p>
                <p className="text-3xl font-bold text-blue-600">
                  {receipt.currency} {parseFloat(receipt.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Receipt Details */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Receipt No:</span>
                  <span className="font-mono text-sm font-medium">{receipt.receiptNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Approval Code:</span>
                  <span className="font-mono text-sm font-medium">{receipt.approvalCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Transaction ID:</span>
                  <span className="font-mono text-xs font-medium break-all">{receipt.transactionId}</span>
                </div>
              </div>

              {/* Card Details */}
              {receipt.fundSource?.details && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-3 uppercase">Payment Method</p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <i className="fas fa-credit-card text-gray-400 mr-2"></i>
                      <span className="text-sm text-gray-700 capitalize">{receipt.fundSource.details.scheme}</span>
                    </div>
                    <div className="text-sm font-mono text-gray-600">
                      {receipt.fundSource.details.masked}
                    </div>
                    <div className="text-xs text-gray-500">
                      {receipt.fundSource.details.issuer}
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-xs text-gray-500 space-y-1 border-t border-gray-200 pt-4">
                <div>
                  <span className="font-medium">Created:</span> {new Date(receipt.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Updated:</span> {new Date(receipt.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

