'use client';

import React, { useState } from 'react';
import { useNotifications } from '../../../hooks/useNotifications';
import { updateAffiliationStatus } from '../../../services/barberService';

export default function NotificationsPage() {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { 
    notifications, 
    loading, 
    error,
    fetchNotifications,
    markAsRead 
  } = useNotifications();

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
        <p className="text-gray-600 mt-1">Manage barber affiliation requests and other notifications</p>
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
              className={`bg-white rounded-lg shadow-sm border transition-all duration-200 ${
                !notification.read 
                  ? 'border-blue-200 bg-blue-50/30' 
                  : 'border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-user-plus text-blue-600 text-lg"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500">
                        <i className="fas fa-clock mr-1"></i>
                        {formatDate(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  {!notification.read && (
                    <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0"></div>
                  )}
                </div>

                {/* Barber Details Card */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <i className="fas fa-user text-gray-500 mr-2"></i>
                    Barber Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <p className="text-gray-900">{notification.data.fullName}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{notification.data.email}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                      <p className="text-gray-900">{notification.data.contactNumber}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <p className="text-gray-900">{notification.data.address}</p>
                    </div>
                  </div>

                  {notification.data.image && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                      <img
                        src={notification.data.image}
                        alt={notification.data.fullName}
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAffiliationAction(notification.id, 'approved')}
                    disabled={processingId === notification.id}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {processingId === notification.id ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check mr-2"></i>
                        Approve Request
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleAffiliationAction(notification.id, 'rejected')}
                    disabled={processingId === notification.id}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {processingId === notification.id ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-times mr-2"></i>
                        Reject Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
