'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Service, Style } from '../types';
import Link from 'next/link';
import { ConfirmationModal } from '../components';

export default function ServiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [user] = useAuthState(auth);
  const [service, setService] = useState<Service | null>(null);
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Confirmation modal states
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationAction, setConfirmationAction] = useState<() => Promise<void>>(() => Promise.resolve());
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Get the service ID from the params
  const serviceId = params?.id as string;

  // Fetch service data
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);

        if (user && serviceId) {
          // Fetch the barbershop document
          const barbershopDoc = await getDoc(doc(db, 'barbershops', user.uid));

          if (barbershopDoc.exists()) {
            // Get services array
            const services = barbershopDoc.data().services || [];

            // Find the specific service
            const serviceData = services.find((s: Service) => s.id === serviceId);

            if (serviceData) {
              setService(serviceData);

              // Fetch styles for this service
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
          await router.push(`/dashboard/services/${serviceId}`);
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
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${service.status === 'Available' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}
                  >
                    {service.status === 'Available' ? (
                      <><i className="fas fa-check-circle mr-1"></i> {service.status}</>
                    ) : (
                      <><i className="fas fa-times-circle mr-1"></i> {service.status}</>
                    )}
                  </span>
                  <span className="ml-3 text-sm text-gray-500">
                    {styles.length} {styles.length === 1 ? 'style' : 'styles'}
                  </span>
                </div>
              </div>

              <div className="ml-auto">
                <Link
                  href={`/dashboard/services?edit=${service.id}`}
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i> Edit Service
                </Link>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-700">
                Available Styles
              </h2>
              <Link
                href={`/dashboard/services?newStyle=${service.id}`}
                className="inline-flex items-center px-3 py-1.5 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
              >
                <i className="fas fa-plus mr-1.5"></i> Add Style
              </Link>
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
                      <div className="absolute top-3 right-3 flex space-x-2">
                        <Link
                          href={`/dashboard/services?editStyle=${style.styleId}`}
                          className="p-2 bg-white rounded-full shadow-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          className="p-2 bg-white rounded-full shadow-md text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                          onClick={() => handleDeleteStyle(style.styleId)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{style.styleName}</h3>
                      <div className="flex justify-between items-center">
                        <p className="text-xl font-bold text-black">₱{style.price}</p>
                        <Link
                          href={`/dashboard/services?editStyle=${style.styleId}`}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <i className="fas fa-chevron-right"></i>
                        </Link>
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
                <p className="text-gray-500 mb-4">Add your first style to this service to get started.</p>
                <Link
                  href={`/dashboard/services?newStyle=${service.id}`}
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i> Add Your First Style
                </Link>
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
    </div>
  );
}
