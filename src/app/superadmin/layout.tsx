'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: '#BF8F63' }}>
              <i className="fas fa-crown text-white text-sm"></i>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">ALOT Admin</h1>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <i className="fas fa-sign-out-alt mr-1.5"></i>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {children}
      </main>
    </div>
  );
}
