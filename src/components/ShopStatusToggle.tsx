'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { BarbershopService } from '../lib/services/barbershop/BarbershopService';
import ConfirmationModal from '../app/dashboard/appointments/components/ConfirmationModal';

const ShopStatusToggle: React.FC = () => {
  const [user] = useAuthState(auth);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopStatus = async () => {
      if (!user) return;
      try {
        const service = new BarbershopService(db);
        const result = await service.getProfile(user.uid);
        if (result.success && result.data) {
          setIsOpen(result.data.isOpen || false);
        }
      } catch (err) {
        console.error('Error fetching shop status:', err);
      }
    };

    fetchShopStatus();
  }, [user]);

  const handleToggleClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const service = new BarbershopService(db);
      
      const newStatus = !isOpen;
      const result = await service.updateProfile(user.uid, { isOpen: newStatus });

      if (result.success) {
        setIsOpen(newStatus);
        setShowConfirmation(false);
      } else {
        setError(result.message || 'Failed to update shop status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <style>{`
        @keyframes breathing {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }
        .breathing-dot {
          animation: breathing 2s ease-in-out infinite;
        }
      `}</style>

      <button
        onClick={handleToggleClick}
        disabled={loading}
        className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
          isOpen
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isOpen ? 'Shop is Open' : 'Shop is Closed'}
      >
        {isOpen && (
          <span className="breathing-dot w-2 h-2 bg-green-500 rounded-full"></span>
        )}
        <i className={`fas ${isOpen ? 'fa-door-open' : 'fa-door-closed'} text-xs`}></i>
        <span>{isOpen ? 'Open' : 'Closed'}</span>
      </button>

      {error && (
        <div className="fixed top-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirmation}
        title={`Set Shop as ${isOpen ? 'Closed' : 'Open'}?`}
        message={`Are you sure you want to set your shop as ${isOpen ? 'closed' : 'open'}?`}
        confirmText="Confirm"
        onClose={handleCancel}
        onConfirm={handleConfirm}
        confirmColor={isOpen ? 'bg-red-500' : 'bg-green-500'}
      />
    </>
  );
};

export default ShopStatusToggle;

