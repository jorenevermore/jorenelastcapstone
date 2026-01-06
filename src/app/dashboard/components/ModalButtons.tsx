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
  primary: 'text-white transition-colors disabled:opacity-50',
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
        className={`flex-1 px-4 py-2 rounded text-sm font-medium ${confirmTypeColors[confirmType]}`}
        style={confirmType === 'primary' ? { backgroundColor: '#BF8F63' } : {}}
        onMouseEnter={(e) => confirmType === 'primary' && !isLoading && !disabled && (e.currentTarget.style.backgroundColor = '#A67C52')}
        onMouseLeave={(e) => confirmType === 'primary' && !isLoading && !disabled && (e.currentTarget.style.backgroundColor = '#BF8F63')}
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

