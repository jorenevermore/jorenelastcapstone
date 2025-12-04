'use client';

import React from 'react';

interface BarbershopData {
  name: string;
  phone: string;
  email: string;
  featuredImage?: string | null;
}

interface BarbershopSectionProps {
  barbershopData: BarbershopData;
  imagePreview: string | null;
  dragActive: boolean;
  loading: boolean;
  isUploading: boolean;
  onBarbershopDataChange: (data: Partial<BarbershopData>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveImage: () => void;
  onSave: () => void;
}

export default function BarbershopSection({
  barbershopData,
  imagePreview,
  dragActive,
  loading,
  isUploading,
  onBarbershopDataChange,
  onImageChange,
  onDrag,
  onDrop,
  onRemoveImage,
  onSave
}: BarbershopSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-black mb-4">Barbershop Information</h2>

      <div className="form-group mb-6">
        <label className="form-label">Barbershop Photo</label>

        {imagePreview ? (
          <div className="relative rounded-lg overflow-hidden mb-3">
            <img
              src={imagePreview}
              alt="Barbershop Preview"
              className="w-full h-64 object-cover"
            />
            <button
              type="button"
              onClick={onRemoveImage}
              className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 transition-opacity"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              dragActive ? 'border-black bg-gray-50' : 'border-gray-300'
            }`}
            onDragEnter={onDrag}
            onDragOver={onDrag}
            onDragLeave={onDrag}
            onDrop={onDrop}
          >
            <div className="text-4xl text-gray-300 mb-3">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <p className="text-gray-700 mb-2">Drag and drop barbershop photo here</p>
            <p className="text-gray-500 text-sm mb-4">or</p>
            <label className="inline-block px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
              <span>Browse Files</span>
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-3">
              Supported formats: JPG, PNG, GIF
            </p>
          </div>
        )}
        <p className="text-sm text-gray-500 mt-2">
          Upload a high-quality photo of your barbershop. This will be displayed to customers. Recommended size: 1200x800px.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label htmlFor="shopName" className="form-label">Barbershop Name</label>
          <input
            type="text"
            id="shopName"
            className="form-input"
            placeholder="Enter your barbershop name"
            value={barbershopData.name}
            onChange={(e) => onBarbershopDataChange({ name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone" className="form-label">Phone Number</label>
          <input
            type="tel"
            id="phone"
            className="form-input"
            placeholder="Enter your phone number"
            value={barbershopData.phone}
            onChange={(e) => onBarbershopDataChange({ phone: e.target.value })}
          />
        </div>

        <div className="form-group col-span-2">
          <label htmlFor="email" className="form-label">Business Email</label>
          <input
            type="email"
            id="email"
            className="form-input"
            placeholder="Enter your business email"
            value={barbershopData.email}
            onChange={(e) => onBarbershopDataChange({ email: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          className="btn btn-primary"
          onClick={onSave}
          disabled={loading || isUploading}
        >
          {isUploading ? 'Uploading...' : loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

