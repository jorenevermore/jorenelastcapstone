'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '../../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ProfileSection, BarbershopSection, AccountActionsSection, PasswordModal } from './components';

interface BarbershopData {
  name: string;
  phone: string;
  email: string;
  featuredImage?: string | null;
}

export default function SettingsPage() {
  const [user] = useAuthState(auth);

  // barbershop data
  const [barbershopData, setBarbershopData] = useState<BarbershopData>({
    name: '',
    phone: '',
    email: '',
    featuredImage: null
  });

  // form state
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // load barbershop data
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

  const processFile = (file: File) => {
    setImageFile(file);

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

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBarbershop = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setIsUploading(true);
      setError(null);
      setSuccess(null);

      let imageUrl = imagePreview;

      if (imageFile) {
        const storageRef = ref(storage, `barbershop/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const barbershopRef = doc(db, 'barbershops', user.uid);
      await updateDoc(barbershopRef, {
        name: barbershopData.name,
        phone: barbershopData.phone,
        email: barbershopData.email,
        featuredImage: imageUrl
      });

      setBarbershopData(prev => ({ ...prev, featuredImage: imageUrl }));
      setImageFile(null);

      setSuccess('Barbershop information updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating barbershop:', err);
      setError('Failed to update barbershop information. Please try again.');
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setPasswordLoading(true);
      setError(null);
      setSuccess(null);

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setSuccess('Password changed successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      let errorMsg = 'Failed to change password';
      if (err instanceof Error) {
        if (err.message.includes('wrong-password')) {
          errorMsg = 'Current password is incorrect';
        } else if (err.message.includes('too-many-requests')) {
          errorMsg = 'Too many failed attempts. Try again later';
        }
      }
      setError(errorMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
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

      <ProfileSection
        user={user}
        displayName={displayName}
        loading={loading}
        onDisplayNameChange={setDisplayName}
        onSave={handleSaveProfile}
      />

      <BarbershopSection
        barbershopData={barbershopData}
        imagePreview={imagePreview}
        dragActive={dragActive}
        loading={loading}
        isUploading={isUploading}
        onBarbershopDataChange={(data: Partial<BarbershopData>) => setBarbershopData(prev => ({ ...prev, ...data }))}
        onImageChange={handleImageChange}
        onDrag={handleDrag}
        onDrop={handleDrop}
        onRemoveImage={removeImage}
        onSave={handleSaveBarbershop}
      />

      <AccountActionsSection
        onChangePasswordClick={() => setShowPasswordModal(true)}
      />

      <PasswordModal
        isOpen={showPasswordModal}
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        loading={passwordLoading}
        error={error}
        onCurrentPasswordChange={setCurrentPassword}
        onNewPasswordChange={setNewPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onSubmit={handleChangePassword}
        onCancel={handleClosePasswordModal}
      />
    </div>
  );
}
