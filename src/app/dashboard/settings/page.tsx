'use client';

import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../lib/firebase';
import { SettingsForm, PasswordModal } from './components';
import { useSettings } from '../../../lib/hooks/useSettings';

export default function SettingsPage() {
  const [user] = useAuthState(auth);
  const { barbershopData, loading } = useSettings();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  if (loading || !barbershopData) {
    return (
      <div className="p-6 w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold text-black mb-6">Manage your barbershop.</h1>

      <SettingsForm
        barbershop={barbershopData}
        isEditing={isEditing}
        userEmail={user?.email}
        onEdit={() => setIsEditing(true)}
        onCancel={() => setIsEditing(false)}
        onChangePassword={() => setShowPasswordModal(true)}
      />

      <PasswordModal
        isOpen={showPasswordModal}
        onCancel={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
