'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../lib/hooks/useNotifications';
import { useStaff } from '../lib/hooks/useStaff';
import { parseBookingDateTime } from '../lib/utils/dateParser';

const NotificationDropdown: React.FC = () => {
  const router = useRouter();
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

  const { updateAffiliationStatus } = useStaff();

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

  // Handle affiliation approval/rejection using OOP hook
  const handleAffiliationAction = async (barberId: string, action: 'approved' | 'rejected') => {
    try {
      setProcessingId(barberId);
      const result = await updateAffiliationStatus(barberId, action);

      if (result.success) {
        // Refresh notifications
        await fetchNotifications();
        // Mark as read
        markAsRead(barberId);
      } else {
        console.error('Error updating affiliation status:', result.message);
      }
    } catch (error) {
      console.error('Error updating affiliation status:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Format timestamp to relative time (e.g., "5m ago", "2h ago")
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
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    // Navigate to appointments page for booking or message notifications
                    if (notification.type === 'booking' && 'bookingId' in notification.data) {
                      router.push(`/dashboard/appointments`);
                      setIsOpen(false);
                    } else if (notification.type === 'message_reply' && 'appointmentId' in notification.data) {
                      router.push(`/dashboard/appointments/${notification.data.appointmentId}`);
                      setIsOpen(false);
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100">
                      <i className={`${
                        notification.type === 'message_reply'
                          ? 'fas fa-comment text-slate-600'
                          : notification.type === 'booking'
                          ? 'fas fa-calendar text-gray-600'
                          : 'fas fa-user-plus text-slate-600'
                      }`}></i>
                    </div>

                    {/* Content */}
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

                      {/* Affiliation Details */}
                      {notification.type === 'affiliation_request' && 'fullName' in notification.data && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="text-xs text-gray-500 mb-1">Barber Details:</div>
                          <div className="text-sm">
                            <div><strong>Name:</strong> {notification.data.fullName}</div>
                            <div><strong>Email:</strong> {notification.data.email}</div>
                            <div><strong>Phone:</strong> {notification.data.contactNumber}</div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons - Affiliation */}
                      {notification.type === 'affiliation_request' && (
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
                      )}



                      {/* Action Button - Message */}
                      {notification.type === 'message_reply' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if ('appointmentId' in notification.data) {
                              router.push(`/dashboard/appointments/${notification.data.appointmentId}`);
                              setIsOpen(false);
                            }
                          }}
                          className="w-full bg-green-600 text-white text-sm py-2 px-3 rounded-md hover:bg-green-700 transition-colors"
                        >
                          <i className="fas fa-reply mr-1"></i>
                          View Message
                        </button>
                      )}
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
