'use client';

import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

export let EmptyState = ({ icon, title, description }: EmptyStateProps) => {
  return (
    <div className="text-center py-6 px-4 bg-gray-50 rounded border border-gray-200">
      <i className={`${icon} text-gray-300 text-3xl block mb-2`}></i>
      <h3 className="font-medium text-gray-900 text-sm mb-1">{title}</h3>
      <p className="text-gray-600 text-xs">{description}</p>
    </div>
  );
};

