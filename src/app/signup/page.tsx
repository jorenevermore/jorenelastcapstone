'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth, db } from '../../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, GeoPoint } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { geohashForLocation } from 'geofire-common';
import SignupProgressBar from './components/SignupProgressBar';
import SignupStep1 from './components/SignupStep1';
import SignupStep2 from './components/SignupStep2';
import RegistrationSuccessModal from './components/RegistrationSuccessModal';

export default function SignupPage() {

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  // check if currently logged in
  const [user, userLoading] = useAuthState(auth);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !userLoading && !showSuccess && step === 1) {
      router.push('/dashboard');
    }
  }, [user, userLoading, router, showSuccess, step]);

  // redirect to landing after successful registration
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);


    if (!name || !phone || !location || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const geohash = geohashForLocation([location.lat, location.lng]);

      const barbershopId = user.uid;
      const createdAt = Date.now();

      await setDoc(doc(db, 'barbershops', barbershopId), {
        barbershopId,
        name,
        phone,
        email,
        loc: {
          coordinates: new GeoPoint(location.lat, location.lng),
          geohash,
        },
        isOpen: false,
        barbers: [],
        services: [],
        createdAt,
        status: 'active',
      });

      // signs out user
      await auth.signOut();

      // loading screen after successful registration
      setLoading(false);
      setError(null);
      setShowSuccess(true);
    } catch (error) {
      console.error('Signup error:', error);
      setError((error as Error).message);
      setLoading(false);
      setShowSuccess(false);
    }
  };

  const nextStep = () => {
    setError(null);
    setStep(step + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="fixed inset-0 z-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("/images/homepagebg.jpg")',
          backgroundSize: 'cover',
          filter: 'contrast(120%) brightness(105%)'
        }}></div>
      </div>

      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Image src="/images/mainalotlogo.png" alt="ALOT Logo" width={36} height={36} className="object-contain" />
              <span className="ml-2 font-semibold text-gray-900">ALOT</span>
            </Link>
            <div>
              <Link href="/" className="text-gray-700 hover:text-black font-medium transition-colors duration-200">
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-custom py-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 animate-fadeIn">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Register Your Barbershop</h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Join our platform and connect with customers through our mobile app
            </p>
          </div>

          <SignupProgressBar step={step} />

          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {step === 1 ? 'Barbershop Information' : 'Account Information'}
              </h2>
            </div>
            <div className="p-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm animate-fadeIn">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    </div>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSignup}>
                {step === 1 && (
                  <SignupStep1
                    name={name}
                    phone={phone}
                    location={location}
                    setName={setName}
                    setPhone={setPhone}
                    setLocation={setLocation}
                    handleNext={nextStep}
                  />
                )}

                {step === 2 && (
                  <SignupStep2
                    email={email}
                    password={password}
                    confirmPassword={confirmPassword}
                    showPassword={showPassword}
                    loading={loading}
                    setEmail={setEmail}
                    setPassword={setPassword}
                    setConfirmPassword={setConfirmPassword}
                    setShowPassword={setShowPassword}
                    handleBack={prevStep}
                  />
                )}
              </form>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Already have an account? <Link href="/" className="text-black hover:underline font-medium transition-colors">Login</Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-gray-500 text-sm animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <p>By registering, you agree to our <a href="#" className="text-black hover:underline transition-colors">Terms of Service</a> and <a href="#" className="text-black hover:underline transition-colors">Privacy Policy</a>.</p>
          </div>
        </div>
      </div>

      <RegistrationSuccessModal isVisible={showSuccess} />

      <footer className="bg-white border-t border-gray-200 py-6 mt-12 relative z-10">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Image src="/images/mainalotlogo.png" alt="ALOT Logo" width={32} height={32} className="object-contain" />
              <span className="ml-2 font-semibold text-gray-900">ALOT</span>
            </div>
            <div className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} ALOT. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

