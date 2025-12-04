'use client';

import React from 'react';
import { auth } from '../../../../lib/firebase';
import { useRouter } from 'next/navigation';

interface AccountActionsSectionProps {
  onChangePasswordClick: () => void;
}

export default function AccountActionsSection({
  onChangePasswordClick
}: AccountActionsSectionProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      document.cookie = "firebaseToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-black mb-4">Account Actions</h2>
      <div className="space-y-4">
        <div>
          <button
            className="btn btn-secondary"
            onClick={onChangePasswordClick}
          >
            Change Password
          </button>
        </div>

        <div>
          <button
            className="btn bg-red-600 text-white hover:bg-red-700"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

