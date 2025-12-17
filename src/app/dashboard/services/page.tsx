'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth, db } from '../../../lib/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  setDoc
} from 'firebase/firestore';
import type { Service, Style, StylesMap, GlobalService } from '../../../types/services';
import {
  ServiceModal,
  StyleModal,
  StylePreviewModal,
  SearchBar,
  StyleGrid,
  ConfirmationModal
} from './components';
import { useBarbershopServices } from '../../../lib/hooks/useBarbershopServices';

const emptyService: Service = {
  id: '',
  title: '',
  description: '',
  price: 0,
  duration: 0,
  featuredImage: null,
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
  const router = useRouter();

  const {
    services,
    styles,
    loading,
    error: serviceError,
    fetchServices,
    fetchStyles,
    updateServices,
    deleteStyle
  } = useBarbershopServices();

  const [barbershopId, setBarbershopId] = useState<string | null>(null);
  const [globalServices, setGlobalServices] = useState<GlobalService[]>([]);
  const [error, setError] = useState<string | null>(serviceError);

  const [searchTerm, setSearchTerm] = useState('');

  // modal states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showStylePreview, setShowStylePreview] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRemoveServiceConfirmation, setShowRemoveServiceConfirmation] = useState(false);

  // editing states
  const [isEditingService, setIsEditingService] = useState(false);
  const [isEditingStyle, setIsEditingStyle] = useState(false);

  // current item states
  const [currentService, setCurrentService] = useState<Service>(emptyService);
  const [currentStyle, setCurrentStyle] = useState<Style>(emptyStyle);
  const [serviceToRemove, setServiceToRemove] = useState<Service | null>(null);

  // confirmation states
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationAction, setConfirmationAction] = useState<() => Promise<void>>(
    () => Promise.resolve()
  );

  // convert styles to map structure
  const stylesMap: StylesMap = styles.reduce((map, style) => {
    if (!map[style.serviceId]) map[style.serviceId] = [];
    map[style.serviceId].push(style);
    return map;
  }, {} as StylesMap);

  const urlParamsProcessed = useRef(false);

  // clear url parameters
  const clearUrlParams = () => {
    router.push('/dashboard/services', { scroll: false });
  };

  // handle url query parameters
  useEffect(() => {
    const newStyleServiceId = searchParams.get('newStyle');
    const editStyleId = searchParams.get('editStyle');
    const editServiceId = searchParams.get('edit');

    // process url params once
    if (
      !urlParamsProcessed.current &&
      (newStyleServiceId || editStyleId || editServiceId)
    ) {
      if (newStyleServiceId) {
        const service = services.find(s => s.id === newStyleServiceId);
        if (service) {
          handleAddStyle(newStyleServiceId);
          urlParamsProcessed.current = true;
        }
      } else if (editStyleId) {
        for (let serviceId in stylesMap) {
          const style = stylesMap[serviceId].find(s => s.styleId === editStyleId);
          if (style) {
            handleEditStyle(style);
            urlParamsProcessed.current = true;
            break;
          }
        }
      } else if (editServiceId) {
        const service = services.find(s => s.id === editServiceId);
        if (service) {
          handleEditService(service);
          urlParamsProcessed.current = true;
        }
      }
    }

    // reset flag when cleared
    if (!newStyleServiceId && !editStyleId && !editServiceId) {
      urlParamsProcessed.current = false;
    }
  }, [searchParams, services, stylesMap]); 

  // fetch barbershop services
  useEffect(() => {
    const fetchData = async () => {
      setError(null);

      if (user) {
        console.log('Fetching services for user:', user.uid);
        setBarbershopId(user.uid);
        await fetchServices(user.uid);
        await fetchStyles(user.uid);
      } else {
        console.log('No user found');
      }
      await fetchGlobalServices();
    };

    fetchData();
  }, [user, fetchServices, fetchStyles]);

  const fetchGlobalServices = async () => {
    try {
      const servicesCollection = collection(db, 'services');
      const snapshot = await getDocs(servicesCollection);
      let servicesData: GlobalService[] = [];

      snapshot.forEach(docSnap => {
        servicesData.push({ id: docSnap.id, ...docSnap.data() } as GlobalService);
      });

      setGlobalServices(servicesData);
    } catch (error) {
      console.error('Error fetching global services:', error);
    }
  };

  const filteredAddedServices = services.filter(service =>
    service && service.title && service.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveService = async (service: Service) => {
    if (!user || !barbershopId) {
      setError('You must be logged in to perform this action.');
      return;
    }

    try {
      // get global service details
      const globalService = globalServices.find(s => s.id === service.serviceCategoryId);
      if (!globalService) {
        setError('Global service not found.');
        return;
      }

      let updatedServices;

      if (isEditingService && service.id) {
        // update existing service
        updatedServices = services.map(s =>
          s.id === service.id
            ? {
                ...s,
                title: globalService.title,
                featuredImage: globalService.featuredImage,
                serviceCategoryId: service.serviceCategoryId,
                status: service.status || 'Available'
              }
            : s
        );
      } else {
        // create new service
        const newServiceId = `service_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        const newService: Service = {
          id: newServiceId,
          title: globalService.title,
          featuredImage: globalService.featuredImage,
          serviceCategoryId: service.serviceCategoryId,
          status: 'Available'
        };
        updatedServices = [...services, newService];
      }

      const success = await updateServices(barbershopId, updatedServices);
      if (success) {
        setShowServiceModal(false);
        setCurrentService(emptyService);
        setIsEditingService(false);
      } else {
        setError('Failed to save service. Please try again.');
      }
    } catch (err) {
      console.error('Error saving service:', err);
      setError('Failed to save service. Please try again.');
    }
  };

  const handleRemoveService = (service: Service) => {
    setServiceToRemove(service);
    setShowRemoveServiceConfirmation(true);
  };

  const confirmRemoveService = async () => {
    if (!serviceToRemove || !user || !barbershopId) {
      setError('You must be logged in to perform this action.');
      return;
    }

    try {
      const updatedServices = services.filter(s => s.id !== serviceToRemove.id);
      const success = await updateServices(barbershopId, updatedServices);
      if (!success) {
        setError('Failed to remove service. Please try again.');
      } else {
        setShowRemoveServiceConfirmation(false);
        setServiceToRemove(null);
      }
    } catch (err) {
      console.error('Error removing service:', err);
      setError('Failed to save service. Please try again.');
    }
  };

  const handleSaveStyle = async (style: Style) => {
    if (!user || !barbershopId) {
      setError('You must be logged in to perform this action.');
      return;
    }

    try {
      if (isEditingStyle && style.docId) {
        const docRef = doc(db, 'styles', style.docId);

        await updateDoc(docRef, {
          styleId: style.docId, 
          styleName: style.styleName,
          description: style.description,
          price: style.price,
          duration: style.duration,
          featuredImage: style.featuredImage,
          serviceId: style.serviceId,
          serviceCategoryId: style.serviceCategoryId,
          barberOrBarbershop: barbershopId,
          type: 'barbershop'
        });
      }
      else {
        const stylesCol = collection(db, 'styles');
        const newDocRef = doc(stylesCol); 

        const newStyle: Style = {
          styleId: newDocRef.id,
          styleName: style.styleName,
          description: style.description,
          price: style.price,
          duration: style.duration,
          featuredImage: style.featuredImage,
          serviceId: style.serviceId,
          serviceCategoryId: style.serviceCategoryId,
          barberOrBarbershop: barbershopId,
          type: 'barbershop',
          docId: newDocRef.id
        };

        await setDoc(newDocRef, newStyle);
      }

      // refresh styles
      await fetchStyles(barbershopId);

      // reset state
      setIsEditingStyle(false);
      setShowStyleModal(false);
      setCurrentStyle(emptyStyle);
    } catch (err) {
      console.error('Error saving style:', err);
      setError('Failed to save style. Please try again.');
    }
  };

  const handleDeleteStyle = (styleId: string) => {
    if (!styleId || !barbershopId) return;

    setConfirmationTitle('Delete Style');
    setConfirmationMessage('This will permanently delete this style. This action cannot be undone.');

    const deleteAction = async () => {
      try {
        const stylesCollection = collection(db, 'styles');
        const q = query(
          stylesCollection,
          where('styleId', '==', styleId),
          where('barberOrBarbershop', '==', barbershopId)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const styleDoc = querySnapshot.docs[0];
          const success = await deleteStyle(styleDoc.id);

          if (success) {
            setShowStylePreview(false);
            setError(null);
          } else {
            setError('Failed to delete style. Please try again.');
          }
        } else {
          setError('Style not found.');
        }
      } catch (err) {
        console.error('Error deleting style:', err);
        setError('Failed to delete style. Please try again.');
      }
    };

    setConfirmationAction(() => deleteAction);
    setShowConfirmation(true);
  };

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

  // close modal helpers
  const closeServiceModal = () => {
    clearUrlParams();
    setShowServiceModal(false);
    setCurrentService(emptyService);
    setIsEditingService(false);
  };

  const closeStyleModal = () => {
    clearUrlParams();
    setShowStyleModal(false);
    setCurrentStyle(emptyStyle);
    setIsEditingStyle(false);
  };

  const closeStylePreview = () => {
    setShowStylePreview(false);
    clearUrlParams();
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

          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-semibold text-gray-950">Your Services</h1>
                  <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {filteredAddedServices.length}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  Manage your barbershop services and styles
                </p>
              </div>
            </div>

            {filteredAddedServices.length > 0 ? (
              <div className="space-y-3">
                {filteredAddedServices.map((service: Service) => (
                  <div
                    key={service.id}
                    className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-150"
                  >
                    <div className="flex items-center gap-4 px-6 py-4">
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-100 overflow-hidden">
                        {service.featuredImage ? (
                          <img
                            src={service.featuredImage}
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <i className="fas fa-cut text-lg text-gray-300"></i>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-semibold text-gray-900">{service.title}</h3>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              service.status === 'Available'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-yellow-50 text-yellow-700'
                            }`}
                          >
                            {service.status || 'Available'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>
                            {(stylesMap[service.id] || []).length} style
                            {(stylesMap[service.id] || []).length !== 1 ? 's' : ''}
                          </span>

                          {(stylesMap[service.id] || []).length > 0 && (
                            <>
                              <span>•</span>
                              <span>
                                {stylesMap[service.id][0].styleName} • ₱
                                {stylesMap[service.id][0].price}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAddStyle(service.id)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          title="Add Style"
                        >
                          <i className="fas fa-plus text-sm"></i>
                        </button>

                        <button
                          onClick={() => handleEditService(service)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <i className="fas fa-pen text-sm"></i>
                        </button>

                        <a
                          href={`/dashboard/services/${service.id}`}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          title="View"
                        >
                          <i className="fas fa-arrow-right text-sm"></i>
                        </a>

                        <button
                          onClick={() => handleRemoveService(service)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <i className="fas fa-trash text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 border border-gray-200">
                <i className="fas fa-inbox text-4xl text-gray-300 mb-4 block"></i>
                <p className="text-gray-600 font-medium">No services yet</p>
                <p className="text-gray-500 text-sm mt-1 mb-2">
                  Add your first service to start offering styles
                </p>
                <p className="text-gray-400 text-xs mb-6">
                  Services help organize your styles and pricing
                </p>
                <button
                  onClick={handleAddService}
                  className="inline-block bg-gray-950 hover:bg-gray-800 text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors"
                >
                  + Add Service
                </button>
              </div>
            )}
          </div>

          <ServiceModal
            isOpen={showServiceModal}
            onClose={closeServiceModal}
            onSave={handleSaveService}
            initialService={currentService}
            isEditing={isEditingService}
            existingServices={services}
          />

          <StyleModal
            isOpen={showStyleModal}
            onClose={closeStyleModal}
            onSave={handleSaveStyle}
            initialStyle={currentStyle}
            isEditing={isEditingStyle}
            services={services}
          />

          <StylePreviewModal
            isOpen={showStylePreview}
            onClose={closeStylePreview}
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
            onConfirm={async () => {
              await confirmationAction();
              setShowConfirmation(false);
            }}
            title={confirmationTitle}
            message={confirmationMessage}
            confirmText="Delete"
            type="danger"
          />

          <ConfirmationModal
            isOpen={showRemoveServiceConfirmation}
            title="Delete Service"
            message={`Are you sure you want to delete "${serviceToRemove?.title}"? This action cannot be undone.`}
            confirmText="Delete"
            onClose={() => {
              setShowRemoveServiceConfirmation(false);
              setServiceToRemove(null);
            }}
            onConfirm={confirmRemoveService}
            type="danger"
          />
        </>
      )}
    </div>
  );
}
