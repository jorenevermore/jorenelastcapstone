
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  Auth
} from 'firebase/auth';
import type { AuthCredentials } from '../../../types/auth';
import type { ServiceResponse } from '../../../types/response';

export interface FirebaseAuthResult extends ServiceResponse {
  data?: {
    uid: string;
    email: string;
    idToken: string;
  };
}

export class FirebaseAuthService {
  constructor(private auth: Auth) {}

  async login(credentials: AuthCredentials): Promise<FirebaseAuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      const idToken = await userCredential.user.getIdToken();

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
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed'
      };
    }
  }

  async signup(credentials: AuthCredentials): Promise<FirebaseAuthResult> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      const idToken = await userCredential.user.getIdToken();

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
      console.error('Signup error:', error);
      return {
        success: false,
        message: 'Signup failed'
      };
    }
  }
}

