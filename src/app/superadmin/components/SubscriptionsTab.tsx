'use client';

import React, { useState } from 'react';
import { addSubscription, updateSubscription, deleteSubscription } from '../services/superAdminService';
import { SubscriptionPackage } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { EmptyState } from './EmptyState';
import { SubscriptionCard } from './SubscriptionCard';
import { SubscriptionFormModal } from './SubscriptionFormModal';

interface SubscriptionsTabProps {
  subscriptions: SubscriptionPackage[];
  onRefresh: () => Promise<void>;
}

const INITIAL_SUBSCRIPTION: Partial<SubscriptionPackage> = {
  title: '',
  description: '',
  amount: 0,
  overall_discount: { type: 'percentage', amount: 0 }
};

export function SubscriptionsTab({ subscriptions, onRefresh }: SubscriptionsTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newSubscription, setNewSubscription] = useState<Partial<SubscriptionPackage>>(INITIAL_SUBSCRIPTION);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionPackage | null>(null);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<SubscriptionPackage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateSubscription = (): boolean => {
    if (!newSubscription.title?.trim() || !newSubscription.description?.trim()) {
      setError('Title and description are required');
      return false;
    }
    return true;
  };

  const handleAddSubscription = async () => {
    if (!validateSubscription()) return;
    try {
      setIsLoading(true);
      setError(null);
      await addSubscription(newSubscription as Omit<SubscriptionPackage, 'id'>);
      resetForm();
      setShowAddModal(false);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSubscription = async () => {
    if (!editingSubscription || !validateSubscription()) return;
    try {
      setIsLoading(true);
      setError(null);
      await updateSubscription(editingSubscription.id, newSubscription as Omit<SubscriptionPackage, 'id'>);
      resetForm();
      setEditingSubscription(null);
      setShowEditModal(false);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubscription = async () => {
    if (!subscriptionToDelete) return;
    try {
      await deleteSubscription(subscriptionToDelete.id);
      setShowDeleteModal(false);
      setSubscriptionToDelete(null);
      await onRefresh();
    } catch (err) {
      setError('Failed to delete subscription');
    }
  };

  const resetForm = () => {
    setNewSubscription(INITIAL_SUBSCRIPTION);
    setError(null);
  };

  const openEditModal = (subscription: SubscriptionPackage) => {
    setEditingSubscription(subscription);
    setNewSubscription(subscription);
    setShowEditModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Subscriptions</h2>
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

      {subscriptions.length === 0 ? (
        <EmptyState icon="fas fa-tag" title="No Subscriptions" description="No subscriptions added yet" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={() => openEditModal(subscription)}
              onDelete={() => {
                setSubscriptionToDelete(subscription);
                setShowDeleteModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <SubscriptionFormModal
        isOpen={showAddModal}
        title="Add New Subscription"
        subscription={newSubscription}
        error={error}
        isLoading={isLoading}
        onSubscription={setNewSubscription}
        onSubmit={handleAddSubscription}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      />

      {/* Edit Modal */}
      <SubscriptionFormModal
        isOpen={showEditModal}
        title="Edit Subscription"
        subscription={newSubscription}
        error={error}
        isLoading={isLoading}
        onSubscription={setNewSubscription}
        onSubmit={handleUpdateSubscription}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        subscriptionId={editingSubscription?.id}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Subscription"
        message={`Are you sure you want to delete "${subscriptionToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous
        onConfirm={handleDeleteSubscription}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

