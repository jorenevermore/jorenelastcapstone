
import type { GlobalService } from '../../types/services';
import type { SubscriptionPackage } from '../../types/subscription';

export type { GlobalService, SubscriptionPackage };

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

