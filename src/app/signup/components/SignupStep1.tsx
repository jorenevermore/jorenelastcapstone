'use client';

import BarbershopLocationMap from '../../../components/BarbershopLocationMap';

interface BarbershopInfoFormParams {
  name: string;
  phone: string;
  location: { lat: number; lng: number } | null;
  setName: (value: string) => void;
  setPhone: (value: string) => void;
  setLocation: (location: { lat: number; lng: number }) => void;
  handleNext: () => void;
}

export default function SignupStep1({
  name,
  phone,
  location,
  setName,
  setPhone,
  setLocation,
  handleNext,
}: BarbershopInfoFormParams) {
  return (
    <div className="space-y-6">
      <div className="mb-5">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Barbershop Name*</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-store text-gray-400 group-hover:text-black transition-colors duration-200"></i>
          </div>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors duration-200"
            required
            placeholder="e.g. John's Barbershop"
          />
          {name && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><i className="fas fa-check text-green-500"></i></div>}
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-phone text-gray-400 group-hover:text-black transition-colors duration-200"></i>
          </div>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors duration-200"
            required
            placeholder="e.g. +63 912 345 6789"
          />
          {phone && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><i className="fas fa-check text-green-500"></i></div>}
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">Barbershop Location on Map*</label>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <BarbershopLocationMap onLocationSelect={setLocation} initialLocation={location} />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center px-4 py-2.5 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          style={{ backgroundColor: '#BF8F63' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A67C52'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#BF8F63'}
        >
          Continue to Account Setup
          <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  );
}

