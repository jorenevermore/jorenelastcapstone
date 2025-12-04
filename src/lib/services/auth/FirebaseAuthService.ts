/**
 * Firebase Authentication Service
 * Handles user login and signup with Firebase
 */

import { BaseAuthService, AuthResponse, AuthCredentials } from './BaseAuthService';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  Auth 
} from 'firebase/auth';

export interface FirebaseAuthResult extends AuthResponse {
  data?: {
    uid: string;
    email: string;
    idToken: string;
  };
}

export class FirebaseAuthService extends BaseAuthService {
  constructor(private auth: Auth) {
    super();
  }

  async login(credentials: AuthCredentials): Promise<FirebaseAuthResult> {
    // Validate credentials format
    const validation = this.validateCredentials(credentials);
    if (!validation.success) {
      return validation as FirebaseAuthResult;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      const idToken = await userCredential.user.getIdToken();

      this.logAuthAttempt(credentials.email, true, 'User Login');

      return {
        success: true,
        message: 'Login successful',
        data: {
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          idToken
        }
      };
    } catch (error) {
      this.logAuthAttempt(credentials.email, false, 'User Login');
      return this.handleError(error) as FirebaseAuthResult;
    }
  }

  async signup(credentials: AuthCredentials): Promise<FirebaseAuthResult> {
    // Validate credentials format
    const validation = this.validateCredentials(credentials);
    if (!validation.success) {
      return validation as FirebaseAuthResult;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      const idToken = await userCredential.user.getIdToken();

      this.logAuthAttempt(credentials.email, true, 'User Signup');

      return {
        success: true,
        message: 'Signup successful',
        data: {
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          idToken
        }
      };
    } catch (error) {
      this.logAuthAttempt(credentials.email, false, 'User Signup');
      return this.handleError(error) as FirebaseAuthResult;
    }
  }
}

