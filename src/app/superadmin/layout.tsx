'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/superadmin/login') {
      setLoading(false);
      return;
    }

    // Check if superadmin is authenticated
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const superadminToken = localStorage.getItem('superadmin_token');
        const sessionExpiry = localStorage.getItem('superadmin_session_expiry');

        if (superadminToken && sessionExpiry) {
          const now = Date.now();
          if (now < parseInt(sessionExpiry)) {
            setIsAuthenticated(true);
          } else {
            // Session expired
            localStorage.removeItem('superadmin_token');
            localStorage.removeItem('superadmin_session_expiry');
            router.push('/superadmin/login');
          }
        } else {
          router.push('/superadmin/login');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('superadmin_token');
      localStorage.removeItem('superadmin_session_expiry');
      // Clear cookie as well
      document.cookie = 'superadmin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    router.push('/superadmin/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Allow login page to render without authentication
  if (pathname === '/superadmin/login') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* SuperAdmin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-crown text-white"></i>
                </div>
                <h1 className="text-xl font-bold text-black">ALOT SuperAdmin - Services</h1>
              </div>
            </div>
            


            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">SuperAdmin</span>
              <button
                onClick={handleLogout}
                className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-gray-500 text-sm">
            <p>ALOT SuperAdmin Panel - Restricted Access</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
