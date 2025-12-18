import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  writeBatch,
  Firestore,
  Unsubscribe
} from 'firebase/firestore';
import {
  Notification,
  sortNotificationsByTimestamp,
  parseNotificationId,
  getNotificationRef,
  transformAffiliationToNotification,
  transformBookingToNotification
} from '../../utils/notificationHelpers';
import { StaffManagementService } from '../staff/StaffManagementService';
import type { ServiceResponse } from '../../../types/response';

export class RealtimeNotificationService {
  private staffService: StaffManagementService;

  constructor(private db: Firestore) {
    this.staffService = new StaffManagementService(db);
  }

  subscribeToNotifications(
    barbershopId: string,
    onUpdate: (notifications: Notification[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    let affiliationNotifications: Notification[] = [];
    let bookingNotifications: Notification[] = [];

    const unsubscribeAffiliations = this.staffService.subscribeToPendingAffiliations(
      barbershopId,
      (barbers) => {
        try {
          affiliationNotifications = barbers
            .map(transformAffiliationToNotification)
            .slice(0, 20);
          onUpdate(sortNotificationsByTimestamp([...affiliationNotifications, ...bookingNotifications]));
        } catch (error) {
          onError(new Error('Failed to process affiliations'));
        }
      },
      onError
    );

    const bookingsQuery = query(
      collection(this.db, 'bookings'),
      where('barbershopId', '==', barbershopId)
    );

    const unsubscribeBookings = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        try {
          bookingNotifications = snapshot.docs
            .map(doc => transformBookingToNotification({ id: doc.id, ...doc.data() } as any))
            .filter(notif => (notif.data as any).status === 'pending')
            .slice(0, 20);
          onUpdate(sortNotificationsByTimestamp([...affiliationNotifications, ...bookingNotifications]));
        } catch (error) {
          onError(new Error('Failed to process bookings'));
        }
      },
      onError
    );

    return () => {
      unsubscribeAffiliations();
      unsubscribeBookings();
    };
  }

  async markAsRead(notificationId: string): Promise<ServiceResponse> {
    const parsed = parseNotificationId(notificationId);
    if (!parsed) {
      return { success: false, message: 'Invalid notification ID format' };
    }

    try {
      const docRef = getNotificationRef(parsed);
      if (!docRef) throw new Error('Could not get document reference');
      await updateDoc(docRef, { markedAsRead: true });
      return { success: true, message: 'Notification marked as read' };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, message: 'Failed to mark notification as read' };
    }
  }
   
  async markAllAsRead(notifications: Notification[]): Promise<ServiceResponse> {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) {
      return { success: true, message: 'No unread notifications' };
    }

    try {
      const batch = writeBatch(this.db);
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

      return { success: true, message: 'All notifications marked as read' };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, message: 'Failed to mark all notifications as read' };
    }
  }
}

