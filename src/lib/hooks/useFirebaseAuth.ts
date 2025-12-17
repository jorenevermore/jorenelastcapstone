
import { useState, useCallback } from 'react';
import { auth } from '../firebase';
import { FirebaseAuthService, FirebaseAuthResult } from '../services/auth/FirebaseAuthService';
import { SessionManager } from '../services/auth/SessionManager';
import { AuthCredentials } from '../services/auth/BaseAuthService';

const firebaseAuthService = new FirebaseAuthService(auth);
const sessionManager = new SessionManager();

export interface UseFirebaseAuthReturn {
  login: (credentials: AuthCredentials) => Promise<FirebaseAuthResult>;
  signup: (credentials: AuthCredentials) => Promise<FirebaseAuthResult>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useFirebaseAuth(): UseFirebaseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: AuthCredentials): Promise<FirebaseAuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await firebaseAuthService.login(credentials);

      if (result.success && result.data) {
        sessionManager.storeUserSession(result.data.idToken);
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

  const signup = useCallback(async (credentials: AuthCredentials): Promise<FirebaseAuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await firebaseAuthService.signup(credentials);

      if (result.success && result.data) {
        sessionManager.storeUserSession(result.data.idToken);
      } else {
        setError(result.message);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: 'SIGNUP_ERROR'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionManager.clearUserSession();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    login,
    signup,
    logout,
    isLoading,
    error,
    clearError
  };
}

