'use client';

import React, { useState } from 'react';
import { addService, updateService, deleteService } from '../services/superAdminService';
import type { GlobalService } from '../../../types/services';
import { Modal } from './Modal';
import { ConfirmationModal } from './ConfirmationModal';
import { EmptyState } from './EmptyState';

interface ServicesTabProps {
  services: GlobalService[];
  onRefresh: () => Promise<void>;
}

const INITIAL_SERVICE = { title: '', featuredImage: '' };

export const ServicesTab = ({ services, onRefresh }: ServicesTabProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newService, setNewService] = useState(INITIAL_SERVICE);
  const [editingService, setEditingService] = useState<GlobalService | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<GlobalService | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateService = (): boolean => {
    if (!newService.title.trim()) {
      setError('Service title is required');
      return false;
    }
    return true;
  };

  const handleAddService = async () => {
    if (!validateService()) return;
    try {
      setIsLoading(true);
      setError(null);
      await addService(newService.title, imageFile);
      resetForm();
      setShowAddModal(false);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateService = async () => {
    if (!editingService || !validateService()) return;
    try {
      setIsLoading(true);
      setError(null);
      await updateService(editingService.id, newService.title, imageFile, editingService.featuredImage);
      resetForm();
      setEditingService(null);
      setShowEditModal(false);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteService(serviceToDelete.id);
      setShowDeleteModal(false);
      setServiceToDelete(null);
      await onRefresh();
    } catch (err) {
      setError('Failed to delete service');
    }
  };

  const resetForm = () => {
    setNewService(INITIAL_SERVICE);
    setImageFile(null);
    setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewService(prev => ({ ...prev, featuredImage: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditModal = (service: GlobalService) => {
    setEditingService(service);
    setNewService({ title: service.title, featuredImage: service.featuredImage });
    setShowEditModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Services</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 text-sm font-medium text-white rounded transition-colors flex items-center gap-2"
          style={{ backgroundColor: '#BF8F63' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A67C52'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#BF8F63'}
        >
          <i className="fas fa-plus text-xs"></i>
          Add
        </button>
      </div>

      {services.length === 0 ? (
        <EmptyState icon="fas fa-cut" title="No Services" description="No services added yet" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={() => openEditModal(service)}
              onDelete={() => {
                setServiceToDelete(service);
                setShowDeleteModal(true);
              }}
            />
          ))}
        </div>
      )}

      <ServiceFormModal
        isOpen={showAddModal}
        title="Add New Service"
        service={newService}
        error={error}
        isLoading={isLoading}
        onService={setNewService}
        onImageChange={handleImageChange}
        onSubmit={handleAddService}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      />

      <ServiceFormModal
        isOpen={showEditModal}
        title="Edit Service"
        service={newService}
        error={error}
        isLoading={isLoading}
        onService={setNewService}
        onImageChange={handleImageChange}
        onSubmit={handleUpdateService}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        serviceId={editingService?.id}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Service"
        message={`Are you sure you want to delete "${serviceToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous
        onConfirm={handleDeleteService}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

const ServiceCard = ({
  service,
  onEdit,
  onDelete
}: {
  service: GlobalService;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div className="bg-white border border-gray-200 rounded p-3 hover:shadow-sm transition-shadow">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0">
        {service.featuredImage ? (
          <div className="w-12 h-12 rounded overflow-hidden">
            <img src={service.featuredImage} alt={service.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
            <i className="fas fa-cut text-gray-400 text-sm"></i>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 text-sm">{service.title}</h3>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button onClick={onEdit} className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
          <i className="fas fa-edit text-xs"></i>
        </button>
        <button onClick={onDelete} className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
          <i className="fas fa-trash text-xs"></i>
        </button>
      </div>
    </div>
  </div>
);

const ServiceFormModal = ({
  isOpen,
  title,
  service,
  error,
  isLoading,
  onService,
  onImageChange,
  onSubmit,
  onClose,
  serviceId
}: {
  isOpen: boolean;
  title: string;
  service: { title: string; featuredImage: string };
  error: string | null;
  isLoading: boolean;
  onService: (service: { title: string; featuredImage: string }) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onClose: () => void;
  serviceId?: string;
}) => (
  <Modal isOpen={isOpen} title={title} onClose={onClose}>
    {error && <div className="bg-red-50 text-red-800 px-2 py-1.5 rounded mb-3 text-xs">{error}</div>}
    <div className="space-y-3">
      {serviceId && (
        <div className="bg-gray-50 p-2 rounded border border-gray-200">
          <p className="text-xs text-gray-600 mb-0.5">ID</p>
          <p className="text-xs font-mono text-gray-900 break-all">{serviceId}</p>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Service Name</label>
        <input
          type="text"
          placeholder="e.g., Haircuts"
          value={service.title}
          onChange={(e) => onService({ ...service, title: e.target.value })}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Featured Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
        />
        {service.featuredImage && (
          <img src={service.featuredImage} alt="Preview" className="mt-1.5 w-full h-24 object-cover rounded" />
        )}
      </div>
      <div className="flex space-x-2 pt-3">
        <button
          onClick={onClose}
          className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="flex-1 px-3 py-1.5 text-white rounded text-sm transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#BF8F63' }}
          onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#A67C52')}
          onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#BF8F63')}
        >
          {isLoading ? 'Processing...' : 'Save'}
        </button>
      </div>
    </div>
  </Modal>
);

