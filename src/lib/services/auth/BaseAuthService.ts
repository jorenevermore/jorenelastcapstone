
export interface AuthResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export class BaseAuthService {
  protected handleError(error: unknown): AuthResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Auth error:', errorMessage);
    return {
      success: false,
      message: 'Authentication failed',
      error: errorMessage
    };
  }

  protected logAuthAttempt(email: string, success: boolean, action: string): void {
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILED';
    console.log(`[${timestamp}] ${action} - ${status} - ${email}`);
  }
}

