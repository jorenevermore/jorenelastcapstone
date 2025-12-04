'use client';

interface SignupProgressBarParams {
  step: number;
}

export default function SignupProgressBar({ step }: SignupProgressBarParams) {
  return (
    <div className="mb-10 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center justify-between">
        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-in-out"
            style={{ width: step >= 2 ? '100%' : '0%', backgroundColor: '#BF8F63' }}
          ></div>
        </div>
      </div>
      <div className="flex justify-between mt-3">
        <div className="text-center">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm transition-all duration-300 text-white" 
            style={{ backgroundColor: step >= 1 ? '#BF8F63' : '#E5E7EB', color: step >= 1 ? 'white' : '#4B5563' }}
          >
            1
          </div>
          <span className="text-sm font-medium text-gray-800">Shop Info</span>
        </div>
        <div className="text-center">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm transition-all duration-300 text-white" 
            style={{ backgroundColor: step >= 2 ? '#BF8F63' : '#E5E7EB', color: step >= 2 ? 'white' : '#4B5563' }}
          >
            2
          </div>
          <span className="text-sm font-medium text-gray-800">Account</span>
        </div>
      </div>
    </div>
  );
}

