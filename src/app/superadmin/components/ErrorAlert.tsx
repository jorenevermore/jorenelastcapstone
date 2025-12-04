'use client';

import React from 'react';

interface ErrorAlertProps {
  message: string;
}

export let ErrorAlert = ({ message }: ErrorAlertProps) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
      <div className="flex items-center">
        <i className="fas fa-exclamation-triangle mr-2"></i>
        <span>{message}</span>
      </div>
    </div>
  );
};

