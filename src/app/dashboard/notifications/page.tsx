'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../../../lib/hooks/useNotifications';
import { useStaff } from '../../../lib/hooks/useStaff';
import { parseBookingDateTime } from '../../../lib/utils/dateParser';

export default function NotificationsPage() {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead
  } = useNotifications();

  const { updateAffiliationStatus } = useStaff();
  // handle affiliation
  const handleAffiliationAction = async (barberId: string, action: 'approved' | 'rejected') => {
    try {
      setProcessingId(barberId);
      const result = await updateAffiliationStatus(barberId, action);

      if (result.success) {
        // refresh notifications
        await fetchNotifications();
        // mark as read
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

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-2"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-6xl text-gray-300 mb-4">
            <i className="fas fa-bell-slash"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No notifications</h3>
          <p className="text-gray-500">You're all caught up! New notifications will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                !notification.read ? 'bg-blue-50/30' : ''
              }`}
              onClick={() => {
                if (notification.type === 'booking') {
                  router.push(`/dashboard/appointments`);
                }
              }}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100">
                  <i className={`${
                    notification.type === 'message_reply'
                      ? 'fas fa-comment text-slate-600'
                      : notification.type === 'booking'
                      ? 'fas fa-calendar text-gray-600'
                      : 'fas fa-user-plus text-slate-600'
                  }`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  {notification.type === 'booking' && 'bookingId' in notification.data && (() => {
                    const parsed = parseBookingDateTime((notification.data as any).date || '', (notification.data as any).time || '');
                    return (
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{(notification.data as any).clientName}</span> booked a <span className="font-medium">{(notification.data as any).styleOrdered}</span> for {parsed.date} <span className="font-medium">({parsed.sessionLabel})</span>.
                      </p>
                    );
                  })()}
                  {notification.type !== 'booking' && (
                    <p className="text-sm text-gray-900">
                      {notification.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {notification.type === 'booking' ? 'Placed on: ' : ''}{formatDate(notification.timestamp)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>

              {/* Action Buttons - Affiliation */}
              {notification.type === 'affiliation_request' && (
                <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAffiliationAction(notification.id, 'approved');
                    }}
                    disabled={processingId === notification.id}
                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {processingId === notification.id ? (
                      <i className="fas fa-spinner fa-spin mr-1"></i>
                    ) : (
                      <i className="fas fa-check mr-1"></i>
                    )}
                    Approve
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAffiliationAction(notification.id, 'rejected');
                    }}
                    disabled={processingId === notification.id}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {processingId === notification.id ? (
                      <i className="fas fa-spinner fa-spin mr-1"></i>
                    ) : (
                      <i className="fas fa-times mr-1"></i>
                    )}
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
