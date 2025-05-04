import React from 'react';
import { FiLoader } from 'react-icons/fi';

const LoadingScreen = ({ fullScreen = true }) => {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'min-h-[200px]'}`}>
      <div className="flex flex-col items-center">
        <div className="animate-spin text-purple-600">
          <FiLoader size={32} />
        </div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 