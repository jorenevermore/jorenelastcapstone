import { collection, addDoc, updateDoc, doc, serverTimestamp, type Firestore } from 'firebase/firestore';
import type { Booking } from '../../../types/appointments';
import type { ServiceResponse } from '../../../types/response';

export interface NotificationData {
  userId: string;
  bookingId: string | null;
  fromId: string;
  type: string;
  title: string;
  message: string;
  data: null;
  isRead: boolean;
  readAt: null;
  createdAt?: any;
}

export class NotificationService {
  private readonly COLLECTION = 'notifications';

  constructor(private db: Firestore) {}

  async notifyNextInQueue(booking: Booking): Promise<ServiceResponse> {
    if (!booking.clientId || !booking.barbershopId) {
      return { success: false, message: 'Missing required booking fields' };
    }

    return this.createNotification({
      userId: booking.clientId,
      bookingId: booking.id ?? null,
      fromId: booking.barbershopId,
      type: 'next-in-queue',
      title: 'Next in Queue',
      message: 'You have reached the front of the queue! Please arrive at the barbershop shortly to keep your appointment on schedule.',
      data: null,
      isRead: false,
      readAt: null
    });
  }

  async notifyServiceStarted(booking: Booking): Promise<ServiceResponse> {
    if (!booking.clientId || !booking.barbershopId) {
      return { success: false, message: 'Missing required booking fields' };
    }

    return this.createNotification({
      userId: booking.clientId,
      bookingId: booking.id ?? null,
      fromId: booking.barbershopId,
      type: 'called-to-service',
      title: 'Service Started',
      message: 'Your barber is now ready for you!',
      data: null,
      isRead: false,
      readAt: null
    });
  }

  async notifyServiceStartedBarber(booking: Booking): Promise<ServiceResponse> {
    const clientName = booking.clientName ?? 'the client';

    if (!booking.barberId || !booking.barbershopId) {
      return { success: false, message: 'Missing required booking fields' };
    }

    return this.createNotification({
      userId: booking.barberId,
      bookingId: booking.id ?? null,
      fromId: booking.barbershopId,
      type: 'booking',
      title: 'The service has now started!',
      message: `You are now serving ${clientName}. You can either complete the booking yourself. Best if you let me?`,
      data: null,
      isRead: false,
      readAt: null
    });
  }

  async notifyNoShow(booking: Booking, reason?: string): Promise<ServiceResponse> {
    if (!booking.clientId || !booking.barbershopId) {
      return { success: false, message: 'Missing required booking fields' };
    }

    return this.createNotification({
      userId: booking.clientId,
      bookingId: booking.id ?? null,
      fromId: booking.barbershopId,
      type: 'no-show',
      title: 'Appointment Marked as No-Show',
      message: `Your appointment has been marked as no-show. ${reason ? `Reason: ${reason}` : ''}`,
      data: null,
      isRead: false,
      readAt: null
    });
  }

  async notifyCancelled(booking: Booking, reason?: string): Promise<ServiceResponse> {
    if (!booking.clientId || !booking.barbershopId) {
      return { success: false, message: 'Missing required booking fields' };
    }

    return this.createNotification({
      userId: booking.clientId,
      bookingId: booking.id ?? null,
      fromId: booking.barbershopId,
      type: 'cancelled',
      title: 'Appointment Cancelled',
      message: `We're sorry, your appointment has been cancelled. ${reason ? `Reason: ${reason}` : ''}`,
      data: null,
      isRead: false,
      readAt: null
    });
  }

  async notifyServiceCompleted(booking: Booking): Promise<ServiceResponse> {
    if (!booking.clientId || !booking.barbershopId) {
      return { success: false, message: 'Missing required booking fields' };
    }

    return this.createNotification({
      userId: booking.clientId,
      bookingId: booking.id ?? null,
      fromId: booking.barbershopId,
      type: 'completed',
      title: 'Service Completed',
      message: 'Thank you for choosing our services! We hope to see you again soon.',
      data: null,
      isRead: false,
      readAt: null
    });
  }

  async notifyPaymentConfirmed(booking: Booking, amount: number): Promise<ServiceResponse> {
    if (!booking.clientId || !booking.barbershopId) {
      return { success: false, message: 'Missing required booking fields' };
    }

    return this.createNotification({
      userId: booking.clientId,
      bookingId: booking.id ?? null,
      fromId: booking.barbershopId,
      type: 'payment-confirmed',
      title: 'Payment Confirmed',
      message: `Payment of ₱${amount} has been confirmed. Thank you!`,
      data: null,
      isRead: false,
      readAt: null
    });
  }

  private async createNotification(data: NotificationData): Promise<ServiceResponse> {
    try {
      const colRef = collection(this.db, this.COLLECTION);

      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(this.db, this.COLLECTION, docRef.id), {
        id: docRef.id
      });

      return { success: true, message: 'Notification sent successfully' };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Failed to send notification' };
    }
  }
}
