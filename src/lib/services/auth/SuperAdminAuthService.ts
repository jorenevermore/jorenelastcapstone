
import type { AuthCredentials } from '../../../types/auth';
import type { ServiceResponse } from '../../../types/response';

export interface SuperAdminSession {
  token: string;
  expiry: number;
  email: string;
  createdAt: number;
}

export class SuperAdminAuthService {
  private readonly SESSION_TIMEOUT = 3600000;
  private readonly SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
  private readonly SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;

  async authenticate(credentials: AuthCredentials): Promise<ServiceResponse> {
    if (!this.SUPERADMIN_EMAIL || !this.SUPERADMIN_PASSWORD) {
      return {
        success: false,
        message: 'Server configuration error'
      };
    }

    const credentialsMatch =
      credentials.email === this.SUPERADMIN_EMAIL &&
      credentials.password === this.SUPERADMIN_PASSWORD;

    if (!credentialsMatch) {
      return {
        success: false,
        message: 'Invalid credentials'
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

