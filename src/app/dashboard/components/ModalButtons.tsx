'use client';

import React from 'react';

interface ModalButtonsProps {
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmType?: 'primary' | 'danger' | 'success' | 'warning';
  isLoading?: boolean;
  disabled?: boolean;
}

const confirmTypeColors = {
  primary: 'bg-amber-600 hover:bg-amber-700',
  danger: 'bg-red-500 hover:bg-red-600',
  success: 'bg-green-500 hover:bg-green-600',
  warning: 'bg-yellow-500 hover:bg-yellow-600'
};

export const ModalButtons = ({
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  confirmType = 'primary',
  isLoading = false,
  disabled = false
}: ModalButtonsProps) => {
  return (
    <div className="flex gap-3 pt-4">
      <button
        onClick={onCancel}
        disabled={isLoading || disabled}
        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        disabled={isLoading || disabled}
        className={`flex-1 px-4 py-2 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 ${confirmTypeColors[confirmType]}`}
      >
        {isLoading ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Processing...
          </>
        ) : (
          confirmText
        )}
      </button>
    </div>
  );
};

export default ModalButtons;

