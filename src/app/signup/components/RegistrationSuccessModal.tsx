'use client';

interface RegistrationSuccessModalParams {
  isVisible: boolean;
}

export default function RegistrationSuccessModal({ isVisible }: RegistrationSuccessModalParams) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      <div className="bg-white rounded-lg p-8 text-center max-w-md shadow-lg">
        <div className="mb-4">
          <i className="fas fa-check text-gray-900 text-4xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
        <p className="text-gray-600 mb-6">Your barbershop account has been created successfully.</p>
        <div className="bg-gray-50 rounded p-4 mb-6">
          <p className="text-sm text-gray-700">You will be redirected to the login page in a moment.</p>
        </div>
        <div className="flex justify-center">
          <div
            className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-900"
          ></div>
        </div>
      </div>
    </div>
  );
}

