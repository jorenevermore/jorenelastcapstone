/**
 * Base Discount Service
 * Provides common discount/subscription functionality
 */

export interface DiscountInfo {
  type: 'percentage' | 'fixed';
  amount: number;
}

export interface DiscountPackage {
  id: string;
  title: string;
  description: string;
  amount: number;
  overall_discount: DiscountInfo;
  createdAt: number;
  updatedAt: number;
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class BaseDiscountService {
  protected validateTitle(title: string): ServiceResponse {
    if (!title || title.trim().length < 2) {
      return {
        success: false,
        message: 'Title must be at least 2 characters',
        error: 'INVALID_TITLE'
      };
    }

    if (title.length > 100) {
      return {
        success: false,
        message: 'Title must not exceed 100 characters',
        error: 'TITLE_TOO_LONG'
      };
    }

    return { success: true, message: 'Title valid' };
  }

  protected validateAmount(amount: number): ServiceResponse {
    if (typeof amount !== 'number' || amount <= 0) {
      return {
        success: false,
        message: 'Amount must be a positive number',
        error: 'INVALID_AMOUNT'
      };
    }

    return { success: true, message: 'Amount valid' };
  }

  protected validateDiscount(discount: DiscountInfo): ServiceResponse {
    if (!discount.type || !['percentage', 'fixed'].includes(discount.type)) {
      return {
        success: false,
        message: 'Discount type must be "percentage" or "fixed"',
        error: 'INVALID_DISCOUNT_TYPE'
      };
    }

    if (typeof discount.amount !== 'number' || discount.amount <= 0) {
      return {
        success: false,
        message: 'Discount amount must be positive',
        error: 'INVALID_DISCOUNT_AMOUNT'
      };
    }

    if (discount.type === 'percentage' && discount.amount > 100) {
      return {
        success: false,
        message: 'Percentage discount cannot exceed 100%',
        error: 'DISCOUNT_EXCEEDS_100'
      };
    }

    return { success: true, message: 'Discount valid' };
  }

  protected handleError(error: unknown): ServiceResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Discount service error:', errorMessage);
    return {
      success: false,
      message: 'Operation failed',
      error: errorMessage
    };
  }

  protected logOperation(operation: string, discountId: string, success: boolean): void {
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILED';
    console.log(`[${timestamp}] ${operation} - ${status} - ${discountId}`);
  }
}

