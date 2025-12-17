
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import {
  updateDoc
} from 'firebase/firestore';
import {
  Notification,
  sortNotificationsByTimestamp,
  parseNotificationId,
  getNotificationRef,
  transformAffiliationToNotification,
  transformMessageToNotification,
  transformBookingToNotification
} from '../utils/notificationHelpers';
import { AppointmentService } from '../services/appointment/AppointmentService';
import { MessagingService } from '../services/messaging/MessagingService';
import { StaffManagementService } from '../services/staff/StaffManagementService';

export const useNotificationsPage = () => {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (barbershopId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Initialize services
      const appointmentService = new AppointmentService(db);
      const messagingService = new MessagingService(db);
      const staffService = new StaffManagementService(db);

      const affiliationsResult = await staffService.getPendingAffiliations(barbershopId);
      const affiliationNotifications: Notification[] = (affiliationsResult.data || [])
        .map(transformAffiliationToNotification)
        .sort((a: Notification, b: Notification) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20);

      const messagesResult = await messagingService.getMessagesForBarbershop(barbershopId);
      const messageNotifications: Notification[] = (messagesResult.data || [])
        .filter((msg: any) => msg.from === 'client')
        .map(transformMessageToNotification)
        .sort((a: Notification, b: Notification) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20);

      const bookingsResult = await appointmentService.getBookingsByBarbershop(barbershopId);
      const bookingNotifications: Notification[] = (bookingsResult.data || [])
        .map(transformBookingToNotification)
        .sort((a: Notification, b: Notification) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20);

      const allNotifications = sortNotificationsByTimestamp([...affiliationNotifications, ...messageNotifications, ...bookingNotifications]);
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
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
    // Check current state without depending on notifications
    let isAlreadyRead = false;
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      isAlreadyRead = notification?.read || false;
      return prev;
    });

    if (isAlreadyRead) {
      return true;
    }

    const parsed = parseNotificationId(notificationId);
    if (!parsed) {
      console.error('Invalid notification ID format:', notificationId);
      return false;
    }

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );

    try {
      const docRef = getNotificationRef(parsed);
      if (!docRef) throw new Error('Could not get document reference');
      await updateDoc(docRef, { markedAsRead: true });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
      );
      setError('Failed to mark notification as read');
      return false;
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead
  };
};

