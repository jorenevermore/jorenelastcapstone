'use client';

import React, { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import { SuperAdminServiceManagement } from './services/SuperAdminServiceManagement';
import { SuperAdminSubscriptionManagement } from './services/SuperAdminSubscriptionService';
import { ServicesTab, SubscriptionsTab, TabNavigation, LoadingSpinner, ErrorAlert } from './components';
import type { GlobalService } from '../../types/services';
import { SubscriptionPackage, TabType } from './types';

const superAdminServiceManagement = new SuperAdminServiceManagement(db, storage);
const superAdminSubscriptionManagement = new SuperAdminSubscriptionManagement(db);

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
      const [servicesResult, subscriptionsResult] = await Promise.all([
        superAdminServiceManagement.getAllServices(),
        superAdminSubscriptionManagement.getAllSubscriptions()
      ]);
      
      if (servicesResult.success && servicesResult.data) {
        setServices(servicesResult.data as GlobalService[]);
      }
      
      if (subscriptionsResult.success && subscriptionsResult.data) {
        setSubscriptions(subscriptionsResult.data as SubscriptionPackage[]);
      }
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
