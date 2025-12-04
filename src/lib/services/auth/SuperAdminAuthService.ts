/**
 * SuperAdmin Authentication Service
 * Handles superadmin login and session management
 */

import { BaseAuthService, AuthResponse, AuthCredentials } from './BaseAuthService';

export interface SuperAdminSession {
  token: string;
  expiry: number;
  email: string;
  createdAt: number;
}

export class SuperAdminAuthService extends BaseAuthService {
  private readonly SESSION_TIMEOUT = 3600000; // 1 hour in milliseconds
  private readonly SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
  private readonly SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;

  async authenticate(credentials: AuthCredentials): Promise<AuthResponse> {
    // Validate credentials format
    const validation = this.validateCredentials(credentials);
    if (!validation.success) {
      return validation;
    }

    // Check environment variables
    if (!this.SUPERADMIN_EMAIL || !this.SUPERADMIN_PASSWORD) {
      console.error('SuperAdmin environment variables not configured');
      return {
        success: false,
        message: 'Server configuration error',
        error: 'CONFIG_ERROR'
      };
    }

    // Verify credentials
    const credentialsMatch =
      credentials.email === this.SUPERADMIN_EMAIL &&
      credentials.password === this.SUPERADMIN_PASSWORD;

    this.logAuthAttempt(credentials.email, credentialsMatch, 'SuperAdmin Login');

    if (!credentialsMatch) {
      return {
        success: false,
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS'
      };
    }

    return {
      success: true,
      message: 'Authentication successful',
      data: { timestamp: Date.now() }
    };
  }

  generateSession(email: string): SuperAdminSession {
    const token = this.generateToken(email);
    const createdAt = Date.now();
    const expiry = createdAt + this.SESSION_TIMEOUT;

    return { token, expiry, email, createdAt };
  }

  private generateToken(email: string): string {
    return btoa(`${email}:${Date.now()}:${Math.random()}`);
  }

  isSessionValid(session: SuperAdminSession): boolean {
    return Date.now() < session.expiry;
  }

  getSessionTimeRemaining(expiry: number): number {
    return Math.max(0, expiry - Date.now());
  }
}

