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

export interface CreateDiscountInput {
  title: string;
  description: string;
  amount: number;
  overall_discount: DiscountInfo;
}

export interface UpdateDiscountInput {
  title?: string;
  description?: string;
  amount?: number;
  overall_discount?: DiscountInfo;
}

