'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../lib/firebase';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // If no user and not loading, don't render anything (will redirect)
  if (!user && !loading) {
    return null;
  }

  return (
    <div className="bg-gray-100 min-h-screen" style={{ backgroundColor: '#f3f4f6' }}>
      <Sidebar />
      <div className="ml-64" style={{ backgroundColor: '#f3f4f6' }}>
        <Header />
        <main className="pt-12 min-h-screen" style={{ backgroundColor: '#f3f4f6' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
