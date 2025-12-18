'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { Notification } from '../utils/notificationHelpers';
import { RealtimeNotificationService } from '../services/notification/RealtimeNotificationService';

const notificationService = new RealtimeNotificationService(db);

export const useRealtimeNotifications = () => {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const result = await notificationService.markAsRead(notificationId);
    if (!result.success) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
      );
      setError(result.message || 'Failed to mark notification as read');
      return false;
    }
    return true;
  }, []);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return true;

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    const result = await notificationService.markAllAsRead(notifications);
    if (!result.success) {
      setNotifications(prev =>
        prev.map(notification => {
          const wasUnread = unreadNotifications.find(n => n.id === notification.id);
          return wasUnread ? { ...notification, read: false } : notification;
        })
      );
      setError(result.message || 'Failed to mark all notifications as read');
      return false;
    }
    return true;
  }, [notifications]);

  const unreadCount = useMemo(() =>
    notifications.filter(n => !n.read).length,
    [notifications]
  );

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = notificationService.subscribeToNotifications(
      user.uid,
      (notifs) => {
        setNotifications(notifs);
        setLoading(false);
      },
      (err) => {
        console.error('Error in notifications listener:', err);
        setError('Failed to load notifications');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead
  };
};

