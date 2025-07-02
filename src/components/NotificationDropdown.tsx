'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '../hooks/useNotifications';
import { updateAffiliationStatus } from '../services/barberService';

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    fetchNotifications 
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle affiliation approval/rejection
  const handleAffiliationAction = async (barberId: string, action: 'approved' | 'rejected') => {
    try {
      setProcessingId(barberId);
      await updateAffiliationStatus(barberId, action);
      
      // Refresh notifications
      await fetchNotifications();
      
      // Mark as read
      markAsRead(barberId);
    } catch (error) {
      console.error('Error updating affiliation status:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button 
        className="text-gray-500 hover:text-gray-700 transition-colors relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-bell text-lg"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <i className="fas fa-spinner fa-spin text-gray-400 mb-2"></i>
                <p className="text-gray-500 text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <i className="fas fa-bell-slash text-gray-300 text-2xl mb-2"></i>
                <p className="text-gray-500 text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-user-plus text-blue-600"></i>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {notification.message}
                      </p>

                      {/* Barber Details */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="text-xs text-gray-500 mb-1">Barber Details:</div>
                        <div className="text-sm">
                          <div><strong>Name:</strong> {notification.data.fullName}</div>
                          <div><strong>Email:</strong> {notification.data.email}</div>
                          <div><strong>Phone:</strong> {notification.data.contactNumber}</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAffiliationAction(notification.id, 'approved');
                          }}
                          disabled={processingId === notification.id}
                          className="flex-1 bg-green-600 text-white text-sm py-2 px-3 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === notification.id ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <>
                              <i className="fas fa-check mr-1"></i>
                              Approve
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAffiliationAction(notification.id, 'rejected');
                          }}
                          disabled={processingId === notification.id}
                          className="flex-1 bg-red-600 text-white text-sm py-2 px-3 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === notification.id ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <>
                              <i className="fas fa-times mr-1"></i>
                              Reject
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <Link
                href="/dashboard/notifications"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
