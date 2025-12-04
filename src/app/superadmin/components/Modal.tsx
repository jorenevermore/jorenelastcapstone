'use client';

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export let Modal = ({ isOpen, title, children, onClose }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-semibold text-black mb-3">{title}</h3>
        {children}
      </div>
    </div>
  );
};

