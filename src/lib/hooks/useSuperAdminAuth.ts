
import { useState, useCallback } from 'react';
import { SuperAdminAuthService } from '../services/auth/SuperAdminAuthService';
import { SessionManager } from '../services/auth/SessionManager';
import type { AuthCredentials } from '../../types/auth';
import type { ServiceResponse } from '../../types/response';

const authService = new SuperAdminAuthService();
const sessionManager = new SessionManager();

export interface UseSuperAdminAuthReturn {
  login: (credentials: AuthCredentials) => Promise<ServiceResponse>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useSuperAdminAuth(): UseSuperAdminAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: AuthCredentials): Promise<ServiceResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.authenticate(credentials);

      if (result.success) {
        const session = authService.generateSession(credentials.email);
        sessionManager.storeSuperAdminSession(session.token, session.expiry, session.email);
      } else if (result.message) {
        setError(result.message);
      }

      return result;
    } catch (error) {
      setError('Login failed');
      return {
        success: false,
        message: 'Login failed'
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

