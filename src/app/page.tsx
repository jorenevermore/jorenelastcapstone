'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Check if user is already logged in
  const [user, userLoading] = useAuthState(auth);

  // if logged in, redirect to dashboard
  React.useEffect(() => {
    if (user && !userLoading) {
      router.push('/dashboard');
    }
  }, [user, userLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const idToken = await userCredential.user.getIdToken();

      document.cookie = `firebaseToken=${idToken}; path=/; max-age=${60 * 60 * 24}`;

      router.push('/dashboard');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <nav className="bg-white border-b border-gray-200 w-full">
        <div className="container-custom py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="bg-white p-1.5 rounded inline-block">
                  <Image src="/images/mainalotlogo.png" alt="ALOT Logo" width={32} height={32} className="object-contain" />
                </div>
                <span className="ml-2 text-base font-semibold text-gray-800">ALOT</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/signup" className="btn btn-primary">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
          <Image
            src="/images/homepagebg.jpg"
            alt="Background"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>

        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12 animate-slideUp">
              <h1 className="text-3xl font-bold text-white mb-6">
                Streamline your barbershop operations with ALOT
              </h1>
              <p className="text-xl font-semibold text-white mb-8">
                Connect with customers, manage appointments, and grow your business.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/signup" className="btn btn-primary">
                  Get Started With ALOT
                </Link>
                <button
                  onClick={() => window.open('https://play.google.com/store', '_blank')}
                  className="btn btn-secondary"
                >
                  <i className="fas fa-mobile-alt mr-2"></i>
                  Download Client App
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md card animate-fadeIn">
                <div className="card-header">
                  <h2 className="text-lg font-bold text-center text-black">Enter your credentials</h2>
                </div>
                <div className="card-body">
                  <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        <p>{error}</p>
                      </div>
                    )}
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                        required
                        disabled={loading}
                        placeholder="your@barbershop.com"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="password" className="form-label">Password</label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="form-input pr-10"
                          required
                          disabled={loading}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <i className="fas fa-eye-slash"></i>
                          ) : (
                            <i className="fas fa-eye"></i>
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Logging in...
                          </span>
                        ) : 'Login'}
                      </button>
                    </div>
                  </form>
                </div>
                <div className="card-footer text-center">
                  <p className="text-sm text-gray-700">
                    Don't have an account? <Link href="/signup" className="text-black hover:underline font-medium">Register your barbershop</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Features</h2>
            <p className="text-body text-lg max-w-3xl mx-auto">
              Everything you need to manage your barbershop efficiently
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="text-black text-3xl mb-4 flex justify-center">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h3 className="heading-4 text-center mb-4">Appointment Management</h3>
              <p className="text-body text-center">
                Easily manage and track all appointments. View daily, weekly, and monthly schedules at a glance.
              </p>
            </div>
            <div className="card p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="text-black text-3xl mb-4 flex justify-center">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="heading-4 text-center mb-4">Client Database</h3>
              <p className="text-body text-center">
                Keep track of client information, preferences, and appointment history for personalized service.
              </p>
            </div>
            <div className="card p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="text-black text-3xl mb-4 flex justify-center">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="heading-4 text-center mb-4">Business Analytics</h3>
              <p className="text-body text-center">
                Get insights into your business performance with detailed reports and analytics.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-gray-50 py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">How It Works</h2>
            <p className="text-body text-lg max-w-3xl mx-auto">
              A simple process to get your barbershop online
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4" style={{ backgroundColor: '#BF8F63' }}>1</div>
              <h3 className="heading-4 mb-4">Register</h3>
              <p className="text-body">Sign up your barbershop with basic information</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4" style={{ backgroundColor: '#BF8F63' }}>2</div>
              <h3 className="heading-4 mb-4">Set Up</h3>
              <p className="text-body">Add your services, staff, and business hours</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4" style={{ backgroundColor: '#BF8F63' }}>3</div>
              <h3 className="heading-4 mb-4">Connect</h3>
              <p className="text-body">Clients find you through the mobile app</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4" style={{ backgroundColor: '#BF8F63' }}>4</div>
              <h3 className="heading-4 mb-4">Manage</h3>
              <p className="text-body">Handle bookings and grow your business</p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white py-20">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12">
              <h2 className="heading-2 mb-6">About ALOT</h2>
              <p className="text-body mb-6">
                ALOT (which means "haircut" in Cebuano) is a comprehensive barbershop management system designed to streamline operations for barbershop owners and staff.
              </p>
              <p className="text-body mb-6">
                Our platform connects barbershops with clients through a mobile application, allowing for easy appointment booking and management.
              </p>
              <p className="text-body">
                The admin web portal provides barbershop managers with powerful tools to manage appointments, staff, and business operations efficiently.
              </p>
            </div>
            <div className="md:w-1/2">
              <div className="card p-8 bg-gray-50 border-gray-100">
                <h3 className="heading-3 mb-6">Why Choose ALOT?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-white mr-3" style={{ backgroundColor: '#BF8F63' }}>
                      <i className="fas fa-check text-sm"></i>
                    </div>
                    <span className="text-body">Easy-to-use interface designed specifically for barbershops</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-white mr-3" style={{ backgroundColor: '#BF8F63' }}>
                      <i className="fas fa-check text-sm"></i>
                    </div>
                    <span className="text-body">Seamless integration between admin portal and client mobile app</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-white mr-3" style={{ backgroundColor: '#BF8F63' }}>
                      <i className="fas fa-check text-sm"></i>
                    </div>
                    <span className="text-body">Real-time appointment updates and notifications</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-white mr-3" style={{ backgroundColor: '#BF8F63' }}>
                      <i className="fas fa-check text-sm"></i>
                    </div>
                    <span className="text-body">Secure data storage and management</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-white mr-3" style={{ backgroundColor: '#BF8F63' }}>
                      <i className="fas fa-check text-sm"></i>
                    </div>
                    <span className="text-body">Detailed business analytics and reporting</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-black text-white py-10">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Ready to grow your barbershop business?</h2>
          <p className="text-base mb-6 max-w-3xl mx-auto text-white">
            Join hundreds of barbershops already using ALOT to manage their business and connect with customers.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/signup" className="btn bg-white text-black hover:bg-gray-100">
              Register Your Barbershop
            </Link>
            <button
              onClick={() => window.open('https://play.google.com/store', '_blank')}
              className="btn bg-white text-black border border-white hover:bg-gray-100"
            >
              <i className="fas fa-mobile-alt mr-2"></i>
              Download Client App
            </button>
          </div>
        </div>
      </section>
      <footer className="bg-black text-white py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <div className="bg-white p-1.5 rounded-md inline-block mb-3">
                <Image src="/images/mainalotlogo.png" alt="ALOT Logo" width={30} height={30} className="object-contain" />
              </div>
              <p className="text-gray-400 mb-4">
                Alot on TOP!
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-facebook-f text-gray-400"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-twitter text-gray-400"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-instagram text-gray-400"></i>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3 text-white">Product</h3>
              <ul className="space-y-1.5">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Testimonials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3 text-white">Company</h3>
              <ul className="space-y-1.5">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3 text-white">Legal</h3>
              <ul className="space-y-1.5">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-800 text-center md:text-left md:flex md:justify-between md:items-center">
            <p className="text-gray-400 text-xs">
              &copy; {new Date().getFullYear()} ALOT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
