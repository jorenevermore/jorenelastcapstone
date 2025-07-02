'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useSearchParams } from 'next/navigation';
import { auth, db } from '../../../lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc
} from 'firebase/firestore';
import { Service, Style, StylesMap, GlobalService } from './types';
import {
  ServiceModal,
  StyleModal,
  StylePreviewModal,
  SearchBar,
  StyleGrid,
  ConfirmationModal
} from './components';

const emptyService: Service = {
  id: '',
  title: '',
  featuredImage: null,
  status: 'Available',
  serviceCategoryId: ''
};

const emptyStyle: Style = {
  styleId: '',
  styleName: '',
  description: '',
  price: 0,
  duration: 1,
  featuredImage: null,
  serviceId: '',
  serviceCategoryId: '',
  barberOrBarbershop: '',
  type: 'barbershop',
  docId: undefined
};

export default function ServicesPage() {
  const [user] = useAuthState(auth);
  const searchParams = useSearchParams();
  const [barbershopId, setBarbershopId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [stylesMap, setStylesMap] = useState<StylesMap>({});
  const [globalServices, setGlobalServices] = useState<GlobalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showStylePreview, setShowStylePreview] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  const [isEditingStyle, setIsEditingStyle] = useState(false);
  const [currentService, setCurrentService] = useState<Service>(emptyService);
  const [currentStyle, setCurrentStyle] = useState<Style>(emptyStyle);

  // Confirmation modal states
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationAction, setConfirmationAction] = useState<() => Promise<void>>(() => Promise.resolve());
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Handle URL query parameters
  useEffect(() => {
    const newStyleServiceId = searchParams.get('newStyle');
    const editStyleId = searchParams.get('editStyle');
    const editServiceId = searchParams.get('edit');

    if (newStyleServiceId) {
      // Find the service and open the add style modal
      const service = services.find(s => s.id === newStyleServiceId);
      if (service) {
        handleAddStyle(newStyleServiceId);
      }
    } else if (editStyleId) {
      // Find the style and open the edit style modal
      for (const serviceId in stylesMap) {
        const style = stylesMap[serviceId].find(s => s.styleId === editStyleId);
        if (style) {
          handleEditStyle(style);
          break;
        }
      }
    } else if (editServiceId) {
      // Find the service and open the edit service modal
      const service = services.find(s => s.id === editServiceId);
      if (service) {
        handleEditService(service);
      }
    }
  }, [searchParams, services, stylesMap]);

  // Fetch barbershop and services
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (user) {
          // Fetch barbershop
          const barbershopDoc = await getDoc(doc(db, 'barbershops', user.uid));
          if (barbershopDoc.exists()) {
            const shopId = barbershopDoc.id;
            setBarbershopId(shopId);

            // Get services
            const servicesArray = barbershopDoc.data().services || [];
            setServices(servicesArray);

            // Fetch styles
            await fetchStyles(shopId);
          } else {
            setError('Barbershop not found. Please complete your profile setup.');
          }
        }

        // Fetch global services
        await fetchGlobalServices();
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Fetch styles for the barbershop
  const fetchStyles = async (shopId: string) => {
    try {
      const q = query(collection(db, 'styles'), where('barberOrBarbershop', '==', shopId));
      const querySnapshot = await getDocs(q);
      const map: StylesMap = {};

      querySnapshot.forEach(doc => {
        const style = doc.data() as Style;
        if (!map[style.serviceId]) map[style.serviceId] = [];
        map[style.serviceId].push({ ...style, docId: doc.id });
      });

      setStylesMap(map);
    } catch (err) {
      console.error('Error fetching styles:', err);
      setError('Failed to load styles. Please try again.');
    }
  };

  // Fetch global services from the services collection
  const fetchGlobalServices = async () => {
    try {
      const servicesCollection = collection(db, 'services');
      const snapshot = await getDocs(servicesCollection);
      const servicesData: GlobalService[] = [];

      snapshot.forEach(doc => {
        servicesData.push({ id: doc.id, ...doc.data() } as GlobalService);
      });

      setGlobalServices(servicesData);
    } catch (error) {
      console.error('Error fetching global services:', error);
      // Don't set error here as it's not critical for the main functionality
    }
  };

  // Helper function to get global service name by ID
  const getGlobalServiceName = (serviceCategoryId: string): string => {
    const globalService = globalServices.find(gs => gs.id === serviceCategoryId);
    return globalService ? globalService.title : 'Unknown Category';
  };

  // Filter services based on search term
  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Service CRUD operations
  const handleSaveService = async (service: Service) => {
    if (!user || !barbershopId) {
      setError('You must be logged in to perform this action.');
      return;
    }

    try {
      const barbershopRef = doc(db, 'barbershops', barbershopId);

      // Create a new service object
      const newService: Service = {
        id: isEditingService ? service.id : `service_${Date.now()}`,
        title: service.title,
        status: service.status,
        featuredImage: service.featuredImage,
        serviceCategoryId: service.serviceCategoryId
      };

      // Update the services array
      const updatedServices = isEditingService
        ? services.map(s => s.id === service.id ? newService : s)
        : [...services, newService];

      // Update the barbershop document
      await updateDoc(barbershopRef, { services: updatedServices });

      // Update local state
      setServices(updatedServices);
      setIsEditingService(false);
      setShowServiceModal(false);
      setCurrentService(emptyService);
    } catch (err) {
      console.error('Error saving service:', err);
      setError('Failed to save service. Please try again.');
    }
  };

  const handleDeleteService = (serviceId: string) => {
    if (!user || !barbershopId) {
      setError('You must be logged in to perform this action.');
      return;
    }

    setItemToDelete(serviceId);
    setConfirmationTitle('Delete Service');
    setConfirmationMessage('This will permanently delete this service and all associated styles. This action cannot be undone.');
    setConfirmationAction(() => async () => {
      try {
        // Delete all styles associated with this service
        const stylesToDelete = stylesMap[serviceId] || [];
        for (const style of stylesToDelete) {
          if (style.docId) {
            await deleteDoc(doc(db, 'styles', style.docId));
          }
        }

        // Update the services array
        const updatedServices = services.filter(s => s.id !== serviceId);

        // Update the barbershop document
        await updateDoc(doc(db, 'barbershops', barbershopId), { services: updatedServices });

        // Update local state
        setServices(updatedServices);

        // Update styles map
        const newStylesMap = { ...stylesMap };
        delete newStylesMap[serviceId];
        setStylesMap(newStylesMap);

        // Close any open modals
        if (expandedService === serviceId) {
          setExpandedService(null);
        }
      } catch (err) {
        console.error('Error deleting service:', err);
        setError('Failed to delete service. Please try again.');
      }
    });
    setShowConfirmation(true);
  };

  // Style CRUD operations
  const handleSaveStyle = async (style: Style) => {
    if (!user || !barbershopId) {
      setError('You must be logged in to perform this action.');
      return;
    }

    try {
      // Create a new style object
      const newStyle: Style = {
        styleId: isEditingStyle ? style.styleId : `style_${Date.now()}`,
        styleName: style.styleName,
        description: style.description,
        price: style.price,
        duration: style.duration,
        featuredImage: style.featuredImage,
        serviceId: style.serviceId,
        serviceCategoryId: style.serviceCategoryId,
        barberOrBarbershop: barbershopId,
        type: 'barbershop'
      };



      if (isEditingStyle && style.docId) {
        // Update existing style
        await updateDoc(doc(db, 'styles', style.docId), {
          styleId: newStyle.styleId,
          styleName: newStyle.styleName,
          description: newStyle.description,
          price: newStyle.price,
          duration: newStyle.duration,
          featuredImage: newStyle.featuredImage,
          serviceId: newStyle.serviceId,
          serviceCategoryId: newStyle.serviceCategoryId,
          barberOrBarbershop: newStyle.barberOrBarbershop,
          type: newStyle.type
        });
      } else {
        // Add new style
        await addDoc(collection(db, 'styles'), newStyle);
      }

      // Refresh styles
      await fetchStyles(barbershopId);

      // Reset state
      setIsEditingStyle(false);
      setShowStyleModal(false);
      setCurrentStyle(emptyStyle);
    } catch (err) {
      console.error('Error saving style:', err);
      setError('Failed to save style. Please try again.');
    }
  };

  const handleDeleteStyle = (styleId: string) => {
    if (!styleId) return;

    setItemToDelete(styleId);
    setConfirmationTitle('Delete Style');
    setConfirmationMessage('This will permanently delete this style. This action cannot be undone.');
    setConfirmationAction(() => async () => {
      try {
        // Find the style document with the matching styleId
        const stylesCollection = collection(db, 'styles');
        const q = query(
          stylesCollection,
          where('styleId', '==', styleId),
          where('barberOrBarbershop', '==', barbershopId)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Delete the style document
          const styleDoc = querySnapshot.docs[0];
          await deleteDoc(doc(db, 'styles', styleDoc.id));

          // Refresh styles
          if (barbershopId) {
            await fetchStyles(barbershopId);
          }
        }

        // Close preview modal if open
        setShowStylePreview(false);
      } catch (err) {
        console.error('Error deleting style:', err);
        setError('Failed to delete style. Please try again.');
      }
    });
    setShowConfirmation(true);
  };

  // UI handlers
  const handleAddService = () => {
    setCurrentService(emptyService);
    setIsEditingService(false);
    setShowServiceModal(true);
  };

  const handleEditService = (service: Service) => {
    setCurrentService(service);
    setIsEditingService(true);
    setShowServiceModal(true);
  };

  const handleAddStyle = (serviceId?: string) => {
    const service = services.find(s => s.id === serviceId);
    const newStyle: Style = {
      ...emptyStyle,
      serviceId: serviceId || '',
      serviceCategoryId: service?.serviceCategoryId || '',
      barberOrBarbershop: barbershopId || ''
    };



    setCurrentStyle(newStyle);
    setIsEditingStyle(false);
    setShowStyleModal(true);
  };

  const handleEditStyle = (style: Style) => {
    setCurrentStyle(style);
    setIsEditingStyle(true);
    setShowStyleModal(true);
  };

  return (
    <div className="p-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-2"></div>
          <p>Loading services...</p>
        </div>
      ) : (
        <>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddService={handleAddService}
            onAddStyle={handleAddStyle}
          />

          {filteredServices.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'} Available
                </h3>
                <div className="flex space-x-2">
                  <button
                    className={`p-2 rounded-md ${expandedService ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setExpandedService(expandedService ? null : filteredServices[0]?.id)}
                    title={expandedService ? "Collapse all" : "Expand all"}
                  >
                    <i className={`fas ${expandedService ? 'fa-compress-alt' : 'fa-expand-alt'}`}></i>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map(service => (
                  <div
                    key={service.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center p-4 border-b border-gray-100">
                      {service.featuredImage ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={service.featuredImage}
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-cut text-xl text-gray-400"></i>
                        </div>
                      )}

                      <div className="ml-3 flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900 truncate">{service.title}</h3>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                            <i className="fas fa-tag mr-1"></i>
                            {getGlobalServiceName(service.serviceCategoryId)}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                            ${service.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            <i className={`${service.status === 'Available' ? 'fas fa-check-circle' : 'fas fa-times-circle'} mr-1 text-xs`}></i>
                            {service.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          onClick={() => handleEditService(service)}
                          title="Edit Service"
                        >
                          <i className="fas fa-edit text-xs"></i>
                        </button>
                        <button
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          onClick={() => handleDeleteService(service.id)}
                          title="Delete Service"
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-sm text-gray-500">
                          <i className="fas fa-layer-group mr-1.5 text-gray-400"></i>
                          {(stylesMap[service.id] || []).length} {(stylesMap[service.id] || []).length === 1 ? 'style' : 'styles'}
                        </div>
                        <button
                          onClick={() => handleAddStyle(service.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          <i className="fas fa-plus mr-1"></i> Add Style
                        </button>
                      </div>

                      {(stylesMap[service.id] || []).length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {(stylesMap[service.id] || []).slice(0, 4).map(style => (
                            <div
                              key={style.styleId}
                              className="text-xs p-2 bg-gray-50 rounded border border-gray-100 flex justify-between items-center"
                              onClick={() => handleEditStyle(style)}
                            >
                              <span className="truncate">{style.styleName}</span>
                              <span className="font-medium">₱{style.price}</span>
                            </div>
                          ))}
                          {(stylesMap[service.id] || []).length > 4 && (
                            <div className="text-xs p-2 bg-gray-50 rounded border border-gray-100 text-center text-gray-500">
                              +{(stylesMap[service.id] || []).length - 4} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-center py-3 text-gray-500 bg-gray-50 rounded">
                          No styles added yet
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                      <a
                        href={`/dashboard/services/${service.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center"
                      >
                        View Details <i className="fas fa-chevron-right ml-1 text-xs"></i>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center border border-gray-100">
              <div className="max-w-md mx-auto">
                <div className="text-4xl mb-3 text-gray-300"><i className="fas fa-cut"></i></div>
                <h3 className="text-lg font-medium mb-2 text-gray-800">No services found</h3>
                <p className="text-sm text-gray-500 mb-4">Add your first service to start managing your barbershop offerings</p>
                <button
                  onClick={handleAddService}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors inline-flex items-center text-sm"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Your First Service
                </button>
              </div>
            </div>
          )}

          {/* Modals */}
          <ServiceModal
            isOpen={showServiceModal}
            onClose={() => setShowServiceModal(false)}
            onSave={handleSaveService}
            initialService={currentService}
            isEditing={isEditingService}
            existingServices={services}
          />

          <StyleModal
            isOpen={showStyleModal}
            onClose={() => setShowStyleModal(false)}
            onSave={handleSaveStyle}
            initialStyle={currentStyle}
            isEditing={isEditingStyle}
            services={services}
          />

          <StylePreviewModal
            isOpen={showStylePreview}
            onClose={() => setShowStylePreview(false)}
            style={currentStyle}
            onEdit={() => {
              setShowStylePreview(false);
              setIsEditingStyle(true);
              setShowStyleModal(true);
            }}
            onDelete={() => {
              if (currentStyle.styleId) {
                handleDeleteStyle(currentStyle.styleId);
              }
            }}
          />

          <ConfirmationModal
            isOpen={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            onConfirm={() => confirmationAction()}
            title={confirmationTitle}
            message={confirmationMessage}
            confirmText="Delete"
            type="danger"
          />
        </>
      )}
    </div>
  );
}
