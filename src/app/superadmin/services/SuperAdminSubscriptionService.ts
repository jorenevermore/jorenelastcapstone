import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Firestore
} from 'firebase/firestore';
import type { ServiceResponse } from '../../../types/response';
import { SubscriptionPackage } from '../types';

export class SuperAdminSubscriptionManagement {
  private readonly COLLECTION = 'subscriptions';

  constructor(private db: Firestore) {}

  async getAllSubscriptions(): Promise<ServiceResponse> {
    try {
      const subscriptionsCollection = collection(this.db, this.COLLECTION);
      const snapshot = await getDocs(subscriptionsCollection);
      const subscriptionsData: SubscriptionPackage[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        subscriptionsData.push({
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          amount: data.amount || 0,
          overall_discount: data.overall_discount || { type: 'percentage', amount: 0 },
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || Date.now()
        });
      });

      return {
        success: true,
        message: 'Subscriptions fetched successfully',
        data: subscriptionsData
      };
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return {
        success: false,
        message: 'Failed to fetch subscriptions'
      };
    }
  }

  async createSubscription(subscription: Omit<SubscriptionPackage, 'id'>): Promise<ServiceResponse> {
    try {
      const docRef = await addDoc(collection(this.db, this.COLLECTION), subscription);
      await updateDoc(docRef, { id: docRef.id });

      return {
        success: true,
        message: 'Subscription created successfully',
        data: { id: docRef.id, ...subscription }
      };
    } catch (error) {
      console.error('Error adding subscription:', error);
      return {
        success: false,
        message: 'Failed to create subscription'
      };
    }
  }

  async updateSubscription(id: string, subscription: Omit<SubscriptionPackage, 'id'>): Promise<ServiceResponse> {
    try {
      await updateDoc(doc(this.db, this.COLLECTION, id), subscription);

      return {
        success: true,
        message: 'Subscription updated successfully'
      };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return {
        success: false,
        message: 'Failed to update subscription'
      };
    }
  }

  async deleteSubscription(id: string): Promise<ServiceResponse> {
    try {
      await deleteDoc(doc(this.db, this.COLLECTION, id));

      return {
        success: true,
        message: 'Subscription deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting subscription:', error);
      return {
        success: false,
        message: 'Failed to delete subscription'
      };
    }
  }
}
