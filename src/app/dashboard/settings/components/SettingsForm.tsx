'use client';

import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { useFileUpload } from '../../../../lib/hooks/useFileUpload';
import type { BarbershopProfile } from '../../../../types/barbershop';

interface SettingsFormProps {
  barbershop: BarbershopProfile;
  userEmail: string | null | undefined;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onChangePassword: () => void;
}

export default function SettingsForm({
  barbershop,
  userEmail,
  isEditing,
  onEdit,
  onCancel,
  onChangePassword
}: SettingsFormProps) {
  const { uploadFile } = useFileUpload();
  const [formData, setFormData] = useState({ name: barbershop.name, phone: barbershop.phone, email: barbershop.email });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(barbershop.featuredImage || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const updateData: any = { ...formData };

      if (imageFile) {
        const result = await uploadFile(imageFile, 'barbershop');
        if (!result.success) {
          setError(result.message || 'Failed to upload image');
          return;
        }
      }

      await updateDoc(doc(db, 'barbershops', barbershop.barbershopId), updateData);
      onCancel();
    } catch (err) {
      setError('Failed to save changes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Barbershop Settings</h2>
        {!isEditing && (
          <button
            className="px-3 py-1.5 text-white text-xs font-medium rounded transition-colors"
            style={{ backgroundColor: '#BF8F63' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A67C52'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#BF8F63'}
            onClick={onEdit}
          >
            Edit
          </button>
        )}
      </div>

      <div className="flex gap-6">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-full border-4 border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <i className="fas fa-camera text-gray-400 text-2xl"></i>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-2 text-center">{formData.name}</p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="space-y-4">
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                <label className="inline-block px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 text-xs font-medium rounded cursor-pointer transition-colors">
                  <span>Choose Photo</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <p className="text-sm text-gray-900">{formData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                value={userEmail || ''}
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-gray-900">{formData.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-gray-900">{formData.email}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {isEditing ? (
                <>
                  <button
                    className="px-3 py-1.5 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                    style={{ backgroundColor: '#BF8F63' }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#A67C52')}
                    onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#BF8F63')}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="px-3 py-1.5 bg-gray-300 hover:bg-gray-400 text-gray-900 text-xs font-medium rounded transition-colors"
                    onClick={onCancel}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="px-3 py-1.5 text-white text-xs font-medium rounded transition-colors"
                  style={{ backgroundColor: '#BF8F63' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A67C52'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#BF8F63'}
                  onClick={onChangePassword}
                >
                  Change Password
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

