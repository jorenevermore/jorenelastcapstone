'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRealtimeNotifications } from '../lib/hooks/useRealtimeNotifications';
import { parseBookingDateTime, formatTimeAgo as formatTimeAgoUtil } from '../lib/utils/dateParser';

const NotificationDropdown: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  } = useRealtimeNotifications();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const formatTimeAgo = (timestamp: string) => {
    let milliseconds: string;
    if (timestamp.includes('-') || timestamp.includes('T')) {
      milliseconds = new Date(timestamp).getTime().toString();
    } else {
      milliseconds = timestamp;
    }
    return formatTimeAgoUtil(milliseconds);
  };

  return (
    <div className="relative" ref={dropdownRef}>
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
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">

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
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.type === 'booking' && 'bookingId' in notification.data) {
                      router.push(`/dashboard/appointments/${notification.data.bookingId}`);
                      setIsOpen(false);
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100">
                      <i className={`${
                        notification.type === 'booking'
                          ? 'fas fa-calendar text-gray-600'
                          : 'fas fa-user-plus text-slate-600'
                      }`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {notification.type === 'booking' && 'bookingId' in notification.data && (() => {
                            const parsed = parseBookingDateTime((notification.data as any).date || '', (notification.data as any).time || '');
                            return (
                              <>
                                <p className="text-sm text-gray-900">
                                  <span className="font-medium">{(notification.data as any).clientName}</span> booked a <span className="font-medium">{(notification.data as any).styleOrdered}</span> for {parsed.date} <span className="font-medium">({parsed.sessionLabel})</span>.
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Placed on: {formatTimeAgo(notification.timestamp)}
                                </p>
                              </>
                            );
                          })()}
                          {notification.type !== 'booking' && (
                            <p className="text-sm text-gray-900">
                              {notification.message}
                            </p>
                          )}
                        </div>
                        {notification.type !== 'booking' && (
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                        )}
                      </div>


                    </div>

                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

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
