import React, { useEffect, useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = ({ fullScreen = true, delay = 300 }) => {
  const [showLoader, setShowLoader] = useState(false);
  
  // Only show loading screen after a delay to prevent flashing for quick loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  if (!showLoader) return null;
  
  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div 
          className={`fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'min-h-[200px]'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="flex flex-col items-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="animate-spin text-primary">
              <FiLoader className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen; 