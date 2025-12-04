'use client';

import { useEffect, useRef } from 'react';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Booking } from '../types';
import { QueueService } from '../../../../lib/services/queue/QueueService';

// notif document in db
const createNotification = async (
  userId: string,
  bookingId: string,
  barbershopId: string,
  type: 'next in queue' | 'called to service',
  booking: any
) => {
  try {
    const notificationsRef = collection(db, 'notifications');

    const notificationData = {
      userId,
      bookingId,
      fromId: barbershopId,
      type,
      title: type === 'next in queue' ? 'Next in Queue' : 'Called to Service',
      message: type === 'next in queue'
        ? 'You are next in queue, pls be ready or at the barbershop.'
        : 'Your service is ready! Please come to the barbershop now.',
      reason: type === 'next in queue' ? 'you are next in queue' : 'called to service',
      isRead: false,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(notificationsRef, notificationData);
    console.log(`Notification created: ${docRef.id} for user ${userId}`);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

 //creates notification documents when queue changes

export const useQueueNotifications = (bookings: Booking[]) => {
  // Track which bookings we've already processed to avoid infinite loops
  const processedBookingsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (bookings.length === 0) return;

    const queueService = new QueueService();
    const { needsUpdate } = queueService.processQueueNotifications(bookings);

    // Filter out bookings we've already processed
    const bookingsToUpdate = needsUpdate.filter(({ booking }) => {
      const key = `${booking.id}-${booking.notificationStatus}`;
      return !processedBookingsRef.current.has(key);
    });

    // If nothing to update, return early
    if (bookingsToUpdate.length === 0) return;

    // update bookings that need notification status changes
    bookingsToUpdate.forEach(async ({ booking, newNotificationStatus }) => {
      try {
        // Mark as processed before updating to prevent re-processing
        const key = `${booking.id}-${newNotificationStatus}`;
        processedBookingsRef.current.add(key);

        const bookingRef = doc(db, 'bookings', booking.id);
        await updateDoc(bookingRef, {
          notificationStatus: newNotificationStatus || null
        });

        // create notification document if status changed to next-in-queue or called-to-service
        if (newNotificationStatus === 'next-in-queue' || newNotificationStatus === 'called-to-service') {
          const notificationType: 'next in queue' | 'called to service' = newNotificationStatus === 'next-in-queue'
            ? 'next in queue'
            : 'called to service';

          await createNotification(
            booking.clientId,
            booking.id,
            booking.barbershopId,
            notificationType,
            booking
          );
        }

        console.log(`Updated notification status for ${booking.clientName}: ${newNotificationStatus || 'cleared'}`);
      } catch (error) {
        console.error(`Error updating notification for booking ${booking.id}:`, error);
      }
    });
  }, [bookings]);
};

