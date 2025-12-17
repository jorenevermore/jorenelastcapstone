
import { collection, addDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import type { Booking } from '../../../types/appointments';
import type { ServiceResponse } from '../../../types/api';

export interface NotificationData  {
  userId: string;
  bookingId: string;
  fromId: string;
  type: string;
  title: string;
  message: string;
  reason: string;
  isRead?: boolean;
  createdAt?: string;
}

export class NotificationService {
  private readonly COLLECTION = 'notifications';

  constructor(private db: Firestore) {}

  async notifyNextInQueue(booking: Booking): Promise<ServiceResponse> {
    return this.createNotification({
      userId: booking.clientId,
      bookingId: booking.id,
      fromId: booking.barbershopId,
      type: 'next-in-queue',
      title: 'Next in Queue',
      message: 'You have reached the front of the queue! Please arrive at the barbershop shortly to keep your appointment on schedule.',
      reason: 'you are next in queue'
    });
  }

  async notifyServiceStarted(booking: Booking): Promise<ServiceResponse> {
    return this.createNotification({
      userId: booking.clientId,
      bookingId: booking.id,
      fromId: booking.barbershopId,
      type: 'called-to-service',
      title: 'Service Started',
      message: 'Your barber is now ready for you!',
      reason: 'service started'
    });
  }

  async notifyNoShow(booking: Booking, reason?: string): Promise<ServiceResponse> {
    return this.createNotification({
      userId: booking.clientId,
      bookingId: booking.id,
      fromId: booking.barbershopId,
      type: 'no-show',
      title: 'Appointment Marked as No-Show',
      message: `Your appointment has been marked as no-show. ${reason ? `Reason: ${reason}` : ''}`,
      reason: 'no-show'
    });
  }

  async notifyCancelled(booking: Booking, reason?: string): Promise<ServiceResponse> {
    return this.createNotification({
      userId: booking.clientId,
      bookingId: booking.id,
      fromId: booking.barbershopId,
      type: 'cancelled',
      title: 'Appointment Cancelled',
      message: `We're sorry, your appointment has been cancelled. ${reason ? `Reason: ${reason}` : ''}`,
      reason: 'appointment cancelled'
    });
  }

  async notifyServiceCompleted(booking: Booking): Promise<ServiceResponse> {
    return this.createNotification({
      userId: booking.clientId,
      bookingId: booking.id,
      fromId: booking.barbershopId,
      type: 'completed',
      title: 'Service Completed',
      message: 'Thank you for choosing our services! We hope to see you again soon.',
      reason: 'service completed'
    });
  }

  async notifyPaymentConfirmed(booking: Booking, amount: number): Promise<ServiceResponse> {
    return this.createNotification({
      userId: booking.clientId,
      bookingId: booking.id,
      fromId: booking.barbershopId,
      type: 'payment-confirmed',
      title: 'Payment Confirmed',
      message: `Payment of ₱${amount} has been confirmed. Thank you!`,
      reason: 'payment confirmed'
    });
  }
  
  private async createNotification(data: NotificationData ): Promise<ServiceResponse> {
    try {
      const notificationsRef = collection(this.db, this.COLLECTION);

      const notificationData = {
        ...data,
        isRead: data.isRead ?? false,
        createdAt: serverTimestamp()
      };

      await addDoc(notificationsRef, notificationData);
      return {
        success: true,
        message: 'Notification sent successfully'
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      return {
        success: false,
        message: 'Failed to send notification',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

