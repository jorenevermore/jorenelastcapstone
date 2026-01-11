'use client';

import { useState, useCallback, useEffect } from 'react';
import { Notification } from '../utils/notificationHelpers';
import { NotificationsPageService } from '../services/notification/NotificationsPageService';
import { db } from '../firebase';

const notificationsPageService = new NotificationsPageService(db);

export const useNotificationsPage = (barbershopId: string | null | undefined) => {
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
      setNotifications([]);
      setError(result.message || 'Failed to load notifications');
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!barbershopId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    fetchNotifications(barbershopId);
  }, [barbershopId, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    const current = notifications.find(notification => notification.id === notificationId);
    if (current?.read) return true;

    setNotifications(prev =>
      prev.map(notification => (notification.id === notificationId ? { ...notification, read: true } : notification))
    );

    const result = await notificationsPageService.markAsRead(notificationId);

    if (!result.success) {
      // rollback
      setNotifications(prev =>
        prev.map(notification => (notification.id === notificationId ? { ...notification, read: false } : notification))
      );
      setError(result.message || 'Failed to mark notification as read');
      return false;
    }

    return true;
  }, [notifications]);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead
  };
};
