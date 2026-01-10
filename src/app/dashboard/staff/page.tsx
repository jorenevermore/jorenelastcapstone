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

  const {
    getAffiliatedBarbersByBarbershopId,
    addBarberToBarbershop,
    removeBarberFromBarbershop,
    updateBarber,
    deleteBarber
  } = useStaff();

  const {
    addUnavailableDate,
    removeUnavailableDate,
    getUnavailableDates
  } = useBarberAvailability();

  const form = useBarberForm();
  const availability = useUnavailableDatesModal();

  useEffect(() => {
    const fetchBarbers = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const barbershopDoc = await getDoc(doc(db, 'barbershops', user.uid));
        if (!barbershopDoc.exists()) {
          setError('No barbershop found. Please set up your barbershop first.');
          return;
        }

        const barbers = await getAffiliatedBarbersByBarbershopId(user.uid);
        setBarbers(barbers);
      } catch (err) {
        console.error(err);
        setError('Failed to load barbers.');
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, [user, getAffiliatedBarbersByBarbershopId]);

  const handleSubmit = async (formData: any) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const barbershopDoc = await getDoc(doc(db, 'barbershops', user.uid));
      if (!barbershopDoc.exists()) {
        setError('Barbershop not found.');
        return;
      }

      const barbershopData = barbershopDoc.data();

      let imageUrl = formData.imagePreview;

      if (formData.imageFile) {
        form.setIsUploading(true);
        const uploadResult = await uploadFile(formData.imageFile, 'staffs');
        form.setIsUploading(false);

        if (!uploadResult.success) {
          setError(uploadResult.message || 'Image upload failed');
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
        await updateBarber(formData.currentBarber.barberId, barberData);

        setBarbers(prev =>
          prev.map(b =>
            b.barberId === formData.currentBarber.barberId
              ? { ...b, ...barberData }
              : b
          )
        );
      } else {
        const newBarber = await addBarberToBarbershop(user.uid, barberData);
        setBarbers(prev => [...prev, newBarber]);
      }

      form.closeForm();
    } catch (err) {
      console.error(err);
      setError('Failed to save barber.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBarber = (barber: Barber) => {
    setBarberToDelete(barber);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteBarber = async () => {
    if (!barberToDelete || !user) return;

    try {
      setLoading(true);
      setError(null);

      await removeBarberFromBarbershop(user.uid, barberToDelete.barberId);
      await deleteBarber(barberToDelete.barberId);

      setBarbers(prev => prev.filter(b => b.barberId !== barberToDelete.barberId));
      setShowDeleteConfirmation(false);
      setBarberToDelete(null);
    } catch (err) {
      console.error(err);
      setError('Failed to delete barber.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUnavailableDatesModal = async (barber: Barber) => {
    availability.openModal(barber);
    availability.setLoading(true);

    try {
      const dates = await getUnavailableDates(barber.barberId);
      availability.setUnavailableDates(dates);
    } catch (err) {
      availability.setError('Failed to load unavailable dates.');
    } finally {
      availability.setLoading(false);
    }
  };

  const handleAddUnavailableDate = async () => {
    if (!availability.selectedBarber) return;

    const validation = availability.validateDate(availability.selectedDate);
    if (!validation.valid) {
      availability.setError(validation.message || 'Invalid date');
      return;
    }

    try {
      availability.setLoading(true);

      const isoDate = new Date(availability.selectedDate).toISOString();
      const newDate = await addUnavailableDate(
        availability.selectedBarber.barberId,
        isoDate
      );

      availability.addDate(newDate);
      availability.setSelectedDate('');
    } catch (err) {
      availability.setError('Failed to add unavailable date.');
    } finally {
      availability.setLoading(false);
    }
  };

  const handleRemoveUnavailableDate = async (dateId: string) => {
    try {
      availability.setLoading(true);
      await removeUnavailableDate(dateId);
      availability.removeDate(dateId);
    } catch (err) {
      availability.setError('Failed to remove unavailable date.');
    } finally {
      availability.setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <button className="btn btn-primary" onClick={() => form.openForm()}>
          <i className="fas fa-plus mr-2"></i> Add Barber
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <BarberForm
        isOpen={form.isFormOpen}
        isLoading={loading}
        onClose={() => form.closeForm()}
        onSubmit={handleSubmit}
        form={form}
      />

      <BarbersTable
        barbers={barbers}
        loading={loading && !form.isFormOpen}
        onEdit={barber => form.editBarber(barber)}
        onDelete={handleDeleteBarber}
        onOpenUnavailableDates={handleOpenUnavailableDatesModal}
      />

      <UnavailableDatesModal
        isOpen={availability.showModal}
        barber={availability.selectedBarber}
        selectedDate={availability.selectedDate}
        unavailableDates={availability.unavailableDates}
        error={availability.error}
        loading={availability.loading}
        onClose={() => availability.closeModal()}
        onDateChange={availability.setSelectedDate}
        onDateChangeWithErrorClear={availability.setSelectedDateWithErrorClear}
        onAddDate={handleAddUnavailableDate}
        onRemoveDate={handleRemoveUnavailableDate}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Delete Barber"
        message={`Are you sure you want to delete ${barberToDelete?.fullName}?`}
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
