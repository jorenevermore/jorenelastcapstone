'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../lib/firebase';
import { useNotificationsPage } from '../../../lib/hooks/useNotificationsPage';
import { useStaff } from '../../../lib/hooks/useStaff';
import { parseBookingDateTime, formatTimestamp } from '../../../lib/utils/dateParser';

export default function NotificationsPage() {
  const router = useRouter();
  const [user] = useAuthState(auth);

  const barbershopId = user?.uid ?? null;

  const [processingId, setProcessingId] = useState<string | null>(null);

  // modal state (local, fixed + minimal)
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    barberId: string;
    action: 'approved' | 'rejected';
    barberName: string;
  } | null>(null);

  const { notifications, loading, error, fetchNotifications, markAsRead } =
    useNotificationsPage(barbershopId);

  const { updateAffiliationStatus } = useStaff();

  const openConfirmation = (
    barberId: string,
    action: 'approved' | 'rejected',
    barberName: string
  ) => {
    setConfirmationData({ barberId, action, barberName });
    setShowConfirmation(true);
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    setConfirmationData(null);
  };

  const confirmAffiliationAction = async () => {
    if (!confirmationData || !barbershopId) return;

    try {
      setProcessingId(confirmationData.barberId);

      await updateAffiliationStatus(
        confirmationData.barberId,
        confirmationData.action
      );

      await fetchNotifications(barbershopId);
    } catch (err) {
      console.error('Error updating affiliation status:', err);
    } finally {
      setProcessingId(null);
      closeConfirmation();
    }
  };

  const modalTitle =
    confirmationData?.action === 'approved'
      ? 'Approve Affiliation'
      : 'Reject Affiliation';

  const modalMessage =
    confirmationData?.action === 'approved'
      ? `Approve ${confirmationData?.barberName}'s request to join your barbershop?`
      : `Reject ${confirmationData?.barberName}'s request to join your barbershop?`;

  const confirmLabel =
    confirmationData?.action === 'approved' ? '✓': 'Cancel';

const confirmClass =
  confirmationData?.action === 'approved'
    ? 'bg-green-600 hover:bg-green-700 active:bg-green-800'
    : 'bg-red-600 hover:bg-red-700 active:bg-red-800';


  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-2"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Notifications.</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-6xl text-gray-300 mb-4">
            <i className="fas fa-bell-slash"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No notifications
          </h3>
          <p className="text-gray-500">
            You're all caught up! New notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
          {notifications.map(notification => {
            const isBooking = notification.type === 'booking';
            const isAffiliation = notification.type === 'affiliation_request';

            const affiliationBarberId = isAffiliation
              ? (notification.data as any).barberId
              : null;

            const affiliationBarberName = isAffiliation
              ? (notification.data as any).fullName
              : '';

            const isProcessingThis =
              !!affiliationBarberId && processingId === affiliationBarberId;

            return (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50/30' : ''
                }`}
                onClick={() => {
                  if (isBooking) {
                    router.push(`/dashboard/appointments`);
                    markAsRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100">
                    <i
                      className={`${
                        isBooking
                          ? 'fas fa-calendar text-gray-600'
                          : 'fas fa-user-plus text-slate-600'
                      }`}
                    ></i>
                  </div>

                  <div className="flex-1 min-w-0">
                    {isBooking &&
                      'bookingId' in notification.data &&
                      (() => {
                        const parsed = parseBookingDateTime(
                          (notification.data as any).date || '',
                          (notification.data as any).time || ''
                        );

                        return (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">
                              {(notification.data as any).clientName}
                            </span>{' '}
                            booked a{' '}
                            <span className="font-medium">
                              {(notification.data as any).styleOrdered}
                            </span>{' '}
                            for {parsed.date}{' '}
                            <span className="font-medium">
                              ({parsed.sessionLabel})
                            </span>
                            .
                          </p>
                        );
                      })()}

                    {isAffiliation && (
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">
                          {(notification.data as any).fullName}
                        </span>{' '}
                        requested to join your barbershop.
                      </p>
                    )}

                    {!isBooking && !isAffiliation && (
                      <p className="text-sm text-gray-900">
                        {notification.message}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-1">
                      {isBooking ? 'Placed on: ' : ''}
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>

                  {isAffiliation ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (!affiliationBarberId) return;
                          openConfirmation(
                            affiliationBarberId,
                            'approved',
                            affiliationBarberName
                          );
                        }}
                        disabled={isProcessingThis}
                        className="inline-flex items-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700
                                   hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessingThis ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-check"></i>
                        )}
                        Confirm
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (!affiliationBarberId) return;
                          openConfirmation(
                            affiliationBarberId,
                            'rejected',
                            affiliationBarberName
                          );
                        }}
                        disabled={isProcessingThis}
                        className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700
                                   hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessingThis ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-times"></i>
                        )}
                        Decline
                      </button>
                    </div>
                  ) : (
                    !notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Fixed, minimal modal (no global component needed) */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeConfirmation}
          />

          {/* modal */}
          <div className="relative w-[92%] max-w-md rounded-xl bg-white shadow-xl">
            {/* header */}
            <div className="flex items-center justify-between px-6 pt-5">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalTitle}
              </h3>

              <button
                onClick={closeConfirmation}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* body */}
            <div className="px-6 pb-5 pt-3">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  i
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {modalMessage}
                </p>
              </div>

              {/* actions */}
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={closeConfirmation}
                  disabled={!!processingId}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmAffiliationAction}
                  disabled={!confirmationData || !!processingId}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed ${confirmClass}`}
                >
                  {processingId ? 'Processing…' : confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
