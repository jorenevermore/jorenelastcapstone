'use client';

import React from 'react';
import { useBarberForm } from '../../../../lib/hooks/useBarberForm';

interface BarberFormProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
}

export default function BarberForm({ isOpen, isLoading, onClose, onSubmit }: BarberFormProps) {
  const form = useBarberForm();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      form.setImageFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          form.setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      fullName: form.fullName,
      email: form.email,
      contactNumber: form.contactNumber,
      address: form.address,
      isAvailable: form.isAvailable,
      imageFile: form.imageFile,
      imagePreview: form.imagePreview,
      isEditing: form.isEditing,
      currentBarber: form.currentBarber
    });
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-black mb-4">
        {form.isEditing ? 'Edit Barber' : 'Add New Barber'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">Full Name</label>
            <input
              type="text"
              id="fullName"
              className="form-input"
              value={form.fullName}
              onChange={(e) => form.setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={form.email}
              onChange={(e) => form.setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactNumber" className="form-label">Contact Number</label>
            <input
              type="text"
              id="contactNumber"
              className="form-input"
              value={form.contactNumber}
              onChange={(e) => form.setContactNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">Address</label>
            <input
              type="text"
              id="address"
              className="form-input"
              value={form.address}
              onChange={(e) => form.setAddress(e.target.value)}
              required
            />
          </div>

          {/* Image Upload Section */}
          <div className="form-group col-span-2">
            <label className="form-label">Profile Picture</label>
            {form.imagePreview ? (
              <div className="relative rounded-lg overflow-hidden mb-3">
                <img
                  src={form.imagePreview}
                  alt="Preview"
                  className="w-full h-56 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    form.setImagePreview(null);
                    form.setImageFile(null);
                  }}
                  className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 transition-opacity"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ) : (
              <label className="inline-block px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg cursor-pointer transition-colors">
                <span>Choose Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Upload a professional profile picture for this barber. Recommended size: 400x400px.
            </p>
          </div>

          <div className="form-group col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5"
                style={{ accentColor: '#BF8F63' }}
                checked={form.isAvailable}
                onChange={(e) => form.setIsAvailable(e.target.checked)}
              />
              <span className="ml-2 text-gray-700">Available for appointments</span>
            </label>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || form.isUploading}
          >
            {form.isUploading ? 'Uploading...' : isLoading ? 'Saving...' : 'Save Barber'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

