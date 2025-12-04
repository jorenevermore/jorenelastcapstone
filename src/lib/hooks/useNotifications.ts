'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { useStaff, Barber } from './useStaff';
import { useMessaging, Message } from './useMessaging';
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from 'firebase/firestore';

export interface Notification {
  id: string;
  type: 'affiliation_request' | 'message_reply' | 'booking';
  title: string;
  message: string;
  data: Barber | { clientName: string; appointmentId: string; clientId: string } | { bookingId: string; clientName: string; styleOrdered: string; date: string; time: string };
  timestamp: string;
  read: boolean;
}

const sortNotificationsByTimestamp = (notifs: Notification[]): Notification[] => {
  return [...notifs].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });
};

export const useNotifications = () => {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getPendingAffiliations, subscribeToPendingAffiliations } = useStaff();
  const { subscribeToClientMessages } = useMessaging();

  // fetch pending affiliations
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const result = await getPendingAffiliations(user.uid);

      if (result.success && result.data) {
        const pendingBarbers = result.data as Barber[];
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
      } else {
        setError(result.message || 'Failed to load notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user, getPendingAffiliations]);

  // Mark notification as read (persists to Firestore)
  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    // Persist to Firestore based on notification type
    try {
      if (notificationId.startsWith('booking-')) {
        // Mark booking as read
        const bookingId = notificationId.replace('booking-', '');
        const bookingRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingRef, { markedAsRead: true });
      } else if (notificationId.startsWith('msg-')) {
        // Mark message as read
        const messageId = notificationId.replace('msg-', '');
        const messageRef = doc(db, 'messages', messageId);
        await updateDoc(messageRef, { markedAsRead: true });
      } else {
        // Affiliation - the ID is the barberId directly
        const affiliationRef = doc(db, 'affiliations', notificationId);
        await updateDoc(affiliationRef, { markedAsRead: true });
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read (persists to Firestore)
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Persist all to Firestore
    try {
      for (const notification of notifications) {
        if (notification.id.startsWith('booking-')) {
          const bookingId = notification.id.replace('booking-', '');
          const bookingRef = doc(db, 'bookings', bookingId);
          await updateDoc(bookingRef, { markedAsRead: true });
        } else if (notification.id.startsWith('msg-')) {
          const messageId = notification.id.replace('msg-', '');
          const messageRef = doc(db, 'messages', messageId);
          await updateDoc(messageRef, { markedAsRead: true });
        } else {
          const affiliationRef = doc(db, 'affiliations', notification.id);
          await updateDoc(affiliationRef, { markedAsRead: true });
        }
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [notifications]);

  // Get unread count - memoized
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // Set up real-time listener for notifications
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to affiliation requests using OOP hook
    const unsubscribeAffiliations = subscribeToPendingAffiliations(
      user.uid,
      async (pendingBarbers: Barber[]) => {
        // Check markedAsRead status for each affiliation
        const affiliationNotifications: Notification[] = [];
        for (const barber of pendingBarbers) {
          const affiliationDoc = await getDoc(doc(db, 'affiliations', barber.barberId));
          const isRead = affiliationDoc.exists() && affiliationDoc.data()?.markedAsRead === true;

          affiliationNotifications.push({
            id: barber.barberId,
            type: 'affiliation_request',
            title: 'New Barber Affiliation Request',
            message: `${barber.fullName} wants to join your barbershop`,
            data: barber,
            timestamp: barber.createdAt || new Date().toISOString(),
            read: isRead
          });
        }

        setNotifications(prev => {
          // Keep message and booking notifications, replace affiliation notifications
          const otherNotifs = prev.filter(n => n.type === 'message_reply' || n.type === 'booking');
          const combined = [...affiliationNotifications, ...otherNotifs];
          return sortNotificationsByTimestamp(combined);
        });
        setLoading(false);
      },
      (err: Error) => {
        console.error('Error in notifications listener:', err);
        setError('Failed to load notifications');
        setLoading(false);
      }
    );

    // Subscribe to client messages using OOP hook
    const unsubscribeMessages = subscribeToClientMessages(
      user.uid,
      async (message: Message & { markedAsRead?: boolean }) => {
        try {
          // Skip if already marked as read
          const isRead = message.markedAsRead === true;

          // get client name
          const clientDoc = await getDoc(doc(db, 'users', message.clientId));
          const clientName = clientDoc.exists() ? clientDoc.data().fullName || 'Client' : 'Client';

          const messageNotification: Notification = {
            id: `msg-${message.id}`,
            type: 'message_reply',
            title: `New message from ${clientName}`,
            message: message.message.substring(0, 50) + (message.message.length > 50 ? '...' : ''),
            data: {
              clientName,
              appointmentId: message.appointmentId || '',
              clientId: message.clientId
            },
            timestamp: message.timestamp,
            read: isRead
          };

          setNotifications(prev => {
            // Check if this message notification already exists
            const existingIndex = prev.findIndex(n => n.id === `msg-${message.id}`);
            if (existingIndex !== -1) {
              // Update existing notification
              const updated = [...prev];
              updated[existingIndex] = messageNotification;
              return sortNotificationsByTimestamp(updated);
            }
            // Add new notification
            return sortNotificationsByTimestamp([messageNotification, ...prev]);
          });
        } catch (err) {
          console.error('Error processing message notification:', err);
        }
      },
      (err: Error) => {
        console.error('Error in messages listener:', err);
      }
    );

    // Subscribe to new bookings - Real-time listener for pending bookings
    const bookingsCollection = collection(db, 'bookings');
    const bookingsQuery = query(
      bookingsCollection,
      where('barbershopId', '==', user.uid),      // Only this barbershop's bookings
      where('status', '==', 'pending')             // Only pending (new) bookings
    );

    const unsubscribeBookings = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        // Process all pending bookings and build notifications list
        const bookingNotifications: Notification[] = [];

        snapshot.docs.forEach(docSnapshot => {
          const bookingData = docSnapshot.data();

          // Check if already marked as read
          const isRead = bookingData.markedAsRead === true;

          // Convert createdAt from milliseconds string to ISO string
          const createdAtTimestamp = bookingData.createdAt
            ? new Date(parseInt(bookingData.createdAt)).toISOString()
            : new Date().toISOString();

          bookingNotifications.push({
            id: `booking-${docSnapshot.id}`,
            type: 'booking',
            title: 'New Booking',
            message: `${bookingData.clientName} booked ${bookingData.styleOrdered}`,
            data: {
              bookingId: docSnapshot.id,
              clientName: bookingData.clientName,
              styleOrdered: bookingData.styleOrdered,
              date: bookingData.date,
              time: bookingData.time
            },
            timestamp: createdAtTimestamp,
            read: isRead
          });
        });

        // Update notifications - keep affiliations and messages, replace bookings
        setNotifications(prev => {
          const otherNotifs = prev.filter(n => n.type === 'affiliation_request' || n.type === 'message_reply');
          const combined = [...bookingNotifications, ...otherNotifs];
          return sortNotificationsByTimestamp(combined);
        });
        setLoading(false);
      },
      (error) => {
        console.error('Error in bookings listener:', error);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      unsubscribeAffiliations();
      unsubscribeMessages();
      unsubscribeBookings();
    };
  }, [user, subscribeToPendingAffiliations, subscribeToClientMessages]);

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

