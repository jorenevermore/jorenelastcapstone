'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { Notification } from '../utils/notificationHelpers';
import { NotificationsPageService } from '../services/notification/NotificationsPageService';

const notificationsPageService = new NotificationsPageService(db);

export const useNotificationsPage = () => {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (barbershopId: string) => {
    setLoading(true);
    setError(null);

    const result = await notificationsPageService.fetchNotifications(barbershopId);
    if (result.success && result.data) {
      setNotifications(result.data);
    } else {
      setError(result.message || 'Failed to load notifications');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    fetchNotifications(user.uid);
  }, [user, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    let isAlreadyRead = false;
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      isAlreadyRead = notification?.read || false;
      return prev;
    });

    if (isAlreadyRead) return true;

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );

    const result = await notificationsPageService.markAsRead(notificationId);
    if (!result.success) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
      );
      setError(result.message || 'Failed to mark notification as read');
      return false;
    }
    return true;
  }, []);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead
  };
};

