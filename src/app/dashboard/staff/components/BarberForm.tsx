'use client';

import React from 'react';
import { useBarberForm } from '../../../../lib/hooks/useBarberForm';

interface BarberFormProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  form: ReturnType<typeof useBarberForm>;
}

export default function BarberForm({
  isOpen,
  isLoading,
  onClose,
  onSubmit,
  form,
}: BarberFormProps) {
  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setImageFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        form.setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      currentBarber: form.currentBarber,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-black">
          {form.isEditing ? 'Edit Barber' : 'Add New Barber'}
        </h2>

        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={form.fullName}
          onChange={(e) => form.setFullName(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => form.setEmail(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />

        {/* Contact Number */}
        <input
          type="text"
          placeholder="Contact Number"
          value={form.contactNumber}
          onChange={(e) => form.setContactNumber(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        {/* Address */}
        <input
          type="text"
          placeholder="Address"
          value={form.address}
          onChange={(e) => form.setAddress(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        {/* Availability */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={(e) => form.setIsAvailable(e.target.checked)}
          />
          Available
        </label>

        {/* Image Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />

        {form.imagePreview && (
          <img
            src={form.imagePreview}
            alt="Preview"
            className="h-32 w-32 object-cover rounded"
          />
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-2 rounded hover:opacity-90 disabled:opacity-50"
        >
          {isLoading
            ? 'Saving...'
            : form.isEditing
            ? 'Update Barber'
            : 'Add Barber'}
        </button>
      </form>
    </div>
  );
}
