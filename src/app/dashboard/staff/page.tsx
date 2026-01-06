'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useStaff, Barber } from '../../../lib/hooks/useStaff';
import { useFileUpload } from '../../../lib/hooks/useFileUpload';
import { useBarberAvailability } from '../../../lib/hooks/useBarberAvailability';
import { useBarberForm } from '../../../lib/hooks/useBarberForm';
import { useUnavailableDatesModal } from '../../../lib/hooks/useUnavailableDatesModal';
import ConfirmationModal from '../services/components/ConfirmationModal';
import BarberForm from './components/BarberForm';
import BarbersTable from './components/BarbersTable';
import UnavailableDatesModal from './components/UnavailableDatesModal';

export default function StaffPage() {
  const [user] = useAuthState(auth);
  const { uploadFile } = useFileUpload();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [barberToDelete, setBarberToDelete] = useState<Barber | null>(null);

  // Service hooks
  const {
    getBarbersByBarbershopId,
    addBarberToBarbershop,
    removeBarberFromBarbershop,
    updateBarber: updateBarberService,
    deleteBarber: deleteBarberService
  } = useStaff();

  const {
    addUnavailableDate,
    removeUnavailableDate,
    getUnavailableDates
  } = useBarberAvailability();

  // Custom hooks for form and modal state
  const form = useBarberForm();
  const availability = useUnavailableDatesModal();

  // fetch barbershop details and barbers
  useEffect(() => {
    const fetchBarbershopDetails = async () => {
      try {
        if (user) {
          const barbershopDoc = await getDoc(doc(db, 'barbershops', user.uid));
          if (barbershopDoc.exists()) {
            const result = await getBarbersByBarbershopId(user.uid);
            if (result.success && result.data) {
              setBarbers(result.data as Barber[]);
            } else {
              setError(result.message || 'Failed to load barbers');
            }
          } else {
            setError("No barbershop found for this account. Please set up your barbershop first.");
          }
        }
      } catch (err) {
        console.error('Error fetching barbershop details:', err);
        setError('Failed to load barbers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    setError(null);
    fetchBarbershopDetails();
  }, [user, getBarbersByBarbershopId]);



  // Handle form submission
  const handleSubmit = async (formData: any) => {
    if (!user) return;

    try {
      setLoading(true);

      // Get barbershop details
      const barbershopDoc = await getDoc(doc(db, 'barbershops', user.uid));
      if (!barbershopDoc.exists()) {
        setError('Barbershop details not found. Please set up your barbershop first.');
        setLoading(false);
        return;
      }

      const barbershopData = barbershopDoc.data();

      let imageUrl = formData.imagePreview; // Keep existing image if no new one uploaded

      // Upload new image if one was selected
      if (formData.imageFile) {
        form.setIsUploading(true);
        const uploadResult = await uploadFile(formData.imageFile, 'staffs');
        form.setIsUploading(false);
        if (!uploadResult.success) {
          setError(uploadResult.message || 'Failed to upload image');
          setLoading(false);
          return;
        }
        imageUrl = uploadResult.data as string;
      }

      const barberData = {
        fullName: formData.fullName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        address: formData.address,
        isAvailable: formData.isAvailable,
        affiliatedBarbershopId: user.uid,
        affiliatedBarbershop: barbershopData.name || user.email || 'Unknown Barbershop',
        image: imageUrl
      };

      if (formData.isEditing && formData.currentBarber) {
        // Update existing barber
        const result = await updateBarberService(formData.currentBarber.barberId, barberData);

        if (!result.success) {
          setError(result.message || 'Failed to update barber');
          return;
        }

        setBarbers(prev => prev.map(b =>
          b.barberId === formData.currentBarber.barberId
            ? { ...barberData, barberId: formData.currentBarber.barberId }
            : b
        ));
      } else {
        // Add new barber
        const result = await addBarberToBarbershop(user.uid, barberData);

        if (!result.success || !result.data) {
          setError(result.message || 'Failed to add barber');
          return;
        }

        const newBarberId = result.data.barberId || (result.data as string);
        setBarbers(prev => [...prev, { ...barberData, barberId: newBarberId }]);
      }

      form.closeForm();
    } catch (err) {
      console.error('Error saving barber:', err);
      setError('Failed to save barber. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle barber deletion - show confirmation first
  const handleDeleteBarber = (barber: Barber) => {
    setBarberToDelete(barber);
    setShowDeleteConfirmation(true);
  };

  // Execute barber deletion after confirmation
  const confirmDeleteBarber = async () => {
    if (!barberToDelete) return;

    try {
      setLoading(true);

      if (user) {
        // Remove the barber from the barbershop's barbers array using OOP hook
        const removeResult = await removeBarberFromBarbershop(user.uid, barberToDelete.barberId);
        if (!removeResult.success) {
          setError(removeResult.message || 'Failed to remove barber from barbershop');
          return;
        }
      }

      // Delete the barber document using OOP hook
      const result = await deleteBarberService(barberToDelete.barberId);

      if (!result.success) {
        setError(result.message || 'Failed to delete barber');
        return;
      }

      // Update local state - use functional update to avoid stale closure
      setBarbers(prev => prev.filter(b => b.barberId !== barberToDelete.barberId));
      setShowDeleteConfirmation(false);
      setBarberToDelete(null);
    } catch (err) {
      console.error('Error deleting barber:', err);
      setError('Failed to delete barber. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  // Open unavailable dates modal
  const handleOpenUnavailableDatesModal = async (barber: Barber) => {
    availability.openModal(barber);
    availability.setLoading(true);

    const result = await getUnavailableDates(barber.barberId);
    availability.setLoading(false);

    if (result.success && result.data) {
      availability.setUnavailableDates(result.data);
    } else {
      availability.setError(result.message || 'Failed to load unavailable dates');
    }
  };

  // Add unavailable date
  const handleAddUnavailableDate = async () => {
    if (!availability.selectedBarber) {
      availability.setError('No barber selected');
      return;
    }

    // Validate the date
    const validation = availability.validateDate(availability.selectedDate);
    if (!validation.valid) {
      availability.setError(validation.message || 'Invalid date');
      return;
    }

    try {
      availability.setLoading(true);
      const dateObj = new Date(availability.selectedDate);
      const isoDate = dateObj.toISOString();

      const result = await addUnavailableDate(availability.selectedBarber.barberId, isoDate);
      if (!result.success) {
        availability.setError(result.message || 'Failed to add unavailable date');
        return;
      }

      if (result.data) {
        availability.addDate(result.data);
      }

      availability.setSelectedDate('');
    } catch (err) {
      console.error('Error adding unavailable date:', err);
      availability.setError('Failed to add unavailable date. Please try again.');
    } finally {
      availability.setLoading(false);
    }
  };

  // Remove unavailable date
  const handleRemoveUnavailableDate = async (dateId: string) => {
    try {
      availability.setLoading(true);
      const result = await removeUnavailableDate(dateId);
      if (!result.success) {
        availability.setError(result.message || 'Failed to remove unavailable date');
        return;
      }

      availability.removeDate(dateId);
    } catch (err) {
      console.error('Error removing unavailable date:', err);
      availability.setError('Failed to remove unavailable date. Please try again.');
    } finally {
      availability.setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Staff Management.</h1>
        <button
          className="btn btn-primary"
          onClick={() => form.openForm()}
        >
          <i className="fas fa-plus mr-2"></i> Add Barber
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Barber Form Component */}
      <BarberForm
        isOpen={form.isFormOpen}
        isLoading={loading}
        onClose={() => form.closeForm()}
        onSubmit={handleSubmit}
      />

      {/* Barbers Table Component */}
      <BarbersTable
        barbers={barbers}
        loading={loading && !form.isFormOpen}
        onEdit={(barber) => form.editBarber(barber)}
        onDelete={(barber) => handleDeleteBarber(barber)}
        onOpenUnavailableDates={(barber) => handleOpenUnavailableDatesModal(barber)}
      />

      {/* Unavailable Dates Modal Component */}
      <UnavailableDatesModal
        isOpen={availability.showModal}
        barber={availability.selectedBarber}
        selectedDate={availability.selectedDate}
        unavailableDates={availability.unavailableDates}
        error={availability.error}
        loading={availability.loading}
        onClose={() => availability.closeModal()}
        onDateChange={(date) => availability.setSelectedDate(date)}
        onDateChangeWithErrorClear={(date) => availability.setSelectedDateWithErrorClear(date)}
        onAddDate={handleAddUnavailableDate}
        onRemoveDate={handleRemoveUnavailableDate}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Delete Barber"
        message={`Are you sure you want to delete ${barberToDelete?.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        onClose={() => {
          setShowDeleteConfirmation(false);
          setBarberToDelete(null);
        }}
        onConfirm={confirmDeleteBarber}
        type="danger"
      />
    </div>
  );
}
