import { collection, getDocs, query, where, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Barber {
  address: string;
  affiliatedBarbershop: string;
  affiliatedBarbershopId: string;
  barberId: string;
  contactNumber: string;
  email: string;
  fullName: string;
  isAvailable: boolean;
  image?: string | null; // URL to the barber's profile image
  affiliationStatus?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  isProfileCompleted?: boolean;
}

// Fetch all barbers
export const getAllBarbers = async (): Promise<Barber[]> => {
  try {
    const barbersCollection = collection(db, 'barbersprofile');
    const barberSnapshot = await getDocs(barbersCollection);

    return barberSnapshot.docs.map(doc => {
      const data = doc.data() as Omit<Barber, 'barberId'>;
      return {
        ...data,
        barberId: doc.id
      };
    });
  } catch (error) {
    console.error('Error fetching barbers:', error);
    throw error;
  }
};

// Fetch barbers by barbershop ID
export const getBarbersByBarbershopId = async (barbershopId: string): Promise<Barber[]> => {
  try {
    const barbersCollection = collection(db, 'barbersprofile');
    const q = query(barbersCollection, where('affiliatedBarbershopId', '==', barbershopId));
    const barberSnapshot = await getDocs(q);

    return barberSnapshot.docs.map(doc => {
      const data = doc.data() as Omit<Barber, 'barberId'>;
      return {
        ...data,
        barberId: doc.id
      };
    });
  } catch (error) {
    console.error('Error fetching barbers by barbershop ID:', error);
    throw error;
  }
};

// Fetch a single barber by ID
export const getBarberById = async (barberId: string): Promise<Barber | null> => {
  try {
    const barberDoc = doc(db, 'barbersprofile', barberId);
    const barberSnapshot = await getDoc(barberDoc);

    if (!barberSnapshot.exists()) {
      return null;
    }

    const data = barberSnapshot.data() as Barber;
    return {
      ...data,
      barberId: barberSnapshot.id
    };
  } catch (error) {
    console.error('Error fetching barber by ID:', error);
    throw error;
  }
};

// Add a new barber
export const addBarber = async (barberData: Omit<Barber, 'barberId'>): Promise<string> => {
  try {
    const barbersCollection = collection(db, 'barbersprofile');
    const docRef = await addDoc(barbersCollection, barberData);

    // Update the document with its own ID as barberId
    await updateDoc(docRef, { barberId: docRef.id });

    return docRef.id;
  } catch (error) {
    console.error('Error adding barber:', error);
    throw error;
  }
};

// Update a barber
export const updateBarber = async (barberId: string, barberData: Partial<Omit<Barber, 'barberId'>>): Promise<void> => {
  try {
    const barberDoc = doc(db, 'barbersprofile', barberId);
    await updateDoc(barberDoc, barberData);
  } catch (error) {
    console.error('Error updating barber:', error);
    throw error;
  }
};

// Delete a barber
export const deleteBarber = async (barberId: string): Promise<void> => {
  try {
    const barberDoc = doc(db, 'barbersprofile', barberId);
    await deleteDoc(barberDoc);
  } catch (error) {
    console.error('Error deleting barber:', error);
    throw error;
  }
};

// Fetch pending barber affiliations for a barbershop
export const getPendingAffiliations = async (barbershopId: string): Promise<Barber[]> => {
  try {
    const barbersCollection = collection(db, 'barbersprofile');
    const q = query(
      barbersCollection,
      where('affiliatedBarbershopId', '==', barbershopId),
      where('affiliationStatus', '==', 'pending')
    );
    const barberSnapshot = await getDocs(q);

    return barberSnapshot.docs.map(doc => {
      const data = doc.data() as Omit<Barber, 'barberId'>;
      return {
        ...data,
        barberId: doc.id
      };
    });
  } catch (error) {
    console.error('Error fetching pending affiliations:', error);
    throw error;
  }
};

// Update barber affiliation status
export const updateAffiliationStatus = async (
  barberId: string,
  status: 'approved' | 'rejected'
): Promise<void> => {
  try {
    const barberDoc = doc(db, 'barbersprofile', barberId);
    await updateDoc(barberDoc, { affiliationStatus: status });
  } catch (error) {
    console.error('Error updating affiliation status:', error);
    throw error;
  }
};