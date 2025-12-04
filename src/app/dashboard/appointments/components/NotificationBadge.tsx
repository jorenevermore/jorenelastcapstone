'use client';

import React from 'react';

interface NotificationBadgeProps {
  notificationStatus?: 'next-in-queue' | 'called-to-service';
  size?: 'sm' | 'md' | 'lg';
}

const NotificationBadge = ({ notificationStatus, size = 'md' }: NotificationBadgeProps) => {
  if (!notificationStatus) return null;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const baseClasses = `inline-flex items-center gap-2 rounded-full font-semibold animate-pulse ${sizeClasses[size]}`;

  if (notificationStatus === 'next-in-queue') {
    return (
      <div className={`${baseClasses} bg-blue-100 text-blue-700 border border-blue-300`}>
        <i className="fas fa-bell text-blue-600"></i>
        <span>Next in Queue</span>
      </div>
    );
  }

  if (notificationStatus === 'called-to-service') {
    return (
      <div className={`${baseClasses} bg-green-100 text-green-700 border border-green-300 animate-bounce`}>
        <i className="fas fa-check-circle text-green-600"></i>
        <span>Come to Service!</span>
      </div>
    );
  }

  return null;
};

export default NotificationBadge;

