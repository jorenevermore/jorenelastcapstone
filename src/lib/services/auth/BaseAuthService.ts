/**
 * Base Authentication Service
 * Provides common authentication functionality and error handling
 */

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export class BaseAuthService {
  protected validateCredentials(credentials: AuthCredentials): AuthResponse {
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        message: 'Email and password are required',
        error: 'MISSING_CREDENTIALS'
      };
    }

    if (!this.isValidEmail(credentials.email)) {
      return {
        success: false,
        message: 'Invalid email format',
        error: 'INVALID_EMAIL'
      };
    }

    if (credentials.password.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters',
        error: 'WEAK_PASSWORD'
      };
    }

    return { success: true, message: 'Credentials valid' };
  }

  protected isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

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

