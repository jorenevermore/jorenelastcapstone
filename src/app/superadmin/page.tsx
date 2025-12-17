'use client';

import React, { useState, useEffect } from 'react';
import { ServicesTab, SubscriptionsTab, TabNavigation, LoadingSpinner, ErrorAlert } from './components';
import { fetchServices, fetchSubscriptions } from './services/superAdminService';
import type { GlobalService } from '../../types/services';
import { SubscriptionPackage, TabType } from './types';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [services, setServices] = useState<GlobalService[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [servicesData, subscriptionsData] = await Promise.all([
        fetchServices(),
        fetchSubscriptions()
      ]);
      setServices(servicesData);
      setSubscriptions(subscriptionsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Manage services and subscriptions</p>
      </div>
      {error && <ErrorAlert message={error} />}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'services' && (
        <ServicesTab services={services} onRefresh={loadData} />
      )}
      {activeTab === 'subscriptions' && (
        <SubscriptionsTab subscriptions={subscriptions} onRefresh={loadData} />
      )}
    </div>
  );
}
