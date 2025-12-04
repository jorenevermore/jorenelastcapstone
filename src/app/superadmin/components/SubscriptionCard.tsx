'use client';

import React from 'react';
import { SubscriptionPackage } from '../types';

interface SubscriptionCardProps {
  subscription: SubscriptionPackage;
  onEdit: () => void;
  onDelete: () => void;
}

export let SubscriptionCard = ({
  subscription,
  onEdit,
  onDelete
}: SubscriptionCardProps) => (
  <div className="bg-white border border-gray-200 rounded p-3 hover:shadow-sm transition-shadow">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 text-sm">{subscription.title}</h3>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{subscription.description}</p>
        <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
          <span>₱{subscription.amount}</span>
          <span>-{subscription.overall_discount.amount}{subscription.overall_discount.type === 'percentage' ? '%' : '₱'}</span>
        </div>
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

