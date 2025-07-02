'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, addDoc } from 'firebase/firestore';
import { Booking } from '../types';
import Link from 'next/link';
import { ChatModal } from '../components';
import { addMessage, Message } from '../../../../services/messageService';



export default function AppointmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [user] = useAuthState(auth);
  const [appointment, setAppointment] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [barbershopLocation, setBarbershopLocation] = useState<{
    address: string;
    coordinates: { lat: number; lng: number };
    distance: number;
  } | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Get the appointment ID from the params
  const appointmentId = params?.id as string;

  // Function to reverse geocode coordinates to address
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  // Function to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Fetch appointment data
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        setError(null);

        if (user && appointmentId) {
          // Fetch the specific appointment
          const appointmentsCollection = collection(db, 'bookings');
          const appointmentsQuery = query(
            appointmentsCollection,
            where('barbershopId', '==', user.uid),
            where('id', '==', appointmentId)
          );

          const appointmentsSnapshot = await getDocs(appointmentsQuery);

          if (appointmentsSnapshot.empty) {
            setError('Appointment not found');
            setAppointment(null);
          } else {
            const appointmentData = appointmentsSnapshot.docs[0].data() as Booking;
            setAppointment(appointmentData);

            // Fetch barbershop location data
            try {
              const barbershopDoc = await getDoc(doc(db, 'barbershops', user.uid));
              if (barbershopDoc.exists()) {
                const barbershopData = barbershopDoc.data();
                if (barbershopData.loc && barbershopData.loc.coordinates) {
                  const coordinates = {
                    lat: barbershopData.loc.coordinates.latitude,
                    lng: barbershopData.loc.coordinates.longitude
                  };

                  // Get address from coordinates
                  const address = await reverseGeocode(coordinates.lat, coordinates.lng);

                  // Calculate distance (using a default client location for now)
                  // In a real app, you'd get the client's location from the appointment or user data
                  const distance = 0.664; // Default distance as shown in your screenshot

                  setBarbershopLocation({
                    address,
                    coordinates,
                    distance
                  });
                }
              }
            } catch (locationError) {
              console.error('Error fetching barbershop location:', locationError);
              // Don't set error state for location fetch failure, just log it
            }
          }
        }
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Failed to load appointment data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [user, appointmentId]);

  // Update booking status
  const updateBookingStatus = async (status: Booking['status'], reason?: string) => {
    if (!appointment) return false;

    try {
      setIsSubmitting(true);
      const bookingRef = doc(db, 'bookings', appointment.id);
      const updateData: any = { status };

      // Add reason if provided
      if (reason && status === 'canceled') {
        updateData.barberReason = reason;
      }

      // Add status history entry
      const timestamp = Date.now().toString();
      const historyEntry = {
        ongoingStatus: status, // Changed from 'status' to 'ongoingStatus' to avoid conflicts
        timestamp,
        updatedBy: 'barber',
        reason: reason || ''
      };

      // Get current booking to check if statusHistory exists
      const bookingDoc = await getDocs(query(collection(db, 'bookings'), where('id', '==', appointment.id)));
      let currentBooking: any = null;

      bookingDoc.forEach(doc => {
        currentBooking = doc.data();
      });

      if (currentBooking) {
        if (currentBooking.statusHistory) {
          updateData.statusHistory = [...currentBooking.statusHistory, historyEntry];
        } else {
          updateData.statusHistory = [historyEntry];
        }
      }

      await updateDoc(bookingRef, updateData);

      // Update local state
      setAppointment(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status,
          barberReason: status === 'canceled' ? reason : prev.barberReason,
          statusHistory: updateData.statusHistory
        };
      });

      setNewStatus('');
      setReason('');

      return true;
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add note to booking
  const addNoteToBooking = async (note: string) => {
    if (!appointment) return false;

    try {
      setIsSubmitting(true);

      // Create a new message document in the messages collection
      const messageData: Omit<Message, 'id'> = {
        barberId: appointment.barberId || user?.uid || '',
        clientId: appointment.clientId,
        senderId: user?.uid || '', // The barbershop is sending the message
        message: note,
        timestamp: Date.now().toString(), // Use timestamp in milliseconds as string
        appointmentId: appointment.id, // Link to the appointment
        from: 'barbershop' // Indicate this message is from barbershop
      };

      // Add the message to the chats collection using the service
      const messageId = await addMessage(messageData);
      console.log('Message added to chats collection with ID:', messageId);
      console.log('Message data:', messageData);

      // Also update the booking document to maintain the existing note structure
      // This ensures backward compatibility with the current UI
      const newNote: {
        text: string;
        timestamp: string;
        from: 'barbershop';
        barbershopId: string;
        barbershopName?: string;
      } = {
        text: note,
        timestamp: new Date().toISOString(),
        from: 'barbershop',
        barbershopId: user?.uid || '',
        barbershopName: appointment.barbershopName || 'Barbershop'
      };

      // Get existing notes or initialize empty array
      const existingNotes = appointment.barbershopNotes || [];

      const bookingRef = doc(db, 'bookings', appointment.id);
      const updateData = {
        barbershopNotes: [...existingNotes, newNote]
      };

      await updateDoc(bookingRef, updateData);

      // Update local state
      setAppointment(prev => {
        if (!prev) return null;
        return {
          ...prev,
          barbershopNotes: [...(prev.barbershopNotes || []), newNote]
        };
      });

      return true;
    } catch (err) {
      console.error('Error adding note to booking:', err);
      setError('Failed to add note. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async (noteText: string) => {
    if (!noteText.trim()) return false;
    const success = await addNoteToBooking(noteText);
    return success;
  };

  // Check if appointment can be updated
  const canUpdateStatus = appointment && (
    // Allow updates for pending, confirmed, and in-progress statuses
    ['pending', 'confirmed', 'in-progress'].includes(appointment.status) ||
    // Special case: If an appointment was manually changed from completed to pending in Firebase
    (appointment.status === 'pending' && appointment.statusHistory?.some(
      history => history.ongoingStatus === 'completed'
    ))
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Appointment Details</h1>
        <Link
          href="/dashboard/appointments"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Appointments
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-2"></div>
          <p>Loading appointment details...</p>
        </div>
      ) : appointment ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6 animate-fadeIn">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-black">
                Appointment #{appointment.id.substring(0, 6)}
              </h3>
              <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${getStatusColor(appointment.status)}`}
              >
                <i className={`${getStatusIcon(appointment.status)} mr-1`}></i>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Client & Service Info */}
              <div className="md:col-span-2 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">Client Information</h4>
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        {appointment.clientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{appointment.clientName}</p>
                        <p className="text-xs text-gray-500">Client</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">Date & Time</h4>
                    <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                      <div className="text-base font-bold">
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xl font-bold mt-1 mb-1">{appointment.time}</div>
                      <div className="text-xs text-gray-500">
                        {getTimeRemaining(appointment.date, appointment.time)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3">Service Details</h4>

                  {appointment.barbershopName && (
                    <div className="bg-black text-white p-2 rounded mb-3 flex items-center">
                      <i className="fas fa-store mr-2"></i>
                      <div>
                        <p className="font-medium">{appointment.barbershopName}</p>
                        <p className="text-xs text-gray-300">Barbershop</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Service</p>
                      <p className="font-medium">{appointment.serviceOrdered}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Style</p>
                      <p className="font-medium">{appointment.styleOrdered}</p>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                        <i className="fas fa-user-alt text-xs"></i>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Barber</p>
                        <p className="font-medium">{appointment.barberName}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-medium text-green-700">₱{appointment.totalPrice.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Location Details - Show barbershop location for regular appointments, client location for home services */}
                  {(barbershopLocation && !appointment.isHomeService) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="font-medium text-gray-700 mb-3">Location Details</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium">{barbershopLocation.address}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Distance</p>
                          <p className="font-medium">{barbershopLocation.distance} km</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${barbershopLocation.coordinates.lat},${barbershopLocation.coordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm flex items-center"
                        >
                          <i className="fas fa-map-marker-alt mr-1"></i> View on Map
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {appointment.isHomeService && appointment.location && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">Location Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{appointment.location.streetName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Distance</p>
                        <p className="font-medium">{appointment.location.distance} km</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${appointment.location.lat},${appointment.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm flex items-center"
                      >
                        <i className="fas fa-map-marker-alt mr-1"></i> View on Map
                      </a>
                    </div>
                  </div>
                )}

                {/* Cancellation Reasons Section (if applicable) */}
                {(appointment.reason || appointment.barberReason) && appointment.status === 'canceled' && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
                    <h4 className="font-medium text-red-700 mb-3 flex items-center">
                      <i className="fas fa-times-circle mr-2"></i>
                      Cancellation Information
                    </h4>

                    <div className="space-y-3">
                      {appointment.reason && (
                        <div className="bg-white p-3 rounded-lg border-l-4 border-red-400">
                          <p className="text-sm font-medium text-red-700 mb-1">Client's Reason:</p>
                          <p className="text-gray-700">{appointment.reason}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {appointment.createdAt ? new Date(appointment.createdAt).toLocaleString() : ''}
                          </p>
                        </div>
                      )}

                      {appointment.barberReason && (
                        <div className="bg-white p-3 rounded-lg border-l-4 border-red-400">
                          <p className="text-sm font-medium text-red-700 mb-1">Barbershop's Reason:</p>
                          <p className="text-gray-700">{appointment.barberReason}</p>
                          {appointment.statusHistory && appointment.statusHistory.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(appointment.statusHistory[appointment.statusHistory.length - 1].timestamp).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}



                {/* Feedback section */}
                {appointment.feedback && appointment.feedback.rating && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">
                      <div className="flex items-center">
                        <i className="fas fa-star text-yellow-400 mr-2"></i>
                        Client Feedback
                      </div>
                    </h4>

                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="flex mr-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i
                              key={star}
                              className={`fas fa-star text-lg ${star <= (appointment.feedback?.rating || 0) ? 'text-yellow-400' : 'text-gray-200'}`}
                            ></i>
                          ))}
                        </div>
                        <span className="font-bold text-lg">{appointment.feedback.rating}/5</span>
                      </div>

                      {appointment.feedback.comment && (
                        <div className="bg-gray-50 p-3 rounded border border-gray-100 relative">
                          <i className="fas fa-quote-left text-gray-200 absolute top-2 left-2 text-lg"></i>
                          <p className="text-gray-700 pl-6 pr-6 italic">{appointment.feedback.comment}</p>
                          <i className="fas fa-quote-right text-gray-200 absolute bottom-2 right-2 text-lg"></i>
                        </div>
                      )}

                      {appointment.feedback.createdAt && (
                        <div className="text-xs text-gray-500 mt-3 text-right">
                          Submitted on {new Date(appointment.feedback.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column - Actions */}
              <div className="space-y-5">
                {/* Status Actions - Always show for pending status */}
                {(appointment.status === 'pending' || canUpdateStatus) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">Update Status</h4>

                    {/* Status action buttons */}
                    <div className="space-y-2">
                      {/* Always show confirm button for pending status */}
                      {appointment.status === 'pending' && (
                        <button
                          className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                          onClick={() => updateBookingStatus('confirmed')}
                          disabled={isSubmitting}
                        >
                          <i className="fas fa-check-circle mr-2"></i>
                          Confirm
                        </button>
                      )}

                      {appointment.status === 'confirmed' && (
                        <button
                          className="w-full bg-purple-600 text-white rounded-lg py-2 font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
                          onClick={() => updateBookingStatus('in-progress')}
                          disabled={isSubmitting}
                        >
                          <i className="fas fa-cut mr-2"></i>
                          Start Service
                        </button>
                      )}

                      {appointment.status === 'in-progress' && (
                        <button
                          className="w-full bg-green-600 text-white rounded-lg py-2 font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                          onClick={() => updateBookingStatus('completed')}
                          disabled={isSubmitting}
                        >
                          <i className="fas fa-check-double mr-2"></i>
                          Complete Service
                        </button>
                      )}

                      {/* Show decline button for pending status */}
                      {appointment.status === 'pending' && (
                        <button
                          className="w-full bg-red-600 text-white rounded-lg py-2 font-medium hover:bg-red-700 transition-colors flex items-center justify-center mt-2"
                          onClick={() => setNewStatus('declined')}
                          disabled={isSubmitting || newStatus === 'declined'}
                        >
                          <i className="fas fa-times-circle mr-2"></i>
                          Decline
                        </button>
                      )}

                      {/* Show cancel and no-show buttons for confirmed status */}
                      {appointment.status === 'confirmed' && (
                        <>
                          <button
                            className="w-full bg-red-600 text-white rounded-lg py-2 font-medium hover:bg-red-700 transition-colors flex items-center justify-center mt-2"
                            onClick={() => setNewStatus('canceled')}
                            disabled={isSubmitting || newStatus === 'canceled'}
                          >
                            <i className="fas fa-times-circle mr-2"></i>
                            Cancel
                          </button>

                          <button
                            className="w-full bg-gray-600 text-white rounded-lg py-2 font-medium hover:bg-gray-700 transition-colors flex items-center justify-center mt-2"
                            onClick={() => updateBookingStatus('no-show')}
                            disabled={isSubmitting}
                          >
                            <i className="fas fa-user-slash mr-2"></i>
                            Mark as No-Show
                          </button>
                        </>
                      )}
                    </div>

                    {/* Reason for declining or canceling */}
                    {(newStatus === 'canceled' || newStatus === 'declined') && (
                      <div className="mt-3">
                        <textarea
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
                          placeholder={`Reason for ${newStatus === 'declined' ? 'declining' : 'cancellation'}...`}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          rows={3}
                          disabled={isSubmitting}
                        ></textarea>

                        <div className="flex space-x-2">
                          <button
                            className="flex-1 bg-red-600 text-white rounded-lg py-2 font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                            onClick={() => {
                              updateBookingStatus(newStatus, reason);
                              setNewStatus('');
                            }}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {newStatus === 'declined' ? 'Declining...' : 'Canceling...'}
                              </>
                            ) : (
                              newStatus === 'declined' ? 'Confirm Decline' : 'Confirm Cancellation'
                            )}
                          </button>

                          <button
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                            onClick={() => setNewStatus('')}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Message Icon Button */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <button
                    onClick={() => setIsChatModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        <i className="fas fa-comments"></i>
                      </div>
                      <div>
                        <h4 className="font-medium">Messages</h4>
                        <p className="text-xs text-gray-500">
                          {appointment.clientNotes?.length || appointment.barbershopNotes?.length
                            ? `${(appointment.clientNotes?.length || 0) + (appointment.barbershopNotes?.length || 0)} messages`
                            : 'No messages yet'}
                        </p>
                      </div>
                    </div>
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Modal */}
          <ChatModal
            isOpen={isChatModalOpen}
            onClose={() => setIsChatModalOpen(false)}
            appointment={appointment}
            onAddNote={handleAddNote}
            isSubmitting={isSubmitting}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4 text-gray-300"><i className="fas fa-calendar-times"></i></div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Appointment Not Found</h3>
          <p className="text-gray-500 mb-6">The appointment you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            href="/dashboard/appointments"
            className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Appointments
          </Link>
        </div>
      )}
    </div>
  );
}

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'in-progress':
      return 'bg-purple-100 text-purple-800 border border-purple-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'canceled':
      return 'bg-red-100 text-red-800 border border-red-200';
    case 'declined':
      return 'bg-red-100 text-red-800 border border-red-200';
    case 'no-show':
      return 'bg-gray-100 text-gray-800 border border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return 'fas fa-clock';
    case 'confirmed':
      return 'fas fa-check-circle';
    case 'in-progress':
      return 'fas fa-spinner fa-spin';
    case 'completed':
      return 'fas fa-check-double';
    case 'canceled':
      return 'fas fa-times-circle';
    case 'declined':
      return 'fas fa-ban';
    case 'no-show':
      return 'fas fa-user-slash';
    default:
      return 'fas fa-question-circle';
  }
};

const getTimeRemaining = (date: string, time: string) => {
  const appointmentDate = new Date(date);
  const [timeHours, timeMinutes] = time.split(':').map(Number);
  appointmentDate.setHours(timeHours, timeMinutes);

  const now = new Date();
  const diff = appointmentDate.getTime() - now.getTime();

  if (diff < 0) {
    return 'Appointment has passed';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} from now`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} from now`;
  } else {
    return `${mins} minute${mins > 1 ? 's' : ''} from now`;
  }
};
