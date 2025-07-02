'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { getPendingAffiliations, Barber } from '../services/barberService';

export interface Notification {
  id: string;
  type: 'affiliation_request';
  title: string;
  message: string;
  data: Barber;
  timestamp: string;
  read: boolean;
}

export const useNotifications = () => {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pending affiliations and convert to notifications
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const pendingBarbers = await getPendingAffiliations(user.uid);
      
      const newNotifications: Notification[] = pendingBarbers.map(barber => ({
        id: barber.barberId,
        type: 'affiliation_request',
        title: 'New Barber Affiliation Request',
        message: `${barber.fullName} wants to join your barbershop`,
        data: barber,
        timestamp: barber.createdAt || new Date().toISOString(),
        read: false
      }));

      setNotifications(newNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Auto-fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up polling for real-time updates (every 30 seconds)
      const interval = setInterval(fetchNotifications, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
};
