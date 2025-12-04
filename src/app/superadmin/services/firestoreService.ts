import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../lib/firebase';
import { GlobalService, SubscriptionPackage } from '../types';

export const fetchServices = async (): Promise<GlobalService[]> => {
  try {
    const servicesCollection = collection(db, 'services');
    const snapshot = await getDocs(servicesCollection);
    let servicesData: GlobalService[] = [];

    snapshot.forEach(doc => {
      servicesData.push({
        id: doc.id,
        title: doc.data().title || '',
        featuredImage: doc.data().featuredImage || ''
      });
    });

    return servicesData;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const addService = async (title: string, imageFile: File | null): Promise<void> => {
  try {
    let featuredImageUrl = '';

    if (imageFile) {
      const storageRefPath = ref(storage, `services/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(storageRefPath, imageFile);
      featuredImageUrl = await getDownloadURL(snapshot.ref);
    }

    const docRef = await addDoc(collection(db, 'services'), {
      title: title.trim(),
      featuredImage: featuredImageUrl
    });

    await updateDoc(docRef, { id: docRef.id });
  } catch (error) {
    console.error('Error adding service:', error);
    throw error;
  }
};

export const updateService = async (id: string, title: string, imageFile: File | null, currentImage: string): Promise<void> => {
  try {
    let featuredImageUrl = currentImage;

    if (imageFile) {
      const storageRefPath = ref(storage, `services/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(storageRefPath, imageFile);
      featuredImageUrl = await getDownloadURL(snapshot.ref);
    }

    await updateDoc(doc(db, 'services', id), {
      title: title.trim(),
      featuredImage: featuredImageUrl
    });
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

export const deleteService = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'services', id));
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

export const fetchSubscriptions = async (): Promise<SubscriptionPackage[]> => {
  try {
    const subscriptionsCollection = collection(db, 'subscriptions');
    const snapshot = await getDocs(subscriptionsCollection);
    let subscriptionsData: SubscriptionPackage[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      subscriptionsData.push({
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        amount: data.amount || 0,
        overall_discount: data.overall_discount || { type: 'percentage', amount: 0 }
      });
    });

    return subscriptionsData;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
};

export const addSubscription = async (subscription: Omit<SubscriptionPackage, 'id'>): Promise<void> => {
  try {
    const docRef = await addDoc(collection(db, 'subscriptions'), subscription);
    await updateDoc(docRef, { id: docRef.id });
  } catch (error) {
    console.error('Error adding subscription:', error);
    throw error;
  }
};

export const updateSubscription = async (id: string, subscription: Omit<SubscriptionPackage, 'id'>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'subscriptions', id), subscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const deleteSubscription = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'subscriptions', id));
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};

