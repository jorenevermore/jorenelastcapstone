
export interface ServiceResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

