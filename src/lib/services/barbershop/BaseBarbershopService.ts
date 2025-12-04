/**
 * Base Barbershop Service
 * Provides common barbershop functionality
 */

export interface Location {
  lat: number;
  lng: number;
}

export interface BarbershopProfile {
  barbershopId: string;
  name: string;
  phone: string;
  email: string;
  location: Location;
  geohash: string;
  isOpen?: boolean;
  barbers?: string[];
  services?: string[];
  createdAt: number;
  status: 'active' | 'inactive' | 'suspended';
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class BaseBarbershopService {
  protected validateLocation(location: Location): ServiceResponse {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return {
        success: false,
        message: 'Invalid location coordinates',
        error: 'INVALID_LOCATION'
      };
    }

    if (location.lat < -90 || location.lat > 90 || location.lng < -180 || location.lng > 180) {
      return {
        success: false,
        message: 'Location coordinates out of range',
        error: 'OUT_OF_RANGE'
      };
    }

    return { success: true, message: 'Location valid' };
  }

  protected validatePhone(phone: string): ServiceResponse {
    const phoneRegex = /^[0-9\s\-\+\(\)]{7,}$/;
    if (!phoneRegex.test(phone)) {
      return {
        success: false,
        message: 'Invalid phone number format',
        error: 'INVALID_PHONE'
      };
    }
    return { success: true, message: 'Phone valid' };
  }

  protected validateBarbershopName(name: string): ServiceResponse {
    if (!name || name.trim().length < 2) {
      return {
        success: false,
        message: 'Barbershop name must be at least 2 characters',
        error: 'INVALID_NAME'
      };
    }

    if (name.length > 100) {
      return {
        success: false,
        message: 'Barbershop name must not exceed 100 characters',
        error: 'NAME_TOO_LONG'
      };
    }

    return { success: true, message: 'Name valid' };
  }

  protected handleError(error: unknown): ServiceResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Barbershop service error:', errorMessage);
    return {
      success: false,
      message: 'Operation failed',
      error: errorMessage
    };
  }

  protected logOperation(operation: string, barbershopId: string, success: boolean): void {
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILED';
    console.log(`[${timestamp}] ${operation} - ${status} - ${barbershopId}`);
  }
}

