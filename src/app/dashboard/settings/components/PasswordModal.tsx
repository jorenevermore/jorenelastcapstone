'use client';

import React, { useState } from 'react';

interface PasswordModalProps {
  isOpen: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  loading: boolean;
  error: string | null;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function PasswordModal({
  isOpen,
  currentPassword,
  newPassword,
  confirmPassword,
  loading,
  error,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onCancel
}: PasswordModalProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-black mb-4">Change Password</h3>

        <div className="space-y-4">
          <div className="form-group">
            <label htmlFor="currentPassword" className="form-label">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                className="form-input pr-10"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => onCurrentPasswordChange(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <i className={`fas ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                className="form-input pr-10"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => onNewPasswordChange(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="form-input pr-10"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              className="flex-1 btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="flex-1 btn btn-primary"
              onClick={onSubmit}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

