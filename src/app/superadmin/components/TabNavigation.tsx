'use client';

import React from 'react';
import { TabType, TAB_CONFIG } from '../types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export let TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="flex gap-1 border-b border-gray-200">
      {TAB_CONFIG.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === tab.id
              ? 'text-gray-900 border-b-2'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          style={activeTab === tab.id ? { borderBottomColor: '#BF8F63' } : {}}
        >
          <i className={`${tab.icon} text-base`}></i>
          {tab.label}
        </button>
      ))}
    </div>
  );
};

