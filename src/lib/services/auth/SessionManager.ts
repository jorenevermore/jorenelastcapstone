
export interface SessionData {
  token: string;
  expiry: number;
  email?: string;
  type: 'superadmin' | 'user';
}

export class SessionManager {
  private readonly SUPERADMIN_TOKEN_KEY = 'superadmin_token';
  private readonly SUPERADMIN_EXPIRY_KEY = 'superadmin_session_expiry';
  private readonly USER_TOKEN_KEY = 'firebaseToken';

  storeSuperAdminSession(token: string, expiry: number, email: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SUPERADMIN_TOKEN_KEY, token);
      localStorage.setItem(this.SUPERADMIN_EXPIRY_KEY, expiry.toString());
      this.setCookie(this.SUPERADMIN_TOKEN_KEY, token, 3600); 
    }
  }
  storeUserSession(idToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_TOKEN_KEY, idToken);
      this.setCookie(this.USER_TOKEN_KEY, idToken, 60 * 60 * 24 * 5); 
    }
  }

  getSuperAdminSession(): SessionData | null {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem(this.SUPERADMIN_TOKEN_KEY);
    const expiry = localStorage.getItem(this.SUPERADMIN_EXPIRY_KEY);

    if (!token || !expiry) return null;

    return {
      token,
      expiry: parseInt(expiry),
      type: 'superadmin'
    };
  }

  getUserSession(): SessionData | null {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem(this.USER_TOKEN_KEY);
    if (!token) return null;

    return {
      token,
      expiry: Date.now() + (60 * 60 * 24 * 5 * 1000), // 5 days
      type: 'user'
    };
  }

  isSessionValid(session: SessionData | null): boolean {
    if (!session) return false;
    return Date.now() < session.expiry;
  }

  clearSuperAdminSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SUPERADMIN_TOKEN_KEY);
      localStorage.removeItem(this.SUPERADMIN_EXPIRY_KEY);
      this.deleteCookie(this.SUPERADMIN_TOKEN_KEY);
    }
  }

  clearUserSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USER_TOKEN_KEY);
      this.deleteCookie(this.USER_TOKEN_KEY);
    }
  }

  private setCookie(name: string, value: string, maxAge: number): void {
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=; path=/; max-age=0`;
  }
}

