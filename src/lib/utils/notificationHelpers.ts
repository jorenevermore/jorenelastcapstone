import { DocumentReference, doc } from 'firebase/firestore';
import { db } from '../firebase';

export interface Notification {
  id: string;
  type: 'affiliation_request' | 'message_reply' | 'booking';
  title: string;
  message: string;
  data: any;
  timestamp: string;
  read: boolean;
}

export const sortNotificationsByTimestamp = (notifs: Notification[]): Notification[] => {
  return [...notifs].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });
};

export const parseNotificationId = (notificationId: string): { type: 'booking' | 'message' | 'affiliation'; id: string } | null => {
  if (notificationId.startsWith('booking-')) {
    return { type: 'booking', id: notificationId.replace('booking-', '') };
  }
  if (notificationId.startsWith('msg-')) {
    return { type: 'message', id: notificationId.replace('msg-', '') };
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
      case 'message':
        return doc(db, 'messages', parsed.id);
      case 'affiliation':
        return doc(db, 'barbersprofile', parsed.id);
      default:
        return null;
    }
  } catch (err) {
    console.error('Invalid document reference:', err);
    return null;
  }
};

// Transform barber data to affiliation notification
export const transformAffiliationToNotification = (barber: any): Notification => {
  return {
    id: `affiliation-${barber.barberId}`,
    type: 'affiliation_request' as const,
    title: 'New Barber Affiliation Request',
    message: `${barber.fullName || 'A barber'} has sent an affiliation request to your barbershop.`,
    data: { barberId: barber.barberId, fullName: barber.fullName, ...barber },
    timestamp: barber.createdAt || new Date().toISOString(),
    read: barber.markedAsRead === true
  };
};

// Transform message data to message notification
export const transformMessageToNotification = (msg: any): Notification => {
  return {
    id: `msg-${msg.id}`,
    type: 'message_reply' as const,
    title: `New message from ${msg.clientName || 'Client'}`,
    message: (msg.message || '').substring(0, 50) + ((msg.message || '').length > 50 ? '...' : ''),
    data: { clientName: msg.clientName || 'Client', appointmentId: msg.appointmentId || '', clientId: msg.clientId },
    timestamp: msg.timestamp || new Date().toISOString(),
    read: msg.markedAsRead === true
  };
};

// Transform booking data to booking notification
export const transformBookingToNotification = (booking: any): Notification => {
  let timestamp = new Date().toISOString();
  try {
    if (booking.createdAt) {
      timestamp = typeof booking.createdAt === 'string'
        ? new Date(parseInt(booking.createdAt)).toISOString()
        : booking.createdAt.toDate().toISOString();
    }
  } catch (err) {
    console.warn('Invalid timestamp for booking:', booking.id);
  }
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

