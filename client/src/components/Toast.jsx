import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in`}>
      <div className="flex-1">{message}</div>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 focus:outline-none"
      >
        ×
      </button>
    </div>
  );
};

export default Toast; 