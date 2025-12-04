'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Booking } from '../types';
import { useMessaging, Message } from '../../../../lib/hooks/useMessaging';

export interface ClientDetails {
  phoneNumber?: string;
  address?: string;
  email?: string;
  photo?: string;
}

interface UseAppointmentDetailsReturn {
  appointment: Booking | null;
  clientDetails: ClientDetails | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
}

export const useAppointmentDetails = (
  userId: string | undefined,
  appointmentId: string | undefined
): UseAppointmentDetailsReturn => {
  const [appointment, setAppointment] = useState<Booking | null>(null);
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getMessagesForAppointment } = useMessaging();

  useEffect(() => {
    let isMounted = true;

    const fetchAppointmentData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!userId || !appointmentId) {
          if (isMounted) setError('Missing user or appointment ID');
          return;
        }

        // fetch appointment
        const appointmentData = await fetchAppointment(userId, appointmentId);
        if (!isMounted) return;

        if (!appointmentData) {
          setError('Appointment not found');
          return;
        }

        setAppointment(appointmentData);

        // fetch client details
        const details = await fetchClientDetails(appointmentData.clientId);
        if (!isMounted) return;
        setClientDetails(details);

        // fetch messages for appointment
        const result = await getMessagesForAppointment(
          appointmentData.id,
          appointmentData.barberId || userId,
          appointmentData.clientId
        );

        if (!isMounted) return;
        if (result.success && result.data) {
          setMessages(result.data as Message[]);
        }
      } catch (err) {
        console.error('Error fetching appointment data:', err);
        if (isMounted) setError('Failed to load appointment data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAppointmentData();

    return () => {
      isMounted = false;
    };
  }, [userId, appointmentId, getMessagesForAppointment]);

  return { appointment, clientDetails, messages, loading, error };
};

async function fetchAppointment(userId: string, appointmentId: string): Promise<Booking | null> {
  try {
    const appointmentsCollection = collection(db, 'bookings');
    const appointmentsQuery = query(
      appointmentsCollection,
      where('barbershopId', '==', userId),
      where('id', '==', appointmentId)
    );

    const snapshot = await getDocs(appointmentsQuery);
    if (snapshot.empty) return null;

    return snapshot.docs[0].data() as Booking;
  } catch (err) {
    console.error('Error fetching appointment:', err);
    throw err;
  }
}

async function fetchClientDetails(clientId: string): Promise<ClientDetails | null> {
  try {
    const clientDoc = await getDoc(doc(db, 'users', clientId));
    if (!clientDoc.exists()) return null;

    const clientData = clientDoc.data();
    return {
      phoneNumber: clientData.phoneNumber || clientData.phone,
      address: clientData.address || clientData.location?.streetName,
      email: clientData.email,
      photo: clientData.image
    };
  } catch (err) {
    console.error('Error fetching client details:', err);
    return null;
  }
}

