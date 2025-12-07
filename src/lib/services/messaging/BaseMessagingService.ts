
export interface Message {
  id?: string;
  barberId: string;
  clientId: string;
  senderId: string;
  message: string;
  timestamp: string;
  appointmentId?: string;
  from: 'barbershop' | 'client';
  clientName?: string;
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class BaseMessagingService {
  protected validateMessage(messageData: Partial<Message>): ServiceResponse {
    if (!messageData.message || messageData.message.trim().length === 0) {
      return {
        success: false,
        message: 'Message content cannot be empty',
        error: 'EMPTY_MESSAGE'
      };
    }

    if (messageData.message.length > 5000) {
      return {
        success: false,
        message: 'Message is too long (max 5000 characters)',
        error: 'MESSAGE_TOO_LONG'
      };
    }

    if (!messageData.barberId || !messageData.clientId) {
      return {
        success: false,
        message: 'Barber ID and Client ID are required',
        error: 'MISSING_IDS'
      };
    }

    if (!messageData.from || !['barbershop', 'client'].includes(messageData.from)) {
      return {
        success: false,
        message: 'Invalid sender type',
        error: 'INVALID_SENDER'
      };
    }

    return { success: true, message: 'Message valid' };
  }

  protected handleError(error: unknown): ServiceResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Messaging service error:', errorMessage);
    return {
      success: false,
      message: 'Operation failed',
      error: errorMessage
    };
  }

  protected logOperation(operation: string, messageId: string, success: boolean): void {
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILED';
    console.log(`[${timestamp}] ${operation} - ${status} - ${messageId}`);
  }
}

