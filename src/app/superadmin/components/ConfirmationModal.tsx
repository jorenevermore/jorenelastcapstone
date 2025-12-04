'use client';

import React from 'react';
import { Modal } from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export let ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel
}: ConfirmationModalProps) => {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <p className="text-gray-600 mb-4 text-sm">{message}</p>
      <div className="flex space-x-2">
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 px-3 py-1.5 text-white rounded text-sm transition-colors disabled:opacity-50"
          style={{ backgroundColor: isDangerous ? '#DC2626' : '#BF8F63' }}
          onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = isDangerous ? '#B91C1C' : '#A67C52')}
          onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = isDangerous ? '#DC2626' : '#BF8F63')}
        >
          {isLoading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

