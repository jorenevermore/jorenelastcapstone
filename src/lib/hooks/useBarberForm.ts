import { useState } from 'react';
import { Barber } from './useStaff';

export const useBarberForm = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBarber, setCurrentBarber] = useState<Barber | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setContactNumber('');
    setAddress('');
    setIsAvailable(true);
    setCurrentBarber(null);
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const openForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const editBarber = (barber: Barber) => {
    setCurrentBarber(barber);
    setFullName(barber.fullName);
    setEmail(barber.email);
    setContactNumber(barber.contactNumber);
    setAddress(barber.address);
    setIsAvailable(barber.isAvailable);
    setImagePreview(barber.image || null);
    setImageFile(null);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  return {
    // State
    isFormOpen,
    isEditing,
    currentBarber,
    fullName,
    email,
    contactNumber,
    address,
    isAvailable,
    imageFile,
    imagePreview,
    isUploading,
    // Setters
    setIsFormOpen,
    setFullName,
    setEmail,
    setContactNumber,
    setAddress,
    setIsAvailable,
    setImageFile,
    setImagePreview,
    setIsUploading,
    // Methods
    resetForm,
    openForm,
    closeForm,
    editBarber
  };
};

