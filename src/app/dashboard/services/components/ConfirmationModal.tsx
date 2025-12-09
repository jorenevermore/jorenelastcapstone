'use client';

import React, { useState } from 'react';
import { StandardModal, ModalButtons } from '../../components';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const getIconClass = () => {
    switch (type) {
      case 'danger':
        return 'text-red-500 bg-red-100';
      case 'warning':
        return 'text-yellow-500 bg-yellow-100';
      case 'info':
        return 'text-blue-500 bg-blue-100';
      default:
        return 'text-red-500 bg-red-100';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return 'fas fa-exclamation-triangle';
      case 'warning':
        return 'fas fa-exclamation-circle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-exclamation-triangle';
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <StandardModal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className={`flex-shrink-0 p-3 rounded-full ${getIconClass()}`}>
          <i className={`${getIcon()} text-lg`}></i>
        </div>
        <p className="text-sm text-gray-600">{message}</p>
      </div>

      <ModalButtons
        onCancel={onClose}
        onConfirm={handleConfirm}
        cancelText={cancelText}
        confirmText={confirmText}
        confirmType={type as 'danger' | 'warning' | 'primary'}
        isLoading={isLoading}
      />
    </StandardModal>
  );
};

export default ConfirmationModal;
