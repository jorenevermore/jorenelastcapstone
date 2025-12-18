export interface DiscountInfo {
  type: 'percentage' | 'fixed';
  amount: number;
}

export interface SubscriptionPackage {
  id: string;
  title: string;
  description: string;
  amount: number;
  overall_discount: DiscountInfo;
  createdAt: number;
  updatedAt: number;
}

export interface CreateSubscriptionInput {
  title: string;
  description: string;
  amount: number;
  overall_discount: DiscountInfo;
}

export interface UpdateSubscriptionInput {
  title?: string;
  description?: string;
  amount?: number;
  overall_discount?: DiscountInfo;
}

