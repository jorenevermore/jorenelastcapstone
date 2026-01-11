import { Firestore } from 'firebase/firestore';
import {
  Notification,
  sortNotificationsByTimestamp,
  transformAffiliationToNotification,
  transformBookingToNotification
} from '../../utils/notificationHelpers';
import { AppointmentService } from '../appointment/AppointmentService';
import { StaffManagementService } from '../staff/StaffManagementService';
import { RealtimeNotificationService } from './RealtimeNotificationService';
import type { ServiceResponse } from '../../../types/response';

export class NotificationsPageService {
  private appointmentService: AppointmentService;
  private staffService: StaffManagementService;
  private realtimeService: RealtimeNotificationService;

  constructor(private db: Firestore) {
    this.appointmentService = new AppointmentService(db);
    this.staffService = new StaffManagementService(db);
    this.realtimeService = new RealtimeNotificationService(db);
  }

  async fetchNotifications(barbershopId: string): Promise<ServiceResponse> {
    try {

      const affiliations = await this.staffService.getPendingAffiliations(barbershopId);

      const bookingsResult: any = await this.appointmentService.getBookingsByBarbershop(barbershopId);
      const bookings = Array.isArray(bookingsResult) ? bookingsResult : (bookingsResult?.data || []);

      const affiliationNotifications: Notification[] = (affiliations || [])
        .map(transformAffiliationToNotification)
        .slice(0, 20);

      const bookingNotifications: Notification[] = (bookings || [])
        .map(transformBookingToNotification)
        .slice(0, 20);

      const allNotifications = sortNotificationsByTimestamp([
        ...affiliationNotifications,
        ...bookingNotifications
      ]);

      return {
        success: true,
        message: 'Notifications fetched successfully',
        data: allNotifications
      };
    } catch (error) {
      console.error('Notifications fetch error:', error);
      return { success: false, message: 'Failed to fetch notifications' };
    }
  }

  async markAsRead(notificationId: string): Promise<ServiceResponse> {
    return this.realtimeService.markAsRead(notificationId);
  }
}
