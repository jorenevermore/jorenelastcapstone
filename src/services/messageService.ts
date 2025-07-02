import { collection, addDoc, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Message {
  id?: string;
  barberId: string;
  clientId: string;
  senderId: string; // Who sent the message (barberId or clientId)
  message: string;
  timestamp: string; // Timestamp in milliseconds as string
  appointmentId?: string; // Optional link to appointment
  from: 'barbershop' | 'client'; // Indicates sender type
}

// Add a new message
export const addMessage = async (messageData: Omit<Message, 'id'>): Promise<string> => {
  try {
    const chatsCollection = collection(db, 'chats');
    const docRef = await addDoc(chatsCollection, messageData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

// Get messages between a barber and client
export const getMessagesBetweenUsers = async (barberId: string, clientId: string): Promise<Message[]> => {
  try {
    const chatsCollection = collection(db, 'chats');
    const q = query(
      chatsCollection,
      where('barberId', '==', barberId),
      where('clientId', '==', clientId),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];

    querySnapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data() as Omit<Message, 'id'>
      });
    });

    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Get messages for a specific appointment
export const getMessagesForAppointment = async (appointmentId: string): Promise<Message[]> => {
  try {
    const chatsCollection = collection(db, 'chats');
    const q = query(
      chatsCollection,
      where('appointmentId', '==', appointmentId),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];

    querySnapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data() as Omit<Message, 'id'>
      });
    });

    return messages;
  } catch (error) {
    console.error('Error fetching appointment messages:', error);
    throw error;
  }
};

// Get all messages for a barbershop
export const getMessagesForBarbershop = async (barbershopId: string): Promise<Message[]> => {
  try {
    const chatsCollection = collection(db, 'chats');
    const q = query(
      chatsCollection,
      where('barberId', '==', barbershopId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];

    querySnapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data() as Omit<Message, 'id'>
      });
    });

    return messages;
  } catch (error) {
    console.error('Error fetching barbershop messages:', error);
    throw error;
  }
};

// Get all messages for a client
export const getMessagesForClient = async (clientId: string): Promise<Message[]> => {
  try {
    const chatsCollection = collection(db, 'chats');
    const q = query(
      chatsCollection,
      where('clientId', '==', clientId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];

    querySnapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data() as Omit<Message, 'id'>
      });
    });

    return messages;
  } catch (error) {
    console.error('Error fetching client messages:', error);
    throw error;
  }
};
