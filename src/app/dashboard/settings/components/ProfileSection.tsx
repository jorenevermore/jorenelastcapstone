'use client';

import React from 'react';

interface ProfileSectionProps {
  user: any;
  displayName: string;
  loading: boolean;
  onDisplayNameChange: (value: string) => void;
  onSave: () => void;
}

export default function ProfileSection({
  user,
  displayName,
  loading,
  onDisplayNameChange,
  onSave
}: ProfileSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-black mb-4">Profile Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={user?.email || ''}
            disabled
          />
          <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        <div className="form-group">
          <label htmlFor="displayName" className="form-label">Display Name</label>
          <input
            type="text"
            id="displayName"
            className="form-input"
            placeholder="Enter your display name"
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          className="btn btn-primary"
          onClick={onSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

