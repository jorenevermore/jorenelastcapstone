'use client';

import React from 'react';
import { SubscriptionPackage } from '../types';
import { Modal } from './Modal';

interface SubscriptionFormModalProps {
  isOpen: boolean;
  title: string;
  subscription: Partial<SubscriptionPackage>;
  error: string | null;
  isLoading: boolean;
  onSubscription: (subscription: Partial<SubscriptionPackage>) => void;
  onSubmit: () => void;
  onClose: () => void;
  subscriptionId?: string;
}

export let SubscriptionFormModal = ({
  isOpen,
  title,
  subscription,
  error,
  isLoading,
  onSubscription,
  onSubmit,
  onClose,
  subscriptionId
}: SubscriptionFormModalProps) => (
  <Modal isOpen={isOpen} title={title} onClose={onClose}>
    {error && <div className="bg-red-50 text-red-800 px-2 py-1.5 rounded mb-3 text-xs">{error}</div>}
    <div className="space-y-3">
      {subscriptionId && (
        <div className="bg-gray-50 p-2 rounded border border-gray-200">
          <p className="text-xs text-gray-600 mb-0.5">ID</p>
          <p className="text-xs font-mono text-gray-900 break-all">{subscriptionId}</p>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Subscription Name</label>
        <input
          type="text"
          placeholder="e.g., ALOT Premium"
          value={subscription.title || ''}
          onChange={(e) => onSubscription({ ...subscription, title: e.target.value })}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
        <textarea
          placeholder="e.g., Premium members receive an automatic 20% discount..."
          value={subscription.description || ''}
          onChange={(e) => onSubscription({ ...subscription, description: e.target.value })}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-600"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Price</label>
        <input
          type="number"
          placeholder="e.g., 499"
          value={subscription.amount || 0}
          onChange={(e) => onSubscription({ ...subscription, amount: parseInt(e.target.value) || 0 })}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={subscription.overall_discount?.type || 'percentage'}
          onChange={(e) => onSubscription({
            ...subscription,
            overall_discount: {
              type: e.target.value as 'percentage' | 'fixed',
              amount: subscription.overall_discount?.amount || 0
            }
          })}
          className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-600"
        >
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed (₱)</option>
        </select>
        <input
          type="number"
          placeholder="Amount"
          value={subscription.overall_discount?.amount || 0}
          onChange={(e) => onSubscription({
            ...subscription,
            overall_discount: {
              type: subscription.overall_discount?.type || 'percentage',
              amount: parseInt(e.target.value) || 0
            }
          })}
          className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
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

