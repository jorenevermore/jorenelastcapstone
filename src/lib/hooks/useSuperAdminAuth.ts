
import { useState, useCallback } from 'react';
import { SuperAdminAuthService } from '../services/auth/SuperAdminAuthService';
import { SessionManager } from '../services/auth/SessionManager';
import { AuthCredentials, AuthResponse } from '../services/auth/BaseAuthService';

const authService = new SuperAdminAuthService();
const sessionManager = new SessionManager();

export interface UseSuperAdminAuthReturn {
  login: (credentials: AuthCredentials) => Promise<AuthResponse>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useSuperAdminAuth(): UseSuperAdminAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: AuthCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.authenticate(credentials);

      if (result.success) {
        // generate session and store it
        const session = authService.generateSession(credentials.email);
        sessionManager.storeSuperAdminSession(session.token, session.expiry, session.email);
      } else {
        setError(result.message);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: 'LOGIN_ERROR'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionManager.clearSuperAdminSession();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    login,
    logout,
    isLoading,
    error,
    clearError
  };
}

