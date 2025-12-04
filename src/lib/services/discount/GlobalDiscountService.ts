/**
 * Global Discount Service
 * Handles global discount packages (SuperAdmin only)
 */

import { BaseDiscountService, DiscountPackage, DiscountInfo, ServiceResponse } from './BaseDiscountService';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, Firestore } from 'firebase/firestore';

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

export class GlobalDiscountService extends BaseDiscountService {
  private readonly COLLECTION = 'discountPackages';

  constructor(private db: Firestore) {
    super();
  }

  async createDiscount(input: CreateDiscountInput): Promise<ServiceResponse> {
    try {
      const titleValidation = this.validateTitle(input.title);
      if (!titleValidation.success) return titleValidation;

      const amountValidation = this.validateAmount(input.amount);
      if (!amountValidation.success) return amountValidation;

      const discountValidation = this.validateDiscount(input.overall_discount);
      if (!discountValidation.success) return discountValidation;

      const now = Date.now();
      const discountData = {
        title: input.title.trim(),
        description: input.description.trim(),
        amount: input.amount,
        overall_discount: input.overall_discount,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(this.db, this.COLLECTION), discountData);

      this.logOperation('Create Discount Package', docRef.id, true);

      return {
        success: true,
        message: 'Discount package created successfully',
        data: { id: docRef.id, ...discountData }
      };
    } catch (error) {
      this.logOperation('Create Discount Package', 'unknown', false);
      return this.handleError(error);
    }
  }

  async updateDiscount(discountId: string, input: UpdateDiscountInput): Promise<ServiceResponse> {
    try {
      if (input.title) {
        const titleValidation = this.validateTitle(input.title);
        if (!titleValidation.success) return titleValidation;
      }

      if (input.amount !== undefined) {
        const amountValidation = this.validateAmount(input.amount);
        if (!amountValidation.success) return amountValidation;
      }

      if (input.overall_discount) {
        const discountValidation = this.validateDiscount(input.overall_discount);
        if (!discountValidation.success) return discountValidation;
      }

      let updateData: any = {};
      if (input.title) updateData.title = input.title.trim();
      if (input.description !== undefined) updateData.description = input.description.trim();
      if (input.amount !== undefined) updateData.amount = input.amount;
      if (input.overall_discount) updateData.overall_discount = input.overall_discount;
      updateData.updatedAt = Date.now();

      await updateDoc(doc(this.db, this.COLLECTION, discountId), updateData);

      this.logOperation('Update Discount Package', discountId, true);

      return {
        success: true,
        message: 'Discount package updated successfully'
      };
    } catch (error) {
      this.logOperation('Update Discount Package', discountId, false);
      return this.handleError(error);
    }
  }

  async deleteDiscount(discountId: string): Promise<ServiceResponse> {
    try {
      await deleteDoc(doc(this.db, this.COLLECTION, discountId));

      this.logOperation('Delete Discount Package', discountId, true);

      return {
        success: true,
        message: 'Discount package deleted successfully'
      };
    } catch (error) {
      this.logOperation('Delete Discount Package', discountId, false);
      return this.handleError(error);
    }
  }

  async getAllDiscounts(): Promise<ServiceResponse> {
    try {
      const querySnapshot = await getDocs(collection(this.db, this.COLLECTION));
      let discounts: DiscountPackage[] = [];

      querySnapshot.forEach((doc) => {
        discounts.push({
          id: doc.id,
          ...doc.data()
        } as DiscountPackage);
      });

      return {
        success: true,
        message: 'Discount packages retrieved successfully',
        data: discounts
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

