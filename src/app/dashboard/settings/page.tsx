'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '../../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface BarbershopData {
  name: string;
  phone: string;
  email: string;
  featuredImage?: string | null;
  // Add other fields as needed
}

export default function SettingsPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  // Barbershop data state
  const [barbershopData, setBarbershopData] = useState<BarbershopData>({
    name: '',
    phone: '',
    email: '',
    featuredImage: null
  });

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Load barbershop data on component mount
  useEffect(() => {
    const loadBarbershopData = async () => {
      if (!user) return;

      try {
        const barbershopDoc = await getDoc(doc(db, 'barbershops', user.uid));
        if (barbershopDoc.exists()) {
          const data = barbershopDoc.data();
          setBarbershopData({
            name: data.name || '',
            phone: data.phone || '',
            email: data.email || '',
            featuredImage: data.featuredImage || null
          });
          setImagePreview(data.featuredImage || null);
        }
        setDisplayName(user.displayName || '');
      } catch (err) {
        console.error('Error loading barbershop data:', err);
        setError('Failed to load barbershop data');
      }
    };

    loadBarbershopData();
  }, [user]);

  // Image handling functions
  const processFile = (file: File) => {
    setImageFile(file);

    // Create a preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  // Save profile settings
  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Update display name in Firebase Auth (if needed)
      // Note: This would require additional Firebase Auth methods

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000); // Clear success message after 3 seconds
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save barbershop information
  const handleSaveBarbershop = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setIsUploading(true);
      setError(null);
      setSuccess(null);

      let imageUrl = imagePreview; // Keep existing image if no new one uploaded

      // Upload new image if one was selected
      if (imageFile) {
        const storageRef = ref(storage, `barbershop/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Update barbershop document
      const barbershopRef = doc(db, 'barbershops', user.uid);
      await updateDoc(barbershopRef, {
        name: barbershopData.name,
        phone: barbershopData.phone,
        email: barbershopData.email,
        featuredImage: imageUrl
      });

      // Update local state
      setBarbershopData(prev => ({ ...prev, featuredImage: imageUrl }));
      setImageFile(null);

      setSuccess('Barbershop information updated successfully!');
      setTimeout(() => setSuccess(null), 3000); // Clear success message after 3 seconds
    } catch (err) {
      console.error('Error updating barbershop:', err);
      setError('Failed to update barbershop information. Please try again.');
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-black mb-6">Settings</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          <p>{success}</p>
        </div>
      )}

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
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            className="btn btn-primary"
            onClick={handleSaveProfile}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-black mb-4">Barbershop Information</h2>

        {/* Barbershop Image Upload */}
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
                onClick={removeImage}
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
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
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
                  onChange={handleImageChange}
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
              onChange={(e) => setBarbershopData(prev => ({ ...prev, name: e.target.value }))}
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
              onChange={(e) => setBarbershopData(prev => ({ ...prev, phone: e.target.value }))}
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
              onChange={(e) => setBarbershopData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            className="btn btn-primary"
            onClick={handleSaveBarbershop}
            disabled={loading || isUploading}
          >
            {isUploading ? 'Uploading...' : loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-black mb-4">Account Actions</h2>
        <div className="space-y-4">
          <div>
            <button className="btn btn-secondary">
              Change Password
            </button>
          </div>

          <div>
            <button
              className="btn bg-red-600 text-white hover:bg-red-700"
              onClick={async () => {
                try {
                  // Sign out from Firebase
                  await auth.signOut();

                  // Clear the Firebase token cookie
                  document.cookie = "firebaseToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

                  // Redirect to login page
                  router.push('/');
                } catch (error) {
                  console.error('Error signing out:', error);
                }
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
