
export interface ServiceItem {
  id: string;
  title: string;
  description?: string;
  price?: number;
  duration?: number;
  featuredImage?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class BaseServiceManagement {
  protected validateServiceTitle(title: string): ServiceResponse {
    if (!title || title.trim().length < 2) {
      return {
        success: false,
        message: 'Service title must be at least 2 characters',
        error: 'INVALID_TITLE'
      };
    }

    if (title.length > 100) {
      return {
        success: false,
        message: 'Service title must not exceed 100 characters',
        error: 'TITLE_TOO_LONG'
      };
    }

    return { success: true, message: 'Title valid' };
  }

  protected validatePrice(price: number): ServiceResponse {
    if (typeof price !== 'number' || price < 0) {
      return {
        success: false,
        message: 'Price must be a positive number',
        error: 'INVALID_PRICE'
      };
    }

    return { success: true, message: 'Price valid' };
  }

  protected validateDuration(duration: number): ServiceResponse {
    if (typeof duration !== 'number' || duration <= 0) {
      return {
        success: false,
        message: 'Duration must be a positive number (in minutes)',
        error: 'INVALID_DURATION'
      };
    }

    return { success: true, message: 'Duration valid' };
  }

  protected handleError(error: unknown): ServiceResponse {
    let errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Service management error:', errorMessage);
    return {
      success: false,
      message: 'Operation failed',
      error: errorMessage
    };
  }

  protected logOperation(operation: string, serviceId: string, success: boolean): void {
    let timestamp = new Date().toISOString();
    let status = success ? 'SUCCESS' : 'FAILED';
    console.log(`[${timestamp}] ${operation} - ${status} - ${serviceId}`);
  }
}

