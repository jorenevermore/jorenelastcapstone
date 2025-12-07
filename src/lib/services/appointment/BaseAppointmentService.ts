/**
 * Base Appointment Service
 * Provides common appointment functionality and validation
 */

export interface Booking {
  id: string;
  clientName: string;
  clientId: string;
  serviceOrdered: string;
  barberName: string;
  styleOrdered: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'completedAndReviewed' | 'cancelled' | 'declined' | 'no-show';
  barbershopId: string;
  totalPrice: number;
  discountAmount?: number;
  finalPrice?: number;
  reason?: string;
  barberReason?: string;
  isEmergency?: boolean;
  queuePosition?: number;
  notificationStatus?: 'next-in-queue' | 'called-to-service';
  createdAt?: string;
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class BaseAppointmentService {
  protected validateBooking(booking: Partial<Booking>): ServiceResponse {
    if (!booking.clientName || !booking.clientName.trim()) {
      return {
        success: false,
        message: 'Client name is required',
        error: 'INVALID_CLIENT_NAME'
      };
    }

    if (!booking.date || !booking.time) {
      return {
        success: false,
        message: 'Date and time are required',
        error: 'INVALID_DATETIME'
      };
    }

    if (!booking.serviceOrdered) {
      return {
        success: false,
        message: 'Service is required',
        error: 'INVALID_SERVICE'
      };
    }

    return { success: true, message: 'Booking valid' };
  }

  protected validateStatus(status: string): ServiceResponse {
    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'completedAndReviewed', 'cancelled', 'declined', 'no-show'];
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        message: 'Invalid status',
        error: 'INVALID_STATUS'
      };
    }
    return { success: true, message: 'Status valid' };
  }

  protected handleError(error: unknown): ServiceResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Appointment error:', errorMessage);
    return {
      success: false,
      message: 'Operation failed',
      error: errorMessage
    };
  }

  protected logOperation(operation: string, bookingId: string, success: boolean): void {
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILED';
    console.log(`[${timestamp}] ${operation} - ${status} - Booking: ${bookingId}`);
  }
}

