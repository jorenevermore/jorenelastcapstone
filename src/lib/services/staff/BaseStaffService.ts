
export interface Barber {
  address: string;
  affiliatedBarbershop: string;
  affiliatedBarbershopId: string;
  barberId: string;
  contactNumber: string;
  email: string;
  fullName: string;
  isAvailable: boolean;
  image?: string | null;
  affiliationStatus?: 'pending' | 'confirmed' | 'declined';
  createdAt?: string;
  isProfileCompleted?: boolean;
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class BaseStaffService {
  protected validateBarberData(barber: Partial<Barber>): ServiceResponse {
    if (barber.fullName && barber.fullName.trim().length < 2) {
      return {
        success: false,
        message: 'Full name must be at least 2 characters',
        error: 'INVALID_NAME'
      };
    }

    if (barber.email && !this.isValidEmail(barber.email)) {
      return {
        success: false,
        message: 'Invalid email format',
        error: 'INVALID_EMAIL'
      };
    }

    if (barber.contactNumber && barber.contactNumber.trim().length < 7) {
      return {
        success: false,
        message: 'Contact number must be at least 7 characters',
        error: 'INVALID_PHONE'
      };
    }

    return { success: true, message: 'Barber data valid' };
  }

  protected isValidEmail(email: string): boolean {
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected handleError(error: unknown): ServiceResponse {
    let errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Staff service error:', errorMessage);
    return {
      success: false,
      message: 'Operation failed',
      error: errorMessage
    };
  }

  protected logOperation(operation: string, barberId: string, success: boolean): void {
    let timestamp = new Date().toISOString();
    let status = success ? 'SUCCESS' : 'FAILED';
    console.log(`[${timestamp}] ${operation} - ${status} - ${barberId}`);
  }
}

