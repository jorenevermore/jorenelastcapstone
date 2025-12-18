'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useStaff, Barber } from '../../../lib/hooks/useStaff';
import { useFileUpload } from '../../../lib/hooks/useFileUpload';
import ConfirmationModal from '../services/components/ConfirmationModal';

export default function StaffPage() {
  const [user] = useAuthState(auth);
  const { uploadFile, isUploading: fileUploading } = useFileUpload();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    getBarbersByBarbershopId,
    addBarberToBarbershop,
    removeBarberFromBarbershop,
    updateBarber: updateBarberService,
    deleteBarber: deleteBarberService
  } = useStaff();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBarber, setCurrentBarber] = useState<Barber | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [barberToDelete, setBarberToDelete] = useState<Barber | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    setDragActive(false);
  };

  const handleAddBarber = () => {
    resetForm();
    setIsFormOpen(true);
  };
  
  const handleEditBarber = (barber: Barber) => {
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      let imageUrl = imagePreview; // Keep existing image if no new one uploaded

      // Upload new image if one was selected
      if (imageFile) {
        const uploadResult = await uploadFile(imageFile, 'staffs');
        if (!uploadResult.success) {
          setError(uploadResult.message || 'Failed to upload image');
          setLoading(false);
          return;
        }
        imageUrl = uploadResult.data as string;
      }

      const barberData = {
        fullName,
        email,
        contactNumber,
        address,
        isAvailable,
        affiliatedBarbershopId: user.uid,
        affiliatedBarbershop: barbershopData.name || user.email || 'Unknown Barbershop',
        image: imageUrl
      };

      if (isEditing && currentBarber) {
        // Update existing barber using OOP hook
        const result = await updateBarberService(currentBarber.barberId, barberData);

        if (!result.success) {
          setError(result.message || 'Failed to update barber');
          return;
        }

        // Update local state - use functional update to avoid stale closure
        setBarbers(prev => prev.map(b =>
          b.barberId === currentBarber.barberId
            ? { ...barberData, barberId: currentBarber.barberId }
            : b
        ));
      } else {
        // Add new barber to barbershop using OOP hook
        const result = await addBarberToBarbershop(user.uid, barberData);

        if (!result.success || !result.data) {
          setError(result.message || 'Failed to add barber');
          return;
        }

        const newBarberId = result.data.barberId || (result.data as string);

        // Update local state - use functional update to avoid stale closure
        setBarbers(prev => [...prev, { ...barberData, barberId: newBarberId }]);
      }

      // Close form and reset fields
      setIsFormOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error saving barber:', err);
      setError('Failed to save barber. Please try again.');
    } finally {
      setLoading(false);
      setIsUploading(false);
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

  // Toggle barber availability
  const toggleAvailability = async (barber: Barber) => {
    try {
      setLoading(true);
      const newAvailability = !barber.isAvailable;

      // Update in database using OOP hook
      const result = await updateBarberService(barber.barberId, { isAvailable: newAvailability });

      if (!result.success) {
        setError(result.message || 'Failed to update availability');
        return;
      }

      // Update local state - use functional update to avoid stale closure
      setBarbers(prev => prev.map(b =>
        b.barberId === barber.barberId
          ? { ...b, isAvailable: newAvailability }
          : b
      ));
    } catch (err) {
      console.error('Error updating availability:', err);
      setError('Failed to update availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Staff Management.</h1>
        <button
          className="btn btn-primary"
          onClick={handleAddBarber}
        >
          <i className="fas fa-plus mr-2"></i> Add Barber
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Barber Form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-black mb-4">
            {isEditing ? 'Edit Barber' : 'Add New Barber'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber" className="form-label">Contact Number</label>
                <input
                  type="text"
                  id="contactNumber"
                  className="form-input"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address" className="form-label">Address</label>
                <input
                  type="text"
                  id="address"
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              {/* Image Upload Section */}
              <div className="form-group col-span-2">
                <label className="form-label">Profile Picture</label>

                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden mb-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-56 object-cover"
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
                    <p className="text-gray-700 mb-2">Drag and drop profile picture here</p>
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
                  Upload a professional profile picture for this barber. Recommended size: 400x400px.
                </p>
              </div>

              <div className="form-group col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5"
                    style={{ accentColor: '#BF8F63' }}
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                  />
                  <span className="ml-2 text-gray-700">Available for appointments</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || isUploading}
              >
                {isUploading ? 'Uploading...' : loading ? 'Saving...' : 'Save Barber'}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Barbers List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading && !isFormOpen ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-2"></div>
            <p>Loading barbers...</p>
          </div>
        ) : barbers.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No barbers found. Add your first barber to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {barbers.map((barber) => (
                  <tr key={barber.barberId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
                          {barber.image ? (
                            <img
                              src={barber.image}
                              alt={barber.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <i className="fas fa-user-alt"></i>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{barber.fullName}</div>
                          <div className="text-sm text-gray-500">{barber.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{barber.contactNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{barber.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          barber.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {barber.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-gray-600 hover:text-black mr-3"
                        onClick={() => toggleAvailability(barber)}
                      >
                        <i className={`fas ${barber.isAvailable ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                      </button>
                      <button
                        className="text-gray-600 hover:text-black mr-3"
                        onClick={() => handleEditBarber(barber)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteBarber(barber)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
