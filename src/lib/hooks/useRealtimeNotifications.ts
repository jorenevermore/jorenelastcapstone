
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import {
  Notification,
  sortNotificationsByTimestamp,
  parseNotificationId,
  getNotificationRef,
  transformAffiliationToNotification,
  transformBookingToNotification
} from '../utils/notificationHelpers';
import { StaffManagementService } from '../services/staff/StaffManagementService';

export const useRealtimeNotifications = () => {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    // check current state without depending on notifications
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
      prev.map(n => n.id === notificationId ? Object.assign({}, n, { read: true }) : n)
    );

    try {
      const docRef = getNotificationRef(parsed);
      if (!docRef) throw new Error('Could not get document reference');

      await updateDoc(docRef, { markedAsRead: true });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? Object.assign({}, n, { read: false }) : n)
      );

      setError('Failed to mark notification as read');
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    let unreadNotifications: Notification[] = [];

    // get current unread notifications
    setNotifications(prev => {
      unreadNotifications = prev.filter(n => !n.read);
      return prev;
    });

    if (unreadNotifications.length === 0) return true;

    setNotifications(prev => prev.map(n => Object.assign({}, n, { read: true })));

    try {
      const batch = writeBatch(db);
      let batchCount = 0;

      for (const notification of unreadNotifications) {
        const parsed = parseNotificationId(notification.id);
        if (!parsed) continue;

        const docRef = getNotificationRef(parsed);
        if (!docRef) continue;

        batch.update(docRef, { markedAsRead: true });
        batchCount++;

        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);

      setNotifications(prev =>
        prev.map(notification => {
          const wasUnread = unreadNotifications.find(n => n.id === notification.id);
          return wasUnread ? Object.assign({}, notification, { read: false }) : notification;
        })
      );

      setError('Failed to mark all notifications as read');
      return false;
    }
  }, []);

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

    // initialize services
    const staffService = new StaffManagementService(db);

    // subscribe to pending affiliations using service
    const unsubscribeAffiliations = staffService.subscribeToPendingAffiliations(
      user.uid,
      (barbers) => {
        try {
          const affiliationNotifications: Notification[] = barbers
            .map(transformAffiliationToNotification)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 20);

          setNotifications(prev => {
            const otherNotifs = prev.filter(n => n.type !== 'affiliation_request');
            return sortNotificationsByTimestamp(affiliationNotifications.concat(otherNotifs));
          });
          setLoading(false);
        } catch (error) {
          console.error('Error processing affiliations:', error);
          setError('Failed to load affiliation notifications');
        }
      },
      (error) => {
        console.error('Error in affiliations listener:', error);
        setError('Failed to load affiliation notifications');
        setLoading(false);
      }
    );

    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('barbershopId', '==', user.uid)
    );

    const unsubscribeBookings = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        try {
          const bookingNotifications: Notification[] = snapshot.docs
            .map(docSnapshot => {
              const booking = Object.assign({}, docSnapshot.data(), { id: docSnapshot.id });
              return transformBookingToNotification(booking);
            })

            .filter(notif => (notif.data as any).status === 'pending')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 20);

          setNotifications(prev => {
            const otherNotifs = prev.filter(n => n.type !== 'booking');
            return sortNotificationsByTimestamp(bookingNotifications.concat(otherNotifs));
          });
          setLoading(false);
        } catch (error) {
          console.error('Error processing bookings:', error);
          setError('Failed to load booking notifications');
        }
      },
      (error) => {
        console.error('Error in bookings listener:', error);
        setError('Failed to load booking notifications');
        setLoading(false);
      }
    );

    return () => {
      unsubscribeAffiliations();
      unsubscribeBookings();
    };
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

