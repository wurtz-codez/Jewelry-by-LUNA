import React from 'react';
import { FiLoader } from 'react-icons/fi';

const LoadingScreen = ({ fullScreen = true }) => {
  return (
    <div className={`fixed inset-0 z-50 bg-white flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'min-h-[200px]'}`}>
      <div className="flex flex-col items-center">
        <div className="animate-spin text-primary">
          <FiLoader className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 