'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import NotificationDropdown from './NotificationDropdown';
import ShopStatusToggle from './ShopStatusToggle';

const Header = () => {
  const pathname = usePathname();
  const [user] = useAuthState(auth);


  const getPageTitle = () => {
    const path = pathname.split('/').pop() || '';

    const pageTitles: Record<string, string> = {
      'dashboard': 'Dashboard',
      'appointments': 'Appointments',
      'services': 'Services',
      'staff': 'Staff',
      'settings': 'Settings',
      'profile': 'Profile',
      '': 'Dashboard'
    };

    return pageTitles[path] || 'Dashboard';
  };

  return (
    <header className="bg-white border-b border-gray-200 h-12 fixed top-0 right-0 left-64 z-10">
      <div className="flex justify-between items-center h-full px-4">
        <h1 className="text-lg font-semibold text-black">{getPageTitle()}</h1>
        <div className="flex items-center space-x-3">
          <ShopStatusToggle />
          <NotificationDropdown />

          <div className="flex items-center">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white mr-2 text-xs font-semibold" style={{ backgroundColor: '#BF8F63' }}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-xs text-gray-700">{user?.email || 'User'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
