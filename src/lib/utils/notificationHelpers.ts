
import { DocumentReference, doc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Notification } from '../../types/notifications';
import type { Booking } from '../../types/appointments';
import type { Barber } from '../../types/barber';

export type { Notification };

export const sortNotificationsByTimestamp = (notifs: Notification[]): Notification[] => {
  return [...notifs].sort((a, b) => {

    let timeA: number;
    let timeB: number;

    try {
      timeA = new Date(a.timestamp).getTime();
      if (isNaN(timeA)) {
        timeA = parseInt(a.timestamp) || 0;
      }
    } catch {
      timeA = 0;
    }

    try {
      timeB = new Date(b.timestamp).getTime();
      if (isNaN(timeB)) {
        timeB = parseInt(b.timestamp) || 0;
      }
    } catch {
      timeB = 0;
    }
    return timeB - timeA;
  });
};

export const parseNotificationId = (notificationId: string): { type: 'booking' | 'affiliation'; id: string } | null => {
  if (notificationId.startsWith('booking-')) {
    return { type: 'booking', id: notificationId.replace('booking-', '') };
  }
  if (notificationId.startsWith('affiliation-')) {
    return { type: 'affiliation', id: notificationId.replace('affiliation-', '') };
  }
  return null;
};

export const getNotificationRef = (parsed: { type: string; id: string }): DocumentReference | null => {
  try {
    switch (parsed.type) {
      case 'booking':
        return doc(db, 'bookings', parsed.id);
      case 'affiliation':
        return doc(db, 'barbersprofile', parsed.id);
      default:
        return null;
    }
  } catch (error) {
    console.error('Invalid document reference:', error);
    return null;
  }
};

export const transformAffiliationToNotification = (barber: Barber & { markedAsRead?: boolean }): Notification => {
  return {
    id: `affiliation-${barber.barberId}`,
    type: 'affiliation_request' as const,
    title: 'New Barber Affiliation Request',
    message: `${barber.fullName || 'A barber'} has sent an affiliation request to your barbershop.`,
    data: { ...barber },
    timestamp: barber.createdAt || new Date().toISOString(),
    read: barber.markedAsRead === true
  };
};

export const transformBookingToNotification = (booking: Booking & { markedAsRead?: boolean }): Notification => {
  const timestamp = booking.createdAt
    ? new Date(parseInt(booking.createdAt)).toISOString()
    : new Date().toISOString();
  return {
    id: `booking-${booking.id}`,
    type: 'booking' as const,
    title: 'New Booking',
    message: `${booking.clientName || 'A client'} booked ${booking.styleOrdered || 'a service'}`,
    data: { bookingId: booking.id, clientName: booking.clientName || 'Unknown', styleOrdered: booking.styleOrdered || 'Unknown', date: booking.date || '', time: booking.time || '', status: booking.status },
    timestamp,
    read: booking.markedAsRead === true
  };
};

