export interface GlobalService {
  id: string;
  title: string;
  featuredImage: string;
}

export interface SubscriptionPackage {
  id: string;
  title: string;
  description: string;
  amount: number;
  overall_discount: {
    type: 'percentage' | 'fixed';
    amount: number;
  };
}

export type TabType = 'services' | 'subscriptions';

export interface TabConfig {
  id: TabType;
  label: string;
  icon: string;
}

export let TAB_CONFIG: TabConfig[] = [
  { id: 'services', label: 'Global Services', icon: 'fas fa-cut' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'fas fa-tag' }
];

