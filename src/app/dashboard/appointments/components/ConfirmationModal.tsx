'use client';

import React from 'react';

interface ConfirmationModalProps {
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  confirmColor?: string;
}

const ConfirmationModal = ({
  title,
  message,
  isOpen,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  confirmColor = 'bg-black'
}: ConfirmationModalProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-black">{title}</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-700">{message}</p>
        </div>
        <div className="p-4 bg-gray-50 flex justify-end space-x-3">
          <button 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className={`px-4 py-2 ${confirmColor} text-white rounded hover:opacity-90`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
