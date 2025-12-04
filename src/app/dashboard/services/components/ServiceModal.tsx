'use client';

import React, { useState, useEffect } from 'react';
import { Service, GlobalService } from '../types';
import { db } from '../../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Service) => Promise<void>;
  initialService: Service;
  isEditing: boolean;
  existingServices: Service[]; // Current barbershop's services to filter out duplicates
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialService,
  isEditing,
  existingServices
}) => {
  const [service, setService] = useState<Service>(initialService);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [globalServices, setGlobalServices] = useState<GlobalService[]>([]);
  const [loadingGlobalServices, setLoadingGlobalServices] = useState(false);

  useEffect(() => {
    setService(initialService);
    setError(null);

    // Fetch global services when modal opens
    if (isOpen) {
      fetchGlobalServices();
    }
  }, [initialService, isOpen]);

  const fetchGlobalServices = async () => {
    try {
      setLoadingGlobalServices(true);
      const servicesCollection = collection(db, 'services');
      const snapshot = await getDocs(servicesCollection);
      let servicesData: GlobalService[] = [];

      snapshot.forEach(doc => {
        servicesData.push({ id: doc.id, ...doc.data() } as GlobalService);
      });

      setGlobalServices(servicesData);
    } catch (error) {
      console.error('Error fetching global services:', error);
      setError('Failed to fetch global services');
    } finally {
      setLoadingGlobalServices(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'serviceCategoryId') {
      // When service category is selected, auto-fill other fields
      const selectedGlobalService = globalServices.find(gs => gs.id === value);
      if (selectedGlobalService) {
        setService(prev => ({
          ...prev,
          serviceCategoryId: value,
          title: selectedGlobalService.title,
          featuredImage: selectedGlobalService.featuredImage
        }));
      } else {
        setService(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setService(prev => ({ ...prev, [name]: value }));
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!service.serviceCategoryId.trim()) {
      setError('Please select a service category');
      return;
    }

    try {
      setIsUploading(true);

      // Service data comes from selected global service
      await onSave(service);
      onClose();
    } catch (err) {
      console.error('Error saving service:', err);
      setError('Failed to save service. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded shadow-lg max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-base font-semibold text-gray-900">
            {isEditing ? 'Edit Service' : 'Add Service'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-4 py-4 max-h-[70vh] overflow-y-auto space-y-3">
            {error && (
              <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-start gap-2">
                <i className="fas fa-exclamation-circle mt-0.5 flex-shrink-0"></i>
                <p>{error}</p>
              </div>
            )}

            {/* Service Category Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Service <span className="text-red-500">*</span>
              </label>
              {loadingGlobalServices ? (
                <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-500 text-sm flex items-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  Loading services...
                </div>
              ) : (
                <select
                  name="serviceCategoryId"
                  value={service.serviceCategoryId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a service</option>
                  {globalServices.map((globalService) => {
                    const isAlreadyUsed = existingServices.some(existingService =>
                      existingService.serviceCategoryId === globalService.id
                    );
                    const isCurrentService = isEditing && globalService.id === initialService.serviceCategoryId;
                    const isDisabled = isAlreadyUsed && !isCurrentService;

                    return (
                      <option
                        key={globalService.id}
                        value={globalService.id}
                        disabled={isDisabled}
                      >
                        {globalService.title}{isDisabled ? ' (Already Added)' : ''}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Show selected service details */}
            {service.serviceCategoryId && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                  Selected Service
                </h4>
                <div className="flex items-center space-x-3">
                  {service.featuredImage && (
                    <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={service.featuredImage}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{service.title}</p>
                    <p className="text-xs text-gray-600 flex items-center mt-0.5">
                      <i className="fas fa-globe text-blue-500 mr-1"></i>
                      Global service
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Availability Toggle Switch */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <button
                type="button"
                onClick={() => setService({ ...service, status: service.status === 'Available' ? 'Unavailable' : 'Available' })}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  service.status === 'Available' ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    service.status === 'Available' ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              <p className="text-xs text-gray-500 mt-1">
                {service.status === 'Available' ? '✓ Available' : '✗ Unavailable'}
              </p>
            </div>


          </div>

          <div className="px-4 py-3 bg-gray-50 flex justify-end gap-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-white rounded text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              style={{ backgroundColor: '#BF8F63' }}
              onMouseEnter={(e) => !isUploading && (e.currentTarget.style.backgroundColor = '#A67C52')}
              onMouseLeave={(e) => !isUploading && (e.currentTarget.style.backgroundColor = '#BF8F63')}
              disabled={isUploading || (!isEditing && !globalServices.some(globalService =>
                !existingServices.some(existingService =>
                  existingService.serviceCategoryId === globalService.id
                )
              ))}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving
                </>
              ) : (
                <>
                  <i className="fas fa-save text-xs"></i>
                  {isEditing ? 'Update' : 'Save'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;
