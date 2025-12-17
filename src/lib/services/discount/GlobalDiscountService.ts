
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, Firestore } from 'firebase/firestore';
import type { ServiceResponse } from '../../../types/api';
import type {DiscountPackage, CreateDiscountInput, UpdateDiscountInput } from '../../../types/discount';

export class GlobalDiscountService {
  private readonly COLLECTION = 'discountPackages';

  constructor(private db: Firestore) {}

  private handleError(error: unknown): ServiceResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Discount service error:', errorMessage);
    return {
      success: false,
      message: 'Operation failed',
      error: errorMessage
    };
  }

  async createDiscount(input: CreateDiscountInput): Promise<ServiceResponse> {
    try {
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

      return {
        success: true,
        message: 'Discount package created successfully',
        data: { id: docRef.id, ...discountData }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateDiscount(discountId: string, input: UpdateDiscountInput): Promise<ServiceResponse> {
    try {
      const updateData: any = {};
      if (input.title) updateData.title = input.title.trim();
      if (input.description !== undefined) updateData.description = input.description.trim();
      if (input.amount !== undefined) updateData.amount = input.amount;
      if (input.overall_discount) updateData.overall_discount = input.overall_discount;
      updateData.updatedAt = Date.now();

      await updateDoc(doc(this.db, this.COLLECTION, discountId), updateData);

      return {
        success: true,
        message: 'Discount package updated successfully'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteDiscount(discountId: string): Promise<ServiceResponse> {
    try {
      await deleteDoc(doc(this.db, this.COLLECTION, discountId));

      return {
        success: true,
        message: 'Discount package deleted successfully'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAllDiscounts(): Promise<ServiceResponse> {
    try {
      const querySnapshot = await getDocs(collection(this.db, this.COLLECTION));
      const discounts: DiscountPackage[] = [];

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

