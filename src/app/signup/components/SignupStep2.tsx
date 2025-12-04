'use client';

interface AccountInfoFormParams {
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  loading: boolean;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setShowPassword: (value: boolean) => void;
  handleBack: () => void;
}

export default function SignupStep2({
  email,
  password,
  confirmPassword,
  showPassword,
  loading,
  setEmail,
  setPassword,
  setConfirmPassword,
  setShowPassword,
  handleBack,
}: AccountInfoFormParams) {
  return (
    <div className="space-y-6">
      {/* Email */}
      <div className="mb-5">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address*</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-envelope text-gray-400 group-hover:text-black transition-colors duration-200"></i>
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors duration-200"
            required
            placeholder="e.g. your@barbershop.com"
          />
          {email && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><i className="fas fa-check text-green-500"></i></div>}
        </div>
        <p className="mt-1 text-xs text-gray-500">You'll use this email to log in to your account</p>
      </div>

      {/* Password */}
      <div className="mb-5">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-lock text-gray-400 group-hover:text-black transition-colors duration-200"></i>
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors duration-200"
            required
            placeholder="At least 6 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-black transition-colors"
          >
            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="mb-5">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password*</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-lock text-gray-400 group-hover:text-black transition-colors duration-200"></i>
          </div>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors duration-200"
            required
            placeholder="Confirm your password"
          />
          {password && confirmPassword && password === confirmPassword && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><i className="fas fa-check text-green-500"></i></div>}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2.5 text-gray-700 text-sm font-medium rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors duration-200"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2.5 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#BF8F63' }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#A67C52')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#BF8F63')}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registering...
            </span>
          ) : (
            <>
              Register Barbershop
              <i className="fas fa-check ml-2"></i>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

