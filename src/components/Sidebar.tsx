'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { auth } from '../lib/firebase';
import { useNotifications } from '../hooks/useNotifications';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount } = useNotifications();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'fas fa-tachometer-alt' },
    { name: 'Appointments', path: '/dashboard/appointments', icon: 'fas fa-calendar-alt' },
    { name: 'Services', path: '/dashboard/services', icon: 'fas fa-cut' },
    { name: 'Analytics', path: '/dashboard/analytics', icon: 'fas fa-chart-line' },
    { name: 'Staff', path: '/dashboard/staff', icon: 'fas fa-users' },
    { name: 'Notifications', path: '/dashboard/notifications', icon: 'fas fa-bell' },
    { name: 'Settings', path: '/dashboard/settings', icon: 'fas fa-cog' },
  ];

  return (
    <div className="bg-black text-white h-screen w-64 fixed left-0 top-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center">
          <div className="bg-white p-1.5 rounded-md inline-block mr-3">
            <Image src="/images/mainalotlogo.png" alt="ALOT Logo" width={30} height={30} className="object-contain" />
          </div>
          <span className="text-xl font-semibold text-white">ALOT</span>
        </div>
      </div>

      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors relative ${
                  isActive(item.path)
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <i className={`${item.icon} w-5 mr-3`}></i>
                <span>{item.name}</span>
                {item.name === 'Notifications' && unreadCount > 0 && (
                  <span className="absolute top-2 left-8 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
        <button
          onClick={async () => {
            try {
              // Sign out from Firebase
              await auth.signOut();

              // Clear the Firebase token cookie
              document.cookie = "firebaseToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

              // Redirect to login page
              router.push('/');
            } catch (error) {
              console.error('Error signing out:', error);
            }
          }}
          className="flex items-center text-gray-400 hover:text-white transition-colors w-full text-left"
        >
          <i className="fas fa-sign-out-alt mr-3"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
