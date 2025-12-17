
import { collection, addDoc, query, where, getDocs, orderBy, Firestore } from 'firebase/firestore';
import type { ServiceResponse } from '../../../types/api';
import type { Message } from '../../../types/messaging';

export class MessagingService {
  private readonly COLLECTION = 'chats';

  constructor(private db: Firestore) {}

  private handleError(error: unknown): ServiceResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Messaging service error:', errorMessage);
    return {
      success: false,
      message: 'Operation failed',
      error: errorMessage
    };
  }

  async addMessage(messageData: Omit<Message, 'id'>): Promise<ServiceResponse> {
    try {
      const chatsCollection = collection(this.db, this.COLLECTION);
      const docRef = await addDoc(chatsCollection, messageData);

      return {
        success: true,
        message: 'Message sent successfully',
        data: { id: docRef.id, ...messageData }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getMessagesForAppointment(appointmentId: string, barberId: string, clientId: string): Promise<ServiceResponse> {
    try {
      const chatsCollection = collection(this.db, this.COLLECTION);
      const q1 = query(chatsCollection, where('appointmentId', '==', appointmentId));
      const querySnapshot1 = await getDocs(q1);

      let messages: Message[] = [];
      const messageIds = new Set<string>();

      querySnapshot1.forEach(doc => {
        messages.push({
          id: doc.id,
          ...doc.data() as Omit<Message, 'id'>
        });
        messageIds.add(doc.id);
      });

      const q2 = query(
        chatsCollection,
        where('barberId', '==', barberId),
        where('clientId', '==', clientId)
      );
      const querySnapshot2 = await getDocs(q2);

      querySnapshot2.forEach(doc => {
        if (!messageIds.has(doc.id)) {
          messages.push({
            id: doc.id,
            ...doc.data() as Omit<Message, 'id'>
          });
        }
      });

      messages.sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));

      return {
        success: true,
        message: 'Messages retrieved successfully',
        data: messages
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getMessagesForBarbershop(barbershopId: string): Promise<ServiceResponse> {
    try {
      const chatsCollection = collection(this.db, this.COLLECTION);
      const q = query(
        chatsCollection,
        where('barberId', '==', barbershopId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      let messages: Message[] = [];

      querySnapshot.forEach(doc => {
        messages.push({
          id: doc.id,
          ...doc.data() as Omit<Message, 'id'>
        });
      });

      return {
        success: true,
        message: 'Messages retrieved successfully',
        data: messages
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

}

