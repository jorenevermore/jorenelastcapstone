'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import type { Service, Style} from '../../../../types/services';
import Link from 'next/link';
import { ConfirmationModal, StyleModal } from '../components';

export default function ServiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [user] = useAuthState(auth);
  const [service, setService] = useState<Service | null>(null);
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // confirmation modal states
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationAction, setConfirmationAction] = useState<() => Promise<void>>(() => Promise.resolve());
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // edit style modal states
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [isEditingStyle, setIsEditingStyle] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<Style | null>(null);

  // get the service ID from the params
  const serviceId = params?.id as string;

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);

        if (user && serviceId) {
          // Fetch the barbershop document
          const barbershopDoc = await getDoc(doc(db, 'barbershops', user.uid));

          if (barbershopDoc.exists()) {
            // get services array
            const services = barbershopDoc.data().services || [];

            // find service
            const serviceData = services.find((s: Service) => s.id === serviceId);

            if (serviceData) {
              setService(serviceData);

              // fetch styles for this service
              const stylesCollection = collection(db, 'styles');
              const stylesQuery = query(
                stylesCollection,
                where('serviceId', '==', serviceId),
                where('barberOrBarbershop', '==', user.uid)
              );

              const stylesSnapshot = await getDocs(stylesQuery);
              const stylesData: Style[] = [];

              stylesSnapshot.forEach(doc => {
                stylesData.push({ ...doc.data() as Style, docId: doc.id });
              });

              setStyles(stylesData);
            } else {
              setError('Service not found');
            }
          } else {
            setError('Barbershop not found');
          }
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('Failed to load service data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [user, serviceId]);

  const handleEditStyle = (style: Style) => {
    setCurrentStyle(style);
    setIsEditingStyle(true);
    setShowStyleModal(true);
  };

  const handleSaveStyle = async (style: Style) => {
    if (!user || !service) {
      setError('You must be logged in to perform this action.');
      return;
    }

    try {
      const { updateDoc, doc } = await import('firebase/firestore');

      if (isEditingStyle && style.docId) {
        // Update existing style
        await updateDoc(doc(db, 'styles', style.docId), {
          styleId: style.styleId,
          styleName: style.styleName,
          description: style.description,
          price: style.price,
          duration: style.duration,
          featuredImage: style.featuredImage,
          serviceId: style.serviceId,
          serviceCategoryId: style.serviceCategoryId,
          barberOrBarbershop: style.barberOrBarbershop,
          type: style.type
        });

        // Update local state
        setStyles(prevStyles =>
          prevStyles.map(s =>
            s.styleId === style.styleId ? style : s
          )
        );
      }

      // Close modal
      setShowStyleModal(false);
      setCurrentStyle(null);
      setIsEditingStyle(false);
      setError(null);
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
          where('barberOrBarbershop', '==', user?.uid)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Delete the style document
          const styleDoc = querySnapshot.docs[0];
          await deleteDoc(doc(db, 'styles', styleDoc.id));

          // Update local state immediately
          setStyles(prevStyles => prevStyles.filter(s => s.styleId !== styleId));
          setError(null);
        } else {
          setError('Style not found.');
        }
      } catch (err) {
        console.error('Error deleting style:', err);
        setError('Failed to delete style. Please try again.');
      }
    });
    setShowConfirmation(true);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <Link
          href="/dashboard/services"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Services
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-2"></div>
          <p>Loading service details...</p>
        </div>
      ) : service ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              {service.featuredImage ? (
                <div className="w-20 h-20 rounded-lg overflow-hidden mr-6 flex-shrink-0">
                  <img
                    src={service.featuredImage}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center mr-6 flex-shrink-0">
                  <i className="fas fa-cut text-3xl text-gray-400"></i>
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h1>
                <div className="flex items-center space-x-4">
                  {service.price && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      <i className="fas fa-dollar-sign mr-1"></i> ${service.price}
                    </span>
                  )}
                  {service.duration && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      <i className="fas fa-clock mr-1"></i> {service.duration}h
                    </span>
                  )}
                  <span className="ml-3 text-sm text-gray-500">
                    {styles.length} {styles.length === 1 ? 'style' : 'styles'}
                  </span>
                </div>
              </div>


            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-700">
                Available Styles
              </h2>
            </div>

            {styles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {styles.map(style => (
                  <div
                    key={style.styleId}
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="relative">
                      {style.featuredImage ? (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={style.featuredImage}
                            alt={style.styleName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gray-100 flex items-center justify-center">
                          <i className="fas fa-image text-4xl text-gray-300"></i>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{style.styleName}</h3>
                      <p className="text-xl font-bold text-black mb-4">₱{style.price}</p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditStyle(style)}
                          className="text-black hover:text-gray-700 transition-colors"
                        >
                          <i className="fas fa-edit text-lg"></i>
                        </button>
                        <button
                          className="text-black hover:text-gray-700 transition-colors"
                          onClick={() => handleDeleteStyle(style.styleId)}
                        >
                          <i className="fas fa-trash text-lg"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-5xl text-gray-300 mb-3">
                  <i className="fas fa-scissors"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No styles available</h3>
                <p className="text-gray-500">Add styles from the Services page to get started.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-6xl mb-4 text-gray-300"><i className="fas fa-cut"></i></div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Service not found</h3>
          <p className="text-gray-500 mb-6">The service you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            href="/dashboard/services"
            className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Services
          </Link>
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => confirmationAction()}
        title={confirmationTitle}
        message={confirmationMessage}
        confirmText="Delete"
        type="danger"
      />

      {service && currentStyle && (
        <StyleModal
          isOpen={showStyleModal}
          onClose={() => {
            setShowStyleModal(false);
            setCurrentStyle(null);
            setIsEditingStyle(false);
          }}
          onSave={handleSaveStyle}
          initialStyle={currentStyle}
          isEditing={isEditingStyle}
          services={service ? [service] : []}
        />
      )}
    </div>
  );
}
