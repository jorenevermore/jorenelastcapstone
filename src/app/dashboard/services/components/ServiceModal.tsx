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
      const servicesData: GlobalService[] = [];

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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Service' : 'Add New Service'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
                <i className="fas fa-exclamation-circle mt-0.5 mr-3 text-red-500"></i>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Service Category <span className="text-red-500">*</span>
              </label>
              {loadingGlobalServices ? (
                <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 flex items-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Loading global services...
                </div>
              ) : (
                <>
                  {(() => {
                    const hasAnyAvailableServices = globalServices.some(globalService => {
                      // When editing, allow the current service's category
                      if (isEditing && globalService.id === initialService.serviceCategoryId) {
                        return true;
                      }
                      // Check if this global service is not already used by this barbershop
                      return !existingServices.some(existingService =>
                        existingService.serviceCategoryId === globalService.id
                      );
                    });

                    return (
                      <select
                        name="serviceCategoryId"
                        value={service.serviceCategoryId}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none transition-all duration-200 ${
                          hasAnyAvailableServices
                            ? 'border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white'
                            : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!hasAnyAvailableServices}
                        required
                      >
                        <option value="">
                          {hasAnyAvailableServices
                            ? 'Select a service'
                            : 'No available service categories'
                          }
                        </option>
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
                              style={isDisabled ? { color: '#9CA3AF', backgroundColor: '#F9FAFB' } : {}}
                            >
                              {globalService.title}{isDisabled ? ' (Already Added)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    );
                  })()}

                  {!globalServices.some(globalService => {
                    if (isEditing && globalService.id === initialService.serviceCategoryId) {
                      return true;
                    }
                    return !existingServices.some(existingService =>
                      existingService.serviceCategoryId === globalService.id
                    );
                  }) && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-700 flex items-center">
                        <i className="fas fa-info-circle mr-2 text-amber-500"></i>
                        All available global services have been added to your barbershop. Disabled options show services already added.
                      </p>
                    </div>
                  )}
                </>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Choose from the global services.
              </p>
            </div>

            {/* Show selected service details */}
            {service.serviceCategoryId && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                  Selected Service Details
                </h4>
                <div className="flex items-center space-x-4">
                  {service.featuredImage && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                      <img
                        src={service.featuredImage}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-base">{service.title}</p>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <i className="fas fa-globe text-blue-500 mr-1 text-xs"></i>
                      Global service category
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={service.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white"
                >
                  <option value="Available">✅ Available</option>
                  <option value="Disabled">🚫 Disabled</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Set service availability for customers
              </p>
            </div>


          </div>

          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow-sm"
              disabled={isUploading || (!isEditing && !globalServices.some(globalService =>
                !existingServices.some(existingService =>
                  existingService.serviceCategoryId === globalService.id
                )
              ))}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  {isEditing ? 'Update Service' : 'Save Service'}
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
