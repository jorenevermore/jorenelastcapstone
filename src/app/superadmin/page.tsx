'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
interface GlobalService {
  id: string;
  title: string;
  featuredImage: string;
}

export default function SuperAdminDashboard() {
  const [services, setServices] = useState<GlobalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newService, setNewService] = useState({ title: '', featuredImage: '' });
  const [editingService, setEditingService] = useState<GlobalService | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<GlobalService | null>(null);



  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const servicesCollection = collection(db, 'services');
      const snapshot = await getDocs(servicesCollection);
      const servicesData: GlobalService[] = [];

      snapshot.forEach(doc => {
        servicesData.push({ id: doc.id, ...doc.data() } as GlobalService);
      });

      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.title.trim()) {
      setError('Service title is required');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      let featuredImageUrl = '';

      // Upload image if provided
      if (imageFile) {
        const storageRef = ref(storage, `services/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        featuredImageUrl = await getDownloadURL(snapshot.ref);
      }

      // Add service to Firestore
      const serviceData = {
        title: newService.title.trim(),
        featuredImage: featuredImageUrl
      };

      // Add document and get the reference
      const docRef = await addDoc(collection(db, 'services'), serviceData);

      // Update the document to include its own ID as a field
      await updateDoc(docRef, {
        id: docRef.id
      });

      // Reset form and refresh services
      setNewService({ title: '', featuredImage: '' });
      setImageFile(null);
      setShowAddModal(false);
      fetchServices();

    } catch (error) {
      console.error('Error adding service:', error);
      setError(error instanceof Error ? error.message : 'Failed to add service');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteService = (service: GlobalService) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;

    try {
      await deleteDoc(doc(db, 'services', serviceToDelete.id));
      fetchServices();
      setShowDeleteModal(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error('Error deleting service:', error);
      setError('Failed to delete service');
    }
  };

  const cancelDeleteService = () => {
    setShowDeleteModal(false);
    setServiceToDelete(null);
  };

  const handleEditService = (service: GlobalService) => {
    setEditingService(service);
    setNewService({ title: service.title, featuredImage: service.featuredImage });
    setImageFile(null);
    setShowEditModal(true);
  };

  const handleUpdateService = async () => {
    if (!editingService || !newService.title.trim()) {
      setError('Service title is required');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      let featuredImageUrl = editingService.featuredImage;

      // Upload new image if provided
      if (imageFile) {
        const storageRef = ref(storage, `services/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        featuredImageUrl = await getDownloadURL(snapshot.ref);
      }

      // Update service in Firestore
      await updateDoc(doc(db, 'services', editingService.id), {
        title: newService.title.trim(),
        featuredImage: featuredImageUrl
      });

      // Reset form and refresh services
      setNewService({ title: '', featuredImage: '' });
      setEditingService(null);
      setImageFile(null);
      setShowEditModal(false);
      fetchServices();

    } catch (error) {
      console.error('Error updating service:', error);
      setError(error instanceof Error ? error.message : 'Failed to update service');
    } finally {
      setIsUploading(false);
    }
  };

  const cancelEditService = () => {
    setShowEditModal(false);
    setEditingService(null);
    setNewService({ title: '', featuredImage: '' });
    setImageFile(null);
    setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewService(prev => ({ ...prev, featuredImage: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              Global Services Management
            </h1>
            <p className="text-gray-600">
              Add and manage global services available to all barbershops
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Service
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {error}
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">Global Services ({services.length})</h2>
        </div>
        <div className="p-6">
          {services.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-cut text-gray-400 text-xl"></i>
              </div>
              <p className="text-gray-600">No services added yet</p>
              <p className="text-gray-500 text-sm">Click "Add Service" to create your first global service</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {service.featuredImage ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden mb-3">
                          <img
                            src={service.featuredImage}
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                          <i className="fas fa-cut text-gray-400"></i>
                        </div>
                      )}
                      <h3 className="font-semibold text-black">{service.title}</h3>
                      <p className="text-sm text-gray-500">ID: {service.id}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditService(service)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit service"
                      >
                        <i className="fas fa-edit text-sm"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteService(service)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete service"
                      >
                        <i className="fas fa-trash text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">Add New Service</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewService({ title: '', featuredImage: '' });
                  setImageFile(null);
                  setError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-4">
              {/* Service Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={newService.title}
                  onChange={(e) => setNewService(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter service title"
                  required
                />
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                {newService.featuredImage && (
                  <div className="mt-2">
                    <img
                      src={newService.featuredImage}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewService({ title: '', featuredImage: '' });
                    setImageFile(null);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddService}
                  disabled={isUploading || !newService.title.trim()}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 transition-colors"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    'Add Service'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditModal && editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">Edit Service</h3>
              <button
                onClick={cancelEditService}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-4">
              {/* Service Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={newService.title}
                  onChange={(e) => setNewService(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter service title"
                  required
                />
              </div>

              {/* Current Image */}
              {editingService.featuredImage && !imageFile && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Image
                  </label>
                  <div className="mb-2">
                    <img
                      src={editingService.featuredImage}
                      alt="Current service image"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {editingService.featuredImage ? 'Replace Image' : 'Featured Image'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                {newService.featuredImage && imageFile && (
                  <div className="mt-2">
                    <img
                      src={newService.featuredImage}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={cancelEditService}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateService}
                  disabled={isUploading || !newService.title.trim()}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 transition-colors"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Service'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && serviceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">Delete Service</h3>
              <button
                onClick={cancelDeleteService}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                </div>
                <div>
                  <p className="text-gray-900 font-medium">Are you sure you want to delete this service?</p>
                  <p className="text-gray-600 text-sm">This action cannot be undone.</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  {serviceToDelete.featuredImage ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden mr-3">
                      <img
                        src={serviceToDelete.featuredImage}
                        alt={serviceToDelete.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                      <i className="fas fa-cut text-gray-400"></i>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{serviceToDelete.title}</p>
                    <p className="text-sm text-gray-500">ID: {serviceToDelete.id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={cancelDeleteService}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteService}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
